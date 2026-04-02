// app/api/creatives/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCreativeSchema } from "@/lib/validations";
import { CreativeStatus, CreativeType, ComplianceStatus, Prisma } from "@prisma/client";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status") as CreativeStatus | null;
    const type = searchParams.get("type") as CreativeType | null;
    const complianceStatus = searchParams.get("complianceStatus") as ComplianceStatus | null;
    const campaignId = searchParams.get("campaignId");
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const where: Prisma.CreativeWhereInput = {
      orgId: session.user.orgId,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(status && { status }),
      ...(type && { type }),
      ...(complianceStatus && { complianceStatus }),
      ...(campaignId && { campaignId }),
    };

    const [total, creatives] = await prisma.$transaction([
      prisma.creative.count({ where }),
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { id: true, name: true } },
          _count: { select: { complianceFlags: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: creatives,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/creatives]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createCreativeSchema.parse(body);

    if (parsed.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: parsed.campaignId, orgId: session.user.orgId },
        select: { id: true },
      });
      if (!campaign) {
        return NextResponse.json(
          { error: "Bad Request", message: "Campaign not found in your organization.", statusCode: 400 },
          { status: 400 }
        );
      }
    }

    const creative = await prisma.$transaction(async (tx) => {
      const created = await tx.creative.create({
        data: {
          ...parsed,
          campaignId: parsed.campaignId ?? null,
          predictedCtr: parsed.predictedCtr ?? null,
          orgId: session.user.orgId,
        },
        include: {
          campaign: { select: { id: true, name: true } },
          _count: { select: { complianceFlags: true } },
        },
      });

      await tx.activity.create({
        data: {
          type: "CREATIVE_CREATED",
          description: `Creative created: ${created.name}`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return created;
    });

    return NextResponse.json(
      { data: creative, message: "Creative created successfully." },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      const details: Record<string, string[]> = {};
      err.errors.forEach((e) => {
        const key = e.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(e.message);
      });
      return NextResponse.json(
        { error: "Validation Error", message: "Please correct the errors below.", statusCode: 422, details },
        { status: 422 }
      );
    }
    console.error("[POST /api/creatives]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
