import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const teammate = await prisma.teammate.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(teammate);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.teammate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "Cannot delete a teammate with allocations. Set status to Alumni instead." },
        { status: 409 }
      );
    }
    throw e;
  }
}
