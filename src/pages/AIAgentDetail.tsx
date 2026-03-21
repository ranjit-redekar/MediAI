import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { db } from '../data';
import { AgentViewBook } from '../components/ai/AgentViewBook';

export const AIAgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const agent = db.aiAgents.find(a => a.id === agentId);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-white/60 text-lg">AI agent not found</p>
        <GlassButton variant="primary" onClick={() => navigate('/ai-insights')}>
          Back to AI Insights
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/ai-insights')}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to AI Insights</span>
      </button>

      <AgentViewBook agent={agent} />
    </div>
  );
};
