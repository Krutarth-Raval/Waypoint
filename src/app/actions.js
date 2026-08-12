"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function getUserId() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session.userId;
}

export async function getPlaces() {
  const userId = await getUserId();
  return prisma.place.findMany({
    where: { userId }
  });
}

export async function getActiveTasks() {
  const userId = await getUserId();
  return prisma.task.findMany({
    where: { 
      userId,
      status: 'PENDING'
    },
    include: {
      place: true
    }
  });
}

export async function createPlace(data) {
  const userId = await getUserId();
  const place = await prisma.place.create({
    data: {
      ...data,
      userId
    }
  });
  revalidatePath('/places');
  revalidatePath('/');
  revalidatePath('/tasks');
  return place;
}

export async function updatePlace(id, data) {
  const userId = await getUserId();
  const place = await prisma.place.update({
    where: { id, userId }, // Ensure user owns the place
    data
  });
  revalidatePath('/places');
  revalidatePath('/');
  revalidatePath('/tasks');
  return place;
}

export async function deletePlace(id) {
  const userId = await getUserId();
  await prisma.place.delete({
    where: { id, userId } // Ensure user owns the place
  });
  revalidatePath('/places');
  revalidatePath('/');
  revalidatePath('/tasks');
  return true;
}

export async function createTask(data) {
  const userId = await getUserId();
  const task = await prisma.task.create({
    data: {
      ...data,
      userId
    }
  });
  revalidatePath('/tasks');
  revalidatePath('/');
  return task;
}

export async function completeTask(taskId) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { 
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });
  revalidatePath('/');
  revalidatePath('/tasks');
  return task;
}

export async function deleteTask(taskId) {
  const userId = await getUserId();
  await prisma.task.delete({
    where: { id: taskId, userId } // Ensure user owns the task
  });
  revalidatePath('/');
  revalidatePath('/tasks');
  return true;
}
