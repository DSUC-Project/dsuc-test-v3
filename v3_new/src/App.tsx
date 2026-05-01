/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { Home } from './pages/Home';
import { AcademyHome } from './pages/academy/AcademyHome';
import { AcademyPath } from './pages/academy/AcademyPath';
import { AcademyCourse } from './pages/academy/AcademyCourse';
import { AcademyUnit } from './pages/academy/AcademyUnit';
import { Projects } from './pages/Projects';
import { Events } from './pages/Events';
import { 
  Members, MemberDetail, ProjectDetail, Resources, 
  Work, Leaderboard, Meet, Finance, Admin, AcademyAdmin, Profile,
  CommunityTrack, CommunityLesson 
} from './pages/Placeholders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          
          <Route path="/members" element={<Members />} />
          <Route path="/member/:id" element={<MemberDetail />} />
          
          <Route path="/events" element={<Events />} />
          
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          
          <Route path="/resources" element={<Resources />} />
          <Route path="/work" element={<Work />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/meet" element={<Meet />} />
          
          <Route path="/finance" element={<Finance />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/academy-admin" element={<AcademyAdmin />} />
          <Route path="/profile" element={<Profile />} />

          {/* Academy Routes - Keep exactly according to spec */}
          <Route path="/academy" element={<AcademyHome />} />
          <Route path="/academy/path/:pathId" element={<AcademyPath />} />
          <Route path="/academy/course/:courseId" element={<AcademyCourse />} />
          
          <Route path="/academy/community/:track" element={<CommunityTrack />} />
          <Route path="/academy/community/:track/:lesson" element={<CommunityLesson />} />
        </Route>

        {/* The unit view doesn't use the standard page shell because it's a code workspace */}
        <Route path="/academy/unit/:courseId/:unitId" element={<AcademyUnit />} />
      </Routes>
    </BrowserRouter>
  );
}
