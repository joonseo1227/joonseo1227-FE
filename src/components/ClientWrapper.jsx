"use client";

import ProjectTransition from "@/components/ProjectTransition";

export default function ClientWrapper({ children }) {
  return (
    <ProjectTransition>
      {children}
    </ProjectTransition>
  );
}
