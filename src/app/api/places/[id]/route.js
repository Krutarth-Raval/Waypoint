import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const data = await request.json();
    
    const place = await prisma.place.update({
      where: { id, userId: session.userId },
      data
    });

    return NextResponse.json({ place });
  } catch (error) {
    console.error("API PUT place error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    
    await prisma.place.delete({
      where: { id, userId: session.userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE place error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
