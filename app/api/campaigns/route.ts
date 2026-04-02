import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCampaignSchema } from "@/lib/validations";
import { CampaignStatus, Prisma } from "@prisma/client";
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
    const status = searchParams.get("status") as CampaignStatus | null;
    const channel = searchParams.get("channel")?.trim();
    const sortBy = (searchParams.get("sortBy") ?? "createdAt") as keyof Prisma.CampaignOrderByWithRelationInput;
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const where: Prisma.CampaignWhereInput = {
      orgId: session.user.orgId,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(status && { status }),
      ...(channel && { channel: { contains: channel, mode: "insensitive" } }),
    };

    const [total, campaigns] = await prisma.$transaction([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { creatives: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: campaigns,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/campaigns]", err);
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
    const parsed = createCampaignSchema.parse(body);

    const campaign = await prisma.$transaction(async (tx) => {
      const created = await tx.campaign.create({
        data: { ...parsed, orgId: session.user.orgId },
        include: { _count: { select: { creatives: true } } },
      });

      await tx.activity.create({
        data: {
          type: "CAMPAIGN_CREATED",
          description: `Campaign created: ${created.name}`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return created;
    });

    return NextResponse.json(
      { data: campaign, message: "Campaign created successfully." },
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
    console.error("[POST /api/campaigns]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
