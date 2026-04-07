import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    const weekStart: Record<string, Date> = {};
    if (from) weekStart.gte = new Date(from);
    if (to) weekStart.lte = new Date(to);
    where.weekStart = weekStart;
  }

  const [allocations, weekStartsRaw] = await Promise.all([
    prisma.allocation.findMany({
      where,
      select: {
        id: true,
        teammateId: true,
        projectId: true,
        weekStart: true,
        fraction: true,
        isHidden: true,
      },
      orderBy: { weekStart: "asc" },
    }),
    prisma.allocation.findMany({
      where,
      select: { weekStart: true },
      distinct: ["weekStart"],
      orderBy: { weekStart: "asc" },
    }),
  ]);

  const weekStarts = weekStartsRaw.map(
    (w) => w.weekStart.toISOString().split("T")[0]
  );

  const mapped = allocations.map((a) => ({
    ...a,
    weekStart: a.weekStart.toISOString().split("T")[0],
  }));

  return NextResponse.json({ allocations: mapped, weekStarts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { teammateId, projectId, weekStart, fraction } = body;

  // Unhide existing allocations for this teammate-project pair
  await prisma.allocation.updateMany({
    where: { teammateId, projectId, isHidden: true },
    data: { isHidden: false },
  });

  const allocation = await prisma.allocation.upsert({
    where: {
      teammateId_projectId_weekStart: {
        teammateId,
        projectId,
        weekStart: new Date(weekStart),
      },
    },
    create: {
      teammateId,
      projectId,
      weekStart: new Date(weekStart),
      fraction,
    },
    update: { fraction },
  });

  return NextResponse.json({
    ...allocation,
    weekStart: allocation.weekStart.toISOString().split("T")[0],
  }, { status: 201 });
}
