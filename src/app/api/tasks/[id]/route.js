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
    
    // Check if the user owns the task
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask || existingTask.userId !== session.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("API PUT task error:", error);
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
    
    await prisma.task.delete({
      where: { id, userId: session.userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
