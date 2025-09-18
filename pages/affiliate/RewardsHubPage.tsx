import React, { useState } from 'react';
import ContentRewardsPage from './ContentRewardsPage';
import MySubmissionsPage from './MySubmissionsPage';

type RewardsTab = 'discover' | 'submissions';

const RewardsHubPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RewardsTab>('discover');

    return (
        <div>
            <div className="p-4 border-b border-border">
                <nav className="flex space-x-2 p-1 bg-surface rounded-lg">
                    <button 
                        onClick={() => setActiveTab('discover')} 
                        className={`flex-1 py-1.5 px-3 text-sm font-semibold rounded-md transition-colors ${
                            activeTab === 'discover' ? 'bg-background text-text-primary shadow' : 'text-text-secondary'
                        }`}
                    >
                        Discover
                    </button>
                    <button 
                        onClick={() => setActiveTab('submissions')} 
                        className={`flex-1 py-1.5 px-3 text-sm font-semibold rounded-md transition-colors ${
                            activeTab === 'submissions' ? 'bg-background text-text-primary shadow' : 'text-text-secondary'
                        }`}
                    >
                        My Submissions
                    </button>
                </nav>
            </div>
            <div className="p-4">
              {activeTab === 'discover' ? <ContentRewardsPage /> : <MySubmissionsPage />}
            </div>
        </div>
    );
};

export default RewardsHubPage;