import React, { useState, useEffect, useMemo } from 'react';
import { ContentRewardCampaign, GlobalSettings } from '../../types';
import { listenToContentRewardCampaigns, listenToGlobalSettings } from '../../services/mockApi';
import ContentRewardCampaignCard from '../../components/affiliate/ContentRewardCampaignCard';

const ContentRewardsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<ContentRewardCampaign[]>([]);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('budget');

    useEffect(() => {
        setLoading(true);
        const unsubscribeCampaigns = listenToContentRewardCampaigns(data => {
            setCampaigns(data);
            setLoading(false);
        });
        const unsubscribeSettings = listenToGlobalSettings(setSettings);
        return () => {
            unsubscribeCampaigns();
            unsubscribeSettings();
        };
    }, []);

    const sortedCampaigns = useMemo(() => {
        return [...campaigns].sort((a, b) => {
            switch (sortBy) {
                case 'budget':
                    return (b.totalBudget - b.totalPaidOut) - (a.totalBudget - a.totalPaidOut);
                case 'payout':
                    return b.payoutRate - a.payoutRate;
                case 'newest':
                    return b.createdAt.getTime() - a.createdAt.getTime();
                default:
                    return 0;
            }
        });
    }, [campaigns, sortBy]);

    const headerText = settings?.contentRewardsHeaderText || "Content Rewards";
    const subtext = settings?.contentRewardsHeaderSubtext || "Post content on social media and get paid for the views you generate. Learn more.";

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary">{headerText}</h1>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{subtext}</p>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-text-secondary">{sortedCampaigns.length} Live Content Rewards</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border-border bg-surface rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    <option value="budget">Highest available budget</option>
                    <option value="payout">Highest payout rate</option>
                    <option value="newest">Newest</option>
                </select>
            </div>
            
            {loading && <p className="text-center">Loading opportunities...</p>}
            
            <div className="grid grid-cols-1 gap-4">
                {sortedCampaigns.map(campaign => (
                    <ContentRewardCampaignCard key={campaign.id} campaign={campaign} />
                ))}
            </div>
        </div>
    );
};

export default ContentRewardsPage;