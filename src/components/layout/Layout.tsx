import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAgentDrawer } from './agents/AIAgentDrawer';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCompact={isSidebarCompact}
        onToggleCompact={() => setIsSidebarCompact(prev => !prev)}
        onOpenAgents={() => setAgentDrawerOpen(true)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <AIAgentDrawer isOpen={agentDrawerOpen} onClose={() => setAgentDrawerOpen(false)} />
    </div>
  );
};
