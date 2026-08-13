import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const places = await prisma.place.findMany({
      where: { userId: session.userId }
    });

    return NextResponse.json({ places });
  } catch (error) {
    console.error("API GET places error:", error);
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
    
    const place = await prisma.place.create({
      data: {
        ...data,
        userId: session.userId
      }
    });

    return NextResponse.json({ place });
  } catch (error) {
    console.error("API POST places error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
