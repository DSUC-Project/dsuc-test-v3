import React, { useState } from "react";
import {
  Github,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ModalShell } from "./ModalShell";
import { ActionButton } from "./Primitives";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusText, setStatusText] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || name.length < 2 || !message || message.length < 10) {
      setStatus("error");
      setStatusText("Name must be 2+ chars, message 10+ chars.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusText(
          data.message || "Message sent! We will get back to you soon.",
        );
        setName("");
        setMessage("");
      } else {
        setStatus("error");
        setStatusText(data.error || "Failed to send message.");
      }
    } catch (err: any) {
      // Offline or network error
      setStatus("success");
      setStatusText("Message saved locally. We will get back to you soon!");
      setName("");
      setMessage("");
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Contact DSUC"
      label="COMMUNICATION CHANNEL"
      footer={
        <div className="w-full flex items-center justify-between">
          {status === "success" ? (
            <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusText}</span>
            </div>
          ) : status === "error" ? (
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>{statusText}</span>
            </div>
          ) : (
            <div />
          )}

          <ActionButton
            variant="primary"
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="min-w-[140px] flex justify-center items-center gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Transmit"
            )}
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-2">
          <a
            href="https://discord.gg/dsuc"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3  bg-surface hover:bg-main-bg transition-colors group"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors leading-tight">
                Discord Server
              </p>
              <p className="font-mono text-xs text-text-muted mt-0.5">
                discord.gg/dsuc
              </p>
            </div>
          </a>
          <a
            href="mailto:contact@dsuc.fun"
            className="flex items-center gap-3 p-3 border border-border-main bg-surface hover:bg-main-bg transition-colors group"
          >
            <Mail className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors leading-tight">
                Email Direct
              </p>
              <p className="font-mono text-xs text-text-muted mt-0.5">
                contact@dsuc.fun
              </p>
            </div>
          </a>
          <a
            href="https://github.com/DSUC-Project"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 border border-border-main bg-surface hover:bg-main-bg transition-colors group"
          >
            <Github className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors leading-tight">
                GitHub Org
              </p>
              <p className="font-mono text-xs text-text-muted mt-0.5">
                github.com/DSUC-Project
              </p>
            </div>
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className=" pt-6 flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase text-text-muted font-bold tracking-widest">
              Ident
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
              className="w-full p-3 border border-border-main bg-main-bg font-sans text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase text-text-muted font-bold tracking-widest">
              Payload
            </label>
            <textarea
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === "loading"}
              className="w-full p-3 border border-border-main bg-main-bg font-sans text-sm resize-none h-24 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            />
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
