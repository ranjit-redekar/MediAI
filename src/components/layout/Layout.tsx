import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Command } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAgentDrawer } from './agents/AIAgentDrawer';
import { TaskInboxDrawer } from './inbox/TaskInboxDrawer';
import { CommandPalette } from './command/CommandPalette';
import { AICopilotChat } from './copilot/AICopilotChat';
import { GuidedTour } from '../tour/GuidedTour';
import { useTheme } from '../../context/ThemeContext';
import { useTour } from '../../context/TourContext';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { active: tourActive, start: startTour, hasCompleted } = useTour();
  // Coachmark only appears once the user has finished the tour (avoids two onboarding popups at once)
  const [showCoachmark, setShowCoachmark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return hasCompleted() && !sessionStorage.getItem('mediai-coachmark-dismissed');
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-start the guided tour on a user's first visit
  useEffect(() => {
    if (!hasCompleted()) {
      const id = window.setTimeout(() => startTour(), 600);
      return () => window.clearTimeout(id);
    }
  }, [hasCompleted, startTour]);

  const dismissCoachmark = () => {
    setShowCoachmark(false);
    sessionStorage.setItem('mediai-coachmark-dismissed', 'true');
  };

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
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenTaskInbox={() => setTaskDrawerOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={() => window.location.assign('/login')}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <AIAgentDrawer isOpen={agentDrawerOpen} onClose={() => setAgentDrawerOpen(false)} />
      <TaskInboxDrawer isOpen={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <AICopilotChat
        isOpen={copilotOpen}
        onToggle={() => setCopilotOpen(prev => !prev)}
        onClose={() => setCopilotOpen(false)}
      />
      <GuidedTour />
      {!tourActive && showCoachmark && (
        <div className="fixed bottom-6 left-6 z-40 max-w-xs rounded-2xl border glass-panel p-4 shadow-lg shadow-violet-500/20">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Command className="w-4 h-4" />
            Try the Command Palette
          </p>
          <p className="text-xs text-white/60 mt-1">Press ⌘+K (or Ctrl+K) anytime to jump to patients, agents, or actions.</p>
          <button
            onClick={dismissCoachmark}
            className="mt-3 text-xs text-violet-300 hover:text-white transition-colors"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
};
