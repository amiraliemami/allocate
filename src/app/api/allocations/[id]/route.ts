import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { fraction } = await req.json();

  if (!fraction || fraction === 0) {
    await prisma.allocation.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  const allocation = await prisma.allocation.update({
    where: { id },
    data: { fraction },
  });

  return NextResponse.json({
    ...allocation,
    weekStart: allocation.weekStart.toISOString().split("T")[0],
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.allocation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
