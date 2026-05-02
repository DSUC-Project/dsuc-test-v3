import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Twitter, Search } from "lucide-react";
import { SectionHeader } from "@/components/ui/Primitives";
import { mockMembers } from "@/lib/mockData";
import { useStore } from "@/store/useStore";

export function Members() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>(mockMembers as any[]);
  const [searchQuery, setSearchQuery] = useState("");

  // Real fetch from store if available, fallback to mock
  useEffect(() => {
    const fetchReal = async () => {
      const storeMembers = useStore.getState().members;
      if (storeMembers && storeMembers.length > 0) {
        setData(storeMembers);
      } else {
        await useStore.getState().fetchMembers();
        const updatedMembers = useStore.getState().members;
        if (updatedMembers && updatedMembers.length > 0) {
          setData(updatedMembers);
        }
      }
    };
    fetchReal().catch(() => {}); // ignore fail silently
  }, []);

  const filteredMembers = data.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.skills.some((skill) => skill.toLowerCase().includes(query)) ||
      member.role.toLowerCase().includes(query)
    );
  });

  const officialMembers = filteredMembers.filter(
    (m) => m.memberType === "member",
  );
  const communityMembers = filteredMembers.filter(
    (m) => m.memberType === "community",
  );

  const MemberCard = ({ member }: { member: (typeof mockMembers)[0] }) => (
    <div
      className="bg-surface border border-border-main shadow-sm p-6 text-center hover:bg-main-bg transition-colors cursor-pointer group"
      onClick={() => navigate(`/member/${member.id}`)}
    >
      <img
        src={member.avatar}
        className="w-16 h-16 rounded-full mx-auto mb-3 border-border-main"
        alt={member.name}
      />
      <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">
        {member.name}
      </h3>
      <p className="font-mono text-xs uppercase text-text-muted mb-3">
        {member.role}
      </p>
      <div className="flex flex-wrap gap-1 justify-center mb-4 min-h-[22px]">
        {member.skills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 border border-border-main font-mono text-[10px] uppercase"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Github className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </a>
        )}
        {member.twitter && (
          <a
            href={member.twitter}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Twitter className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <SectionHeader title="Members" className="mb-0 border-none pb-0" />
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border-border-main p-2 pl-9 font-mono text-xs focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <section>
        <SectionHeader
          title="Official Members"
          subtitle="The core team driving DSUC forward."
        />
        {officialMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {officialMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm font-mono uppercase">
            No official members found.
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          title="Community & Interns"
          subtitle="Builders learning and contributing."
        />
        {communityMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communityMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm font-mono uppercase">
            No community members found.
          </p>
        )}
      </section>
    </div>
  );
}
