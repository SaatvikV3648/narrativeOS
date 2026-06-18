import type React from 'react';

import SpikdLogo from '@/components/brand/SpikdLogo';
import { MobileDashboardNav, SidebarNav, SidebarUserArea } from '@/components/layout/DashboardNav';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="relative flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] shrink-0 border-r border-[var(--border)] bg-white lg:block">
          <div className="p-6 pb-0">
            <SpikdLogo href="/dashboard" className="text-[22px]" />
          </div>
          <SidebarNav />
          <SidebarUserArea />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/85 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <SpikdLogo href="/dashboard" className="text-lg" />
            </div>
            <MobileDashboardNav />
          </header>

          <main className="w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
