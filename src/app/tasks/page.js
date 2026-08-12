import { getActiveTasks, getPlaces } from "../actions";
import TasksClient from "@/components/TasksClient";

export default async function TasksPage() {
  const tasks = await getActiveTasks();
  const places = await getPlaces();

  return (
    <div className="flex flex-col min-h-full w-full">
      <TasksClient tasks={tasks} places={places} />
    </div>
  );
}
