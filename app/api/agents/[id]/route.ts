// app/api/agents/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAgentSchema } from "@/lib/validations";
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

    const agent = await prisma.agent.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Not Found", message: "Agent not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: agent });
  } catch (err) {
    console.error("[GET /api/agents/[id]]", err);
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

    const existing = await prisma.agent.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Agent not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { id: _id, ...parsed } = updateAgentSchema.parse({ ...body, id: params.id });

    const agent = await prisma.$transaction(async (tx) => {
      const updated = await tx.agent.update({
        where: { id: params.id },
        data: {
          ...parsed,
          description: parsed.description !== undefined ? parsed.description ?? null : undefined,
        },
      });

      await tx.activity.create({
        data: {
          type: "AGENT_UPDATED",
          description: `AI Agent updated: ${updated.name}`,
          userId: session.user.id,
          orgId: session.user.orgId,
        },
      });

      return updated;
    });

    return NextResponse.json({ data: agent, message: "Agent updated successfully." });
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
    console.error("[PATCH /api/agents/[id]]", err);
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

    const existing = await prisma.agent.findFirst({
      where: { id: params.id, orgId: session.user.orgId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Agent not found.", statusCode: 404 },
        { status: 404 }
      );
    }

    await prisma.agent.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/agents/[id]]", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Something went wrong.", statusCode: 500 },
      { status: 500 }
    );
  }
}
