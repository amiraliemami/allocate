import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { lead: { select: { id: true, name: true } } },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name ?? "New Project",
      pillar: body.pillar ?? null,
      region: body.region ?? null,
      billingRate: body.billingRate ?? null,
      status: body.status ?? "Pipeline",
      conversionProbability: body.conversionProbability ?? null,
      billable: body.billable ?? false,
      leadId: body.leadId ?? null,
    },
    include: { lead: { select: { id: true, name: true } } },
  });
  return NextResponse.json(project, { status: 201 });
}
