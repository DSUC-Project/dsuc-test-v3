import toast from "react-hot-toast";
import React, { useState } from "react";
import {
  SectionHeader,
  SoftBrutalCard,
  StatusBadge,
  ActionButton,
} from "@/components/ui/Primitives";
import { useStore } from "@/store/useStore";
import { Plus, X, Calendar, MapPin, Clock } from "lucide-react";
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
            className="w-full border border-border-main bg-surface p-3 text-sm focus:border-primary outline-none transition-colors"
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

      <div className="flex gap-4 mb-8 border-b border-border-main border-dashed pb-4 w-full overflow-auto font-mono text-xs uppercase font-bold">
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

      <div className="grid grid-cols-1 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => {
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
              <SoftBrutalCard
                intent="accent"
                interactive
                withPattern
                key={evt.id}
                className="flex flex-col md:flex-row md:items-stretch group p-0"
              >
                {/* Date Box */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border-main px-6 py-5 w-full md:w-32 bg-main-bg group-hover:bg-accent transition-colors">
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-1 text-text-muted group-hover:text-surface">
                    {month}
                  </p>
                  <p className="font-heading font-black text-4xl leading-none text-text-main group-hover:text-surface">
                    {day}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 lg:p-6 flex flex-col justify-center min-w-0 bg-surface">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-main-bg text-text-main border border-border-main text-[10px] font-mono uppercase font-bold text-accent">
                      {evt.type || "SESSION"}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight mb-2 truncate group-hover:text-accent transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-text-muted text-sm max-w-2xl leading-relaxed line-clamp-2">
                    {evt.description || "Upcoming ecosystem deep dive."}
                  </p>

                  <div className="flex items-center gap-4 mt-4 font-mono text-[10px] uppercase text-text-muted font-bold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-accent" />{" "}
                      {evt.time || "18:00"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-accent" />{" "}
                      <span className="truncate max-w-[150px]">
                        {evt.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info & CTA */}
                <div className="flex flex-col items-center justify-center p-5 md:w-48 bg-main-bg border-t md:border-t-0 md:border-l border-border-main">
                  <div className="w-full">
                    {lumaLink ? (
                      <a
                        href={lumaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center font-bold font-mono text-xs tracking-widest uppercase flex items-center justify-center border border-border-main px-4 py-3 bg-surface hover:bg-main-bg text-text-main hover:text-accent hover:border-accent transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                      >
                        RSVP ↗
                      </a>
                    ) : (
                      <div className="w-full text-center font-mono text-[10px] text-text-muted py-2 uppercase font-bold tracking-widest border border-dashed border-border-main bg-surface">
                        Internal Session
                      </div>
                    )}
                  </div>
                </div>
              </SoftBrutalCard>
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
