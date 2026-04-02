// app/api/creatives/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCreativeSchema } from "@/lib/validations";
import { ZodError } from "zod";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const creative = await prisma.creative.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      include: {
        campaign: { select: { id: true, name: true, status: true } },
        complianceFlags: {
          orderBy: { createdAt: "desc" },
          include: {
            resolvedBy: { select: { id: true, name: true } },
          },
        },
        _count: { select: { complianceFlags: true } },
      },
    });

    if (!creative) {
      return NextResponse.json(
        { error: "Not Found", message: "Creative not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: creative });
  } catch (err) {
    console.error("[GET /api/creatives/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const existing = await prisma.creative.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Creative not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { id: _id, ...parsed } = updateCreativeSchema.parse({ ...body, id: params.id });

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
      const updated = await tx.creative.update({
        where: { id: params.id },
        data: {
          ...parsed,
          campaignId: parsed.campaignId !== undefined ? parsed.campaignId ?? null : undefined,
          predictedCtr: parsed.predictedCtr !== undefined ? parsed.predictedCtr ?? null : undefined,
        },
        include: {
          campaign: { select: { id: true, name: true } },
          _count: { select: { complianceFlags: true } },
        },
      });

      await tx.activity.create({
        data: {
          type: "CREATIVE_UPDATED",
          description: `Creative updated: ${updated.name}`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return updated;
    });

    return NextResponse.json({ data: creative, message: "Creative updated successfully." });
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
    console.error("[PATCH /api/creatives/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required.", statusCode: 401 },
        { status: 401 }
      );
    }

    const existing = await prisma.creative.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Creative not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.creative.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/creatives/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
