export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { Role, Plan } from "@prisma/client";
import { ZodError } from "zod";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (!existing) return slug;
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "An account with this email address already exists.",
          statusCode: 409,
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const slug = await uniqueSlug(parsed.orgName);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: parsed.orgName,
          slug,
          plan: Plan.FREE,
          settings: {},
        },
      });

      const user = await tx.user.create({
        data: {
          email: parsed.email,
          name: parsed.name,
          passwordHash,
          role: Role.ADMIN,
          orgId: org.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          orgId: true,
          createdAt: true,
        },
      });

      await tx.activity.create({
        data: {
          type: "USER_REGISTERED",
          description: `Organization "${org.name}" created by ${user.email}`,
          userId: user.id,
          orgId: org.id,
        },
      });

      return { user, org };
    });

    return NextResponse.json(
      {
        data: {
          user: result.user,
          organization: {
            id: result.org.id,
            name: result.org.name,
            slug: result.org.slug,
            plan: result.org.plan,
          },
        },
        message: "Account created successfully.",
      },
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
        {
          error: "Validation Error",
          message: "Please correct the errors below.",
          statusCode: 422,
          details,
        },
        { status: 422 }
      );
    }

    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Something went wrong. Please try again.",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
