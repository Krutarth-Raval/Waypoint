import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { 
        userId: session.userId,
        status: 'PENDING'
      },
      include: {
        place: true
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("API GET tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: session.userId
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("API POST tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
