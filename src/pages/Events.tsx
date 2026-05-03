import toast from "react-hot-toast";
import React, { useState } from "react";
import {
  SectionHeader,
  SoftBrutalCard,
  StatusBadge,
  ActionButton,
} from "@/components/ui/Primitives";
import { useStore } from "@/store/useStore";
import { Plus, X, Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { ModalShell } from "@/components/ui/ModalShell";
import { Card, ActionCard } from "@/components/ui/Cards";
import { Event as AppEvent } from "@/types";

function AddEventModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (e: AppEvent) => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onAdd({
      id: Math.random().toString(),
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      luma_link: formData.get("luma_link") as string,
      description: formData.get("description") as string,
      type: "Workshop",
      attendees: 0,
    });
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Add Event"
      label="SCHEDULER"
      footer={
        <div className="w-full flex items-center justify-end">
          <ActionButton
            onClick={() =>
              document
                .getElementById("add-event-form")
                ?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true }),
                )
            }
            variant="primary"
          >
            Create Event
          </ActionButton>
        </div>
      }
    >
      <form id="add-event-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Event Title
          </label>
          <input
            name="title"
            required
            className="w-full  bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Date
            </label>
            <input
              name="date"
              type="date"
              required
              className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Time
            </label>
            <input
              name="time"
              type="time"
              required
              className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Location
          </label>
          <input
            name="location"
            required
            className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Description
          </label>
          <textarea
            name="description"
            className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none min-h-[80px] resize-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
            LuMa Link
          </label>
          <input
            name="luma_link"
            type="url"
            required
            className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
          />
        </div>
      </form>
    </ModalShell>
  );
}

export function Events() {
  const { events, addEvent, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const canManage = currentUser?.memberType === "member";

  const now = new Date();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const filteredEvents = sortedEvents.filter((evt) => {
    const evtDate = new Date(evt.date);
    if (filter === "upcoming") return evtDate >= now;
    if (filter === "past") return evtDate < now;
    return true;
  });

  const handleAddClick = () => {
    if (!currentUser) {
      toast.error("Please log in first!");
      return;
    }
    if (!canManage) {
      toast.error("Community accounts cannot create events.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <SectionHeader
          title="Events & Sessions"
          subtitle="Workshops, meetups, and builder co-working sessions."
          className="mb-4 md:mb-0"
        />

        <div className="w-full md:w-auto">
          {canManage ? (
            <ActionButton
              variant="primary"
              className="w-full md:w-auto"
              onClick={handleAddClick}
            >
              <span className="flex items-center gap-2 justify-center">
                <Plus size={16} /> Add Event
              </span>
            </ActionButton>
          ) : (
            <div className="px-4 py-2 bg-main-bg border border-border-main text-xs font-mono text-text-muted text-center">
              Events restricted to Members
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8 w-full overflow-auto font-mono text-xs uppercase font-bold">
        <button
          onClick={() => setFilter("upcoming")}
          className={`transition-colors ${filter === "upcoming" ? "text-primary" : "text-text-muted hover:text-text-main"}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`transition-colors ${filter === "past" ? "text-primary" : "text-text-muted hover:text-text-main"}`}
        >
          Past Recordings
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`transition-colors ${filter === "all" ? "text-primary" : "text-text-muted hover:text-text-main"}`}
        >
          All
        </button>
      </div>

      <div className="relative border-l-[3px] border-text-main ml-4 md:ml-8 pl-6 md:pl-12 py-4 space-y-10 before:content-[''] before:absolute before:border-l-[3px] before: before:border-surface before:left-[-3px] before:top-0 before:h-full before:w-0">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt, idx) => {
            const dateObj = evt.date ? new Date(evt.date) : new Date();
            const month = dateObj.toLocaleString("en-US", { month: "short" });
            const day = String(dateObj.getDate()).padStart(2, "0");
            const lumaLink = String(
              (evt as any).luma_link ||
                (evt as any).lumaLink ||
                (evt as any).link ||
                "",
            ).trim();
            
            return (
              <div 
                key={evt.id} 
                className={`relative group ${lumaLink ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (lumaLink) window.open(lumaLink, "_blank", "noopener,noreferrer");
                }}
              >
                {/* Timeline Node Marker */}
                <div className="absolute -left-[32px] md:-left-[56px] top-6 w-4 h-4 rounded-none bg-surface border-4 border-text-main group-hover:bg-primary group-hover:scale-125 transition-transform z-10 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]" />
                
                {/* Compact Event Card */}
                <div className="bg-surface border-2 border-text-main shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:group-hover:shadow-[8px_8px_0_0_rgba(255,255,255,1)] group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all duration-300 p-0 flex flex-row items-stretch">
                  
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center p-4 bg-main-bg border-r-2 border-text-main w-20 md:w-24 group-hover:bg-primary group-hover:text-surface transition-colors flex-shrink-0">
                    <span className="font-heading font-black text-3xl leading-none">{day}</span>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">{month}</span>
                  </div>

                  {/* Content Block */}
                  <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-highlight text-text-main border border-text-main text-[9px] font-mono uppercase font-black tracking-widest">
                        {evt.type || "EVENT"}
                      </span>
                      {evt.time && (
                        <span className="font-mono text-[10px] font-bold text-text-muted flex items-center gap-1 group-hover:text-primary transition-colors">
                          <Clock size={10} /> {evt.time}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-heading font-black text-lg md:text-xl uppercase tracking-tight text-text-main line-clamp-1 mb-1">
                      {evt.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 font-mono text-[10px] font-bold text-text-muted mt-2">
                       {evt.location && (
                          <span className="flex items-center gap-1 truncate max-w-[150px] md:max-w-xs">
                             <MapPin size={10} className="text-primary" /> {evt.location}
                          </span>
                       )}
                    </div>
                  </div>

                  {/* Action Block */}
                  {lumaLink && (
                    <div className="hidden sm:flex items-center justify-center px-6 border-l-2 border-text-main bg-main-bg text-text-muted group-hover:bg-text-main group-hover:text-surface transition-colors">
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                  {lumaLink && (
                    <div className="sm:hidden flex items-center justify-center px-4 text-text-muted group-hover:text-primary transition-colors border-l-2 border-dashed border-border-main">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Card className="p-12 text-center text-text-muted font-mono uppercase text-xs">
            <p>No events found for this category.</p>
          </Card>
        )}
      </div>

      <AddEventModal
        isOpen={isModalOpen && canManage}
        onClose={() => setIsModalOpen(false)}
        onAdd={addEvent}
      />
    </div>
  );
}
