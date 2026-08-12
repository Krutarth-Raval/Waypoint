"use client";

import { useState } from "react";
import { createTask } from "@/app/actions";
import Dropdown from "@/components/Dropdown";

export default function TaskForm({ places, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [triggerType, setTriggerType] = useState("ARRIVE");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!placeId) {
      alert("Please select a place.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.target);
    
    await createTask({
      title: formData.get("title"),
      description: formData.get("description"),
      placeId: placeId,
      triggerType: triggerType,
    });
    
    setLoading(false);
    if (onSuccess) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full text-left">
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Task Title</label>
          <input required name="title" type="text" placeholder="e.g. Buy milk" className="w-full bg-background border border-border rounded-radius-md px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description (optional)</label>
          <textarea name="description" placeholder="Any extra notes..." className="w-full bg-background border border-border rounded-radius-md px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Place</label>
          <Dropdown
            value={placeId}
            onChange={setPlaceId}
            options={places.map(p => ({ label: p.name, value: p.id }))}
            placeholder="Select a place..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Trigger</label>
          <Dropdown
            value={triggerType}
            onChange={setTriggerType}
            options={[
              { label: "When I Arrive", value: "ARRIVE" },
              { label: "When I Leave", value: "LEAVE" }
            ]}
          />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-radius-md font-medium transition-colors mt-2 shadow-sm">
          {loading ? "Saving..." : "Save Task"}
        </button>
      </div>
    </form>
  );
}
