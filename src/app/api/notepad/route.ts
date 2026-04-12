import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const note = await prisma.notepad.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", content: "" },
  });
  return NextResponse.json(note);
}

export async function PATCH(req: NextRequest) {
  const { content } = await req.json();
  const note = await prisma.notepad.upsert({
    where: { id: "singleton" },
    update: { content },
    create: { id: "singleton", content },
  });
  return NextResponse.json(note);
}
