import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Twitter, Search, Send, ArrowRight } from "lucide-react";
import { SectionHeader, SoftBrutalCard } from "@/components/ui/Primitives";
import { ActionCard } from "@/components/ui/Cards";
import { useStore } from "@/store/useStore";
import { Member } from "@/types";

export function Members() {
  const navigate = useNavigate();
  const { members, fetchMembers } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.skills.some((skill) => skill.toLowerCase().includes(query)) ||
      (member.role && member.role.toLowerCase().includes(query))
    );
  });

  const officialMembers = filteredMembers.filter(
    (m) => m.memberType !== "community",
  );
  const communityMembers = filteredMembers.filter(
    (m) => m.memberType === "community",
  );

  const MemberCard = ({ member, intent = "default" }: { member: Member, intent?: "default" | "primary" | "warning" | "success" | "danger" | "info" | "locked" | "accent" }) => (
    <div onClick={() => navigate(`/member/${member.id}`)} className="h-full cursor-pointer focus:outline-none">
      <SoftBrutalCard
        intent={intent}
        interactive
        className="flex flex-col p-6 items-center text-center group h-full"
      >
        <div className="w-20 h-20 mb-4 border border-border-main p-1 bg-main-bg group-hover:scale-105 transition-transform shadow-sm">
          <img
            src={member.avatar || `https://i.pravatar.cc/150?u=${member.id}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
            alt={member.name}
          />
        </div>

        <h3 className="font-heading font-black text-lg text-text-main group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {member.name}
        </h3>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 line-clamp-1 border border-border-main px-2 py-0.5 bg-main-bg bg-opacity-50 inline-block">
          {member.role ||
            (member.memberType === "community" ? "Community" : "Member")}
        </p>

        <div className="flex flex-wrap gap-1.5 justify-center mt-auto mb-5 w-full">
          {member.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 bg-main-bg border border-border-main font-mono text-[9px] uppercase font-bold text-text-main line-clamp-1 transition-colors"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex justify-center gap-4 w-full pt-4 border-t border-border-main border-dashed">
          {member.socials?.github && (
            <a
              href={member.socials.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 border border-border-main bg-main-bg text-text-muted hover:text-text-main hover:border-text-main shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {member.socials?.twitter && (
            <a
              href={member.socials.twitter}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 border border-border-main bg-main-bg text-text-muted hover:text-text-main hover:border-text-main shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
          )}
          {member.socials?.telegram && (
            <a
              href={member.socials.telegram}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 border border-border-main bg-main-bg text-text-muted hover:text-text-main hover:border-text-main shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="ml-auto flex items-center justify-center p-1.5 border border-border-main bg-main-bg text-text-muted group-hover:bg-primary group-hover:text-surface group-hover:border-primary transition-colors">
            <ArrowRight size={14} />
          </div>
        </div>
      </SoftBrutalCard>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 border-b border-border-main pb-8 border-dashed">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-2">
            DIRECTORY
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tight text-text-main">
            Members
          </h1>
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border-2 border-text-main p-4 pl-12 font-mono text-xs font-bold uppercase tracking-widest placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors focus:shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:focus:shadow-[4px_4px_0_0_#1a1b26]"
          />
        </div>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 bg-primary"></div>
          <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-text-main">
            Official Members
          </h2>
        </div>
        {officialMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {officialMembers.map((member) => (
              <MemberCard key={member.id} member={member} intent="primary" />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border-main bg-surface p-12 text-center text-text-muted font-mono uppercase text-xs tracking-widest">
            No official members found.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 bg-highlight"></div>
          <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-text-main">
            Community
          </h2>
        </div>
        {communityMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communityMembers.map((member) => (
              <MemberCard key={member.id} member={member} intent="warning" />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border-main bg-surface p-12 text-center text-text-muted font-mono uppercase text-xs tracking-widest">
            No community members found.
          </div>
        )}
      </section>
    </div>
  );
}
