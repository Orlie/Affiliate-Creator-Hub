
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { LogoutIcon, DocumentTextIcon, ChartBarIcon, StarIcon, SparklesIcon, TagIcon, TrophyIcon, BookOpenIcon, TicketIcon, UsersIcon, KeyIcon, Cog6ToothIcon, ClipboardCheckIcon, DocumentMagnifyingGlassIcon, MegaphoneIcon } from '../../components/icons/Icons';
import SampleRequestQueue from './SampleRequestQueue';
import AiChatbotManager from './AiChatbotManager';
import CampaignsManager from './CampaignsManager';
import LeaderboardManager from './LeaderboardManager';
import ResourcesManager from './ResourcesManager';
import IncentivesManager from './IncentivesManager';
import TicketsManager from './TicketsManager';
import AffiliatesManager from './AffiliatesManager';
import PasswordResetManager from './PasswordResetManager';
import SettingsManager from './SettingsManager';
import OnboardingManager from './OnboardingManager';
import FeedbackManager from './FeedbackManager';
import ActionItemsManager from './ActionItemsManager';
import AnalyticsManager from './AnalyticsManager';
import ContentRewardsManager from './ContentRewardsManager'; // Import the new manager
import { listenToPasswordResetRequests, listenToPendingOnboardingRequests } from '../../services/mockApi';
import { User, PasswordResetRequest } from '../../types';


type AdminTab = 'requests' | 'campaigns' | 'leaderboard' | 'resources' | 'tickets' | 'incentives' | 'affiliates' | 'ai-chatbot' | 'analytics' | 'password-resets' | 'hub-settings' | 'onboarding' | 'feedback' | 'action-items' | 'content-rewards';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('onboarding');
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = listenToPasswordResetRequests(setResetRequests);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToPendingOnboardingRequests(setOnboardingRequests);
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'onboarding':
        return <OnboardingManager requests={onboardingRequests} />;
      case 'requests':
        return <SampleRequestQueue />;
      case 'campaigns':
        return <CampaignsManager />;
      case 'content-rewards':
        return <ContentRewardsManager />;
      case 'affiliates':
        return <AffiliatesManager />;
      case 'feedback':
        return <FeedbackManager />;
      case 'action-items':
        return <ActionItemsManager />;
      case 'leaderboard':
        return <LeaderboardManager />;
      case 'resources':
        return <ResourcesManager />;
      case 'tickets':
        return <TicketsManager />;
      case 'incentives':
        return <IncentivesManager />;
      case 'password-resets':
        return <PasswordResetManager requests={resetRequests} />;
       case 'hub-settings':
        return <SettingsManager />;
       case 'ai-chatbot':
        return <AiChatbotManager />;
       case 'analytics':
        return <AnalyticsManager />; // Replace placeholder with the new component
      default:
        // FIX: Added missing 'requests' prop to OnboardingManager to resolve TypeScript error.
        return <OnboardingManager requests={onboardingRequests} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-border">
          <h1 className="text-2xl font-bold text-primary">Creator Hub</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <AdminNavLink text="Onboarding" icon={ClipboardCheckIcon} active={activeTab === 'onboarding'} onClick={() => setActiveTab('onboarding')} badge={onboardingRequests.length > 0 ? onboardingRequests.length : undefined} />
          <AdminNavLink text="Analytics" icon={ChartBarIcon} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <AdminNavLink text="Content Rewards" icon={MegaphoneIcon} active={activeTab === 'content-rewards'} onClick={() => setActiveTab('content-rewards')} />
          <AdminNavLink text="Sample Requests" icon={DocumentTextIcon} active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
          <AdminNavLink text="Campaigns" icon={TagIcon} active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          <AdminNavLink text="Affiliates" icon={UsersIcon} active={activeTab === 'affiliates'} onClick={() => setActiveTab('affiliates')} />
          <AdminNavLink text="Affiliate Feedback" icon={DocumentMagnifyingGlassIcon} active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
          <AdminNavLink text="Action Items" icon={ClipboardCheckIcon} active={activeTab === 'action-items'} onClick={() => setActiveTab('action-items')} />
          <AdminNavLink text="Leaderboard" icon={TrophyIcon} active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
          <AdminNavLink text="Resources" icon={BookOpenIcon} active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} />
          <AdminNavLink text="Tickets" icon={TicketIcon} active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
          <AdminNavLink text="Incentives" icon={StarIcon} active={activeTab === 'incentives'} onClick={() => setActiveTab('incentives')} />
          <AdminNavLink text="Password Resets" icon={KeyIcon} active={activeTab === 'password-resets'} onClick={() => setActiveTab('password-resets')} badge={resetRequests.length > 0 ? resetRequests.length : undefined} />
          <AdminNavLink text="Hub Settings" icon={Cog6ToothIcon} active={activeTab === 'hub-settings'} onClick={() => setActiveTab('hub-settings')} />
          <AdminNavLink text="AI Chatbot" icon={SparklesIcon} active={activeTab === 'ai-chatbot'} onClick={() => setActiveTab('ai-chatbot')} />
        </nav>
        <div className="p-4 border-t border-border">
            <p className="text-sm text-center text-text-secondary">{user?.email}</p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-end px-6">
            <Button variant="ghost" size="sm" onClick={logout} className="ml-4 flex items-center">
                <LogoutIcon className="h-5 w-5 mr-2"/>
                Logout
            </Button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface AdminNavLinkProps {
    text: string;
    active: boolean;
    onClick: () => void;
    icon: React.FC<{ className?: string }>;
    badge?: number;
}
const AdminNavLink: React.FC<AdminNavLinkProps> = ({ text, active, onClick, icon: Icon, badge }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
        active ? 'bg-primary/10 text-primary' : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3 text-text-secondary" />
        <span>{text}</span>
      </div>
      {badge && (
        <span className="bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
        </span>
      )}
    </button>
)

export default AdminDashboard;
