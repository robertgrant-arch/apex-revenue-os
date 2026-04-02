// app/api/agents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAgentSchema } from "@/lib/validations";
import { AgentStatus, AgentType, Prisma } from "@prisma/client";
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
    const status = searchParams.get("status") as AgentStatus | null;
    const type = searchParams.get("type") as AgentType | null;
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const where: Prisma.AgentWhereInput = {
      orgId: session.user.orgId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [total, agents] = await prisma.$transaction([
      prisma.agent.count({ where }),
      prisma.agent.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: agents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/agents]", err);
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
    const parsed = createAgentSchema.parse(body);

    const agent = await prisma.$transaction(async (tx) => {
      const created = await tx.agent.create({
        data: {
          ...parsed,
          description: parsed.description ?? null,
          orgId: session.user.orgId,
        },
      });

      await tx.activity.create({
        data: {
          type: "AGENT_CREATED",
          description: `AI Agent created: ${created.name} (${created.type})`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return created;
    });

    return NextResponse.json(
      { data: agent, message: "Agent created successfully." },
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
    console.error("[POST /api/agents]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
