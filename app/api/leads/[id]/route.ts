import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateLeadSchema } from "@/lib/validations";
import { ZodError } from "zod";

interface RouteContext {
  params: { id: string };
}

async function findLead(id: string, orgId: string) {
  return prisma.lead.findFirst({
    where: { id, orgId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      appointments: {
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });
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

    const lead = await findLead(params.id, session.user.orgId);
    if (!lead) {
      return NextResponse.json(
        { error: "Not Found", message: "Lead not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error("[GET /api/leads/[id]]", err);
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

    const existing = await prisma.lead.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Lead not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { id: _id, ...parsed } = updateLeadSchema.parse({ ...body, id: params.id });

    if (parsed.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: { id: parsed.assignedToId, orgId: session.user.orgId },
        select: { id: true },
      });
      if (!assignee) {
        return NextResponse.json(
          { error: "Bad Request", message: "Assigned user not found in your organization.", statusCode: 400 },
          { status: 400 }
        );
      }
    }

    const lead = await prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id: params.id },
        data: {
          ...parsed,
          email: parsed.email !== undefined ? parsed.email || null : undefined,
          phone: parsed.phone !== undefined ? parsed.phone || null : undefined,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      await tx.activity.create({
        data: {
          type: "LEAD_UPDATED",
          description: `Lead updated: ${updated.firstName} ${updated.lastName}`,
          leadId: updated.id,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return updated;
    });

    return NextResponse.json({ data: lead, message: "Lead updated successfully." });
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
    console.error("[PATCH /api/leads/[id]]", err);
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

    const existing = await prisma.lead.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Lead not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.lead.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/leads/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
