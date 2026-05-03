/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { Home } from "./pages/Home";
import { Members } from "./pages/Members";
import { MemberDetail } from "./pages/MemberDetail";
import { Events } from "./pages/Events";
import { Finance } from "./pages/Finance";
import { AcademyHome } from "./pages/AcademyHome";
import { AcademyPath } from "./pages/AcademyPath";
import { AcademyCourse } from "./pages/AcademyCourse";
import { AcademyUnit } from "./pages/AcademyUnit";
import { AcademyTrack } from "./pages/AcademyTrack";
import { AcademyLesson } from "./pages/AcademyLesson";
import { Resources } from "./pages/Resources";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Leaderboard } from "./pages/Leaderboard";
import { Meet } from "./pages/Meet";
import { Work } from "./pages/Work";
import { Admin } from "./pages/Admin";
import { AcademyAdmin } from "./pages/AcademyAdmin";
import { MyProfile } from "./pages/MyProfile";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/academy" element={<AcademyHome />} />
          <Route path="/academy/path/:pathId" element={<AcademyPath />} />
          <Route path="/academy/course/:courseId" element={<AcademyCourse />} />
          <Route path="/academy/course/:courseId/:unitId" element={<AcademyUnit />} />
          <Route path="/academy/unit/:courseId/:unitId" element={<AcademyUnit />} />
          <Route path="/academy/community/:track" element={<AcademyTrack />} />
          <Route path="/academy/community/:track/:lesson" element={<AcademyLesson />} />
          <Route path="/academy/:track" element={<AcademyTrack />} />
          <Route path="/academy/:track/:lesson" element={<AcademyLesson />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/meet" element={<Meet />} />
          <Route path="/work" element={<Work />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/academy-admin" element={<AcademyAdmin />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
