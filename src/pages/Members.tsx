import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Search, Send } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Primitives';
import { useStore } from '@/store/useStore';
import { Member } from '@/types';

export function Members() {
  const navigate = useNavigate();
  const { members, fetchMembers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.skills.some(skill => skill.toLowerCase().includes(query)) ||
      (member.role && member.role.toLowerCase().includes(query))
    );
  });

  const officialMembers = filteredMembers.filter(m => m.memberType !== 'community');
  const communityMembers = filteredMembers.filter(m => m.memberType === 'community');

  const MemberCard = ({ member }: { member: Member }) => (
    <div 
      className="bg-surface brutal-border brutal-shadow p-6 text-center hover:bg-main-bg transition-colors cursor-pointer group"
      onClick={() => navigate(`/member/${member.id}`)}
    >
      <img src={member.avatar || 'https://via.placeholder.com/150'} className="w-16 h-16 object-cover rounded-full mx-auto mb-3 brutal-border" alt={member.name} />
      <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{member.name}</h3>
      <p className="font-mono text-xs uppercase text-text-muted mb-3 line-clamp-1">{member.role || (member.memberType === 'community' ? 'Cộng đồng' : 'Thành viên')}</p>
      <div className="flex flex-wrap gap-1 justify-center mb-4 min-h-[22px]">
        {member.skills.slice(0,3).map(s => (
          <span key={s} className="px-2 py-0.5 border brutal-border font-mono text-[10px] uppercase line-clamp-1">{s}</span>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {member.socials?.github && (
          <a href={member.socials.github} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
            <Github className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </a>
        )}
        {member.socials?.twitter && (
          <a href={member.socials.twitter} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
            <Twitter className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </a>
        )}
        {member.socials?.telegram && (
          <a href={member.socials.telegram} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
            <Send className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <SectionHeader title="Members" className="mb-0 border-none pb-0" />
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or skill..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface brutal-border p-3 pl-10 font-mono text-xs focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <section>
        <SectionHeader title="Official Members" subtitle="The core team driving DSUC forward." />
        {officialMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {officialMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm font-mono uppercase">No official members found.</p>
        )}
      </section>

      <section>
        <SectionHeader title="Community & Interns" subtitle="Builders learning and contributing." />
        {communityMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communityMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm font-mono uppercase">No community members found.</p>
        )}
      </section>
    </div>
  );
}
