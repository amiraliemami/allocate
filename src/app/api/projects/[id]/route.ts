import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = { ...body };
  for (const key of ["startDate", "endDate"] as const) {
    if (key in data) {
      const v = data[key];
      data[key] = typeof v === "string" && v ? new Date(`${v}T00:00:00Z`) : null;
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data,
    include: { lead: { select: { id: true, name: true } } },
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
