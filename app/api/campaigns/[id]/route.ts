import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCampaignSchema } from "@/lib/validations";
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

    const campaign = await prisma.campaign.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      include: {
        creatives: { orderBy: { createdAt: "desc" } },
        _count: { select: { creatives: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Not Found", message: "Campaign not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: campaign });
  } catch (err) {
    console.error("[GET /api/campaigns/[id]]", err);
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

    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Campaign not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { id: _id, ...parsed } = updateCampaignSchema.parse({ ...body, id: params.id });

    const campaign = await prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id: params.id },
        data: parsed,
        include: { _count: { select: { creatives: true } } },
      });

      await tx.activity.create({
        data: {
          type: "CAMPAIGN_UPDATED",
          description: `Campaign updated: ${updated.name}`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return updated;
    });

    return NextResponse.json({ data: campaign, message: "Campaign updated successfully." });
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
    console.error("[PATCH /api/campaigns/[id]]", err);
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

    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Campaign not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.campaign.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/campaigns/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
