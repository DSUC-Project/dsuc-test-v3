import React from 'react';
import { SectionHeader } from '@/components/ui/Primitives';

export function ComponentPlaceholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeader title={title} />
      <div className="p-12 border border-dashed brutal-border bg-main-bg text-center text-text-muted font-mono uppercase text-xs">
        {title} page placeholder matching the DSUC Labs OS design system.
      </div>
    </div>
  );
}

export function Members() { return <ComponentPlaceholder title="Members" />; }
export function MemberDetail() { return <ComponentPlaceholder title="Member Profile" />; }
export function Events() { return <ComponentPlaceholder title="Events" />; }
export function Projects() { return <ComponentPlaceholder title="Projects" />; }
export function ProjectDetail() { return <ComponentPlaceholder title="Project Showcase" />; }
export function Resources() { return <ComponentPlaceholder title="Resources" />; }
export function Work() { return <ComponentPlaceholder title="Work Board" />; }
export function Leaderboard() { return <ComponentPlaceholder title="Leaderboard" />; }
export function Meet() { return <ComponentPlaceholder title="Meet" />; }
export function Finance() { return <ComponentPlaceholder title="Finance Ledger" />; }
export function Admin() { return <ComponentPlaceholder title="Operations Admin" />; }
export function AcademyAdmin() { return <ComponentPlaceholder title="Academy Admin" />; }
export function Profile() { return <ComponentPlaceholder title="My Profile" />; }
export function CommunityTrack() { return <ComponentPlaceholder title="Community Track" />; }
export function CommunityLesson() { return <ComponentPlaceholder title="Community Lesson" />; }
