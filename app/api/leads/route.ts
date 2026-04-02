import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLeadSchema, listLeadsSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
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
    const query = listLeadsSchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.LeadWhereInput = {
      orgId: session.user.orgId,
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search, mode: "insensitive" } },
        ],
      }),
      ...(query.vertical && { vertical: query.vertical }),
      ...(query.intent && { intent: query.intent }),
      ...(query.status && { status: query.status }),
      ...(query.source && { source: query.source }),
      ...(query.assignedToId && { assignedToId: query.assignedToId }),
      ...((query.scoreMin !== undefined || query.scoreMax !== undefined) && {
        score: {
          ...(query.scoreMin !== undefined && { gte: query.scoreMin }),
          ...(query.scoreMax !== undefined && { lte: query.scoreMax }),
        },
      }),
    };

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid query parameters.", statusCode: 422 },
        { status: 422 }
      );
    }
    console.error("[GET /api/leads]", err);
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
    const parsed = createLeadSchema.parse(body);

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
      const newLead = await tx.lead.create({
        data: {
          ...parsed,
          email: parsed.email || null,
          phone: parsed.phone || null,
          orgId: session.user.orgId,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      await tx.activity.create({
        data: {
          type: "LEAD_CREATED",
          description: `Lead created: ${newLead.firstName} ${newLead.lastName}`,
          leadId: newLead.id,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return newLead;
    });

    return NextResponse.json({ data: lead, message: "Lead created successfully." }, { status: 201 });
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
    console.error("[POST /api/leads]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
