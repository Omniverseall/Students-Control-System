'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { WorkspaceTab } from '@/components/WorkspaceTab';
import { AdminTab } from '@/components/AdminTab';
import { ComplaintModal } from '@/components/ComplaintModal';
import { AlertDialog } from '@/components/AlertDialog';
import { AnimatePresence, motion } from 'motion/react';

export default function AppDashboard() {
  const { loadConfig, activeTab } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [loadConfig]);

  // Avoid hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'workspace' && <WorkspaceTab key="workspace" />}
          {activeTab === 'admin' && <AdminTab key="admin" />}
        </AnimatePresence>
      </main>

      <ComplaintModal />
      <AlertDialog />
    </div>
  );
}
