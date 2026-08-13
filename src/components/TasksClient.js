"use client";

import { useState, useRef, useEffect } from "react";
import { CheckSquare, Plus, X, MapPin, CheckCircle, MoreVertical, Trash2, Filter, FilterX } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import Dropdown from "@/components/Dropdown";
import TaskCard from "@/components/TaskCard";
import { completeTask, deleteTask } from "@/app/actions";
import { syncTasks } from "@/lib/geofenceManager";

export default function TasksClient({ tasks, places }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterPlace, setFilterPlace] = useState("ALL");
  const [filterTrigger, setFilterTrigger] = useState("ALL");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    syncTasks(tasks);
  }, [tasks]);

  function handleFormSuccess() {
    setIsFormOpen(false);
  }

  async function confirmDelete() {
    if (!taskToDelete) return;
    setIsDeleting(true);
    await deleteTask(taskToDelete.id);
    setIsDeleting(false);
    setTaskToDelete(null);
  }

  const filteredTasks = tasks.filter(t => 
    (filterPlace === "ALL" || t.placeId === filterPlace) &&
    (filterTrigger === "ALL" || t.triggerType === filterTrigger)
  );

  const tasksByPlace = filteredTasks.reduce((acc, task) => {
    const placeName = task.place.name;
    if (!acc[placeName]) acc[placeName] = [];
    acc[placeName].push(task);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-32">
      <header className="mb-6 md:mb-8 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2 hidden sm:block">Manage your location-based tasks</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {(filterPlace !== "ALL" || filterTrigger !== "ALL") && (
            <button 
              onClick={() => { setFilterPlace("ALL"); setFilterTrigger("ALL"); }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center hover:bg-accent/80 hover:text-foreground transition-colors shrink-0"
              title="Clear Filters"
            >
              <FilterX className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              (filterPlace !== "ALL" || filterTrigger !== "ALL") 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "bg-accent text-foreground hover:bg-accent/80 border border-transparent"
            }`}
            title="Filter Tasks"
          >
            <Filter className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-12 h-12 md:w-14 md:h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 shrink-0 ml-1 md:ml-2"
          >
            <Plus className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>
      </header>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-border shadow-lg mt-12 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10 animate-bounce">
            <CheckSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <h3 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 relative z-10">No active tasks</h3>
          <p className="text-muted-foreground text-sm md:text-lg max-w-sm mb-6 relative z-10">
            Create tasks and assign them to places so they trigger when you arrive or leave.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tasks match your filters.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(tasksByPlace).map(([placeName, groupTasks]) => {
            const arriveTasks = groupTasks.filter(t => t.triggerType === 'ARRIVE');
            const leaveTasks = groupTasks.filter(t => t.triggerType === 'LEAVE');

            return (
              <div key={placeName} className="mb-8 last:mb-0">
                <h3 className="font-bold text-lg md:text-xl mb-4 text-foreground flex items-center px-2">
                  <MapPin className="w-5 h-5 mr-2 text-primary" /> {placeName}
                </h3>
                
                <div className="flex flex-col gap-6">
                  {arriveTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-[1px] flex-1 bg-border/80" />
                        <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                          Arrive Tasks
                        </h4>
                        <div className="h-[1px] flex-1 bg-border/80" />
                      </div>
                      <div className="flex flex-col gap-4">
                        {arriveTasks.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onDelete={() => setTaskToDelete(task)}
                            isDeleting={isDeleting && taskToDelete?.id === task.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {leaveTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-[1px] flex-1 bg-border/80" />
                        <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                          Leave Tasks
                        </h4>
                        <div className="h-[1px] flex-1 bg-border/80" />
                      </div>
                      <div className="flex flex-col gap-4">
                        {leaveTasks.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onDelete={() => setTaskToDelete(task)}
                            isDeleting={isDeleting && taskToDelete?.id === task.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* Form Overlay */}
      {isFormOpen && (
        <>
          {/* Backdrop for Desktop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300 hidden md:block"
            onClick={() => setIsFormOpen(false)}
          />
          
          <div className="fixed z-[70] bg-card shadow-2xl overflow-y-auto transition-transform duration-300
            /* Mobile: Bottom Sheet */
            inset-x-0 bottom-0 rounded-t-[32px] max-h-[85vh] md:max-h-none animate-in slide-in-from-bottom-full md:animate-none
            /* Desktop: Side Panel */
            md:inset-y-0 md:right-0 md:bottom-0 md:left-auto md:w-[450px] md:rounded-none md:border-l md:border-border md:animate-in md:slide-in-from-right-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Create Task</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-full bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {places.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-radius-lg bg-accent/50">
                  <p className="text-muted-foreground mb-4">You need to create a place first.</p>
                  <button onClick={() => setIsFormOpen(false)} className="text-primary hover:underline font-medium">Close and go to Places</button>
                </div>
              ) : (
                <TaskForm places={places} onSuccess={handleFormSuccess} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Custom Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setTaskToDelete(null)}>
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg md:text-xl font-bold mb-2">Delete Task?</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-8 leading-relaxed">Are you sure you want to delete "{taskToDelete.title}"?</p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm md:text-base rounded-full font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm md:text-base rounded-full font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)}>
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold">Filter Tasks</h3>
              <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-muted-foreground">By Place</label>
                <Dropdown 
                  value={filterPlace}
                  onChange={setFilterPlace}
                  options={[
                    { label: "All Places", value: "ALL" },
                    ...places.map(p => ({ label: p.name, value: p.id }))
                  ]}
                  buttonClassName="bg-accent border-transparent rounded-xl py-3"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-muted-foreground">By Trigger</label>
                <Dropdown 
                  value={filterTrigger}
                  onChange={setFilterTrigger}
                  options={[
                    { label: "All Triggers", value: "ALL" },
                    { label: "Arrive", value: "ARRIVE" },
                    { label: "Leave", value: "LEAVE" }
                  ]}
                  buttonClassName="bg-accent border-transparent rounded-xl py-3"
                />
              </div>
            </div>
            
            <div className="flex gap-4 w-full">
              {(filterPlace !== "ALL" || filterTrigger !== "ALL") && (
                <button 
                  onClick={() => { setFilterPlace("ALL"); setFilterTrigger("ALL"); setIsFilterOpen(false); }}
                  className="flex-1 py-3 text-sm md:text-base rounded-full bg-accent text-foreground font-bold hover:bg-accent/80 transition-colors"
                >
                  Clear
                </button>
              )}
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 text-sm md:text-base rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

