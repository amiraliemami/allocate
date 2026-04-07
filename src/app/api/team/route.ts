import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teammates = await prisma.teammate.findMany({
    where: { status: "Active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(teammates);
}
