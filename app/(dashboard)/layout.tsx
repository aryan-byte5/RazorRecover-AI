"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import SimulationModal from "@/components/SimulationModal";
import InvestigationDrawer from "@/components/InvestigationDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setWorkspace({
            id: data.user.workspaceId,
            name: data.user.workspaceName,
            slug: data.user.workspaceSlug,
          });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <AppSidebar
        user={user}
        workspace={workspace}
        onOpenSimulation={() => setIsSimModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      {/* Global AI vs Baseline Simulation Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onCompleted={() => {
          // Trigger refresh or event dispatch
        }}
      />
    </div>
  );
}
