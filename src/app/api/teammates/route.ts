import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teammates = await prisma.teammate.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(teammates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const teammate = await prisma.teammate.create({
    data: {
      name: body.name ?? "New Teammate",
      email: body.email ?? null,
      role: body.role ?? null,
      level: body.level ?? null,
      region: body.region ?? null,
      status: body.status ?? "Active",
    },
  });
  return NextResponse.json(teammate, { status: 201 });
}
