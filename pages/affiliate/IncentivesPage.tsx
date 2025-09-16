

import React, { useState, useEffect } from 'react';
import { IncentiveCampaign } from '../../types';
import { listenToIncentives, joinIncentiveCampaign } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const IncentivesPage: React.FC = () => {
    const [incentives, setIncentives] = useState<IncentiveCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinedCampaigns, setJoinedCampaigns] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToIncentives((data) => {
            setIncentives(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const handleJoinCampaign = async (campaignId: string) => {
        if (joinedCampaigns.has(campaignId)) return;

        // Optimistically update UI
        setJoinedCampaigns(prev => new Set(prev).add(campaignId));

        try {
            await joinIncentiveCampaign(campaignId);
            // Data will refresh automatically via the listener
        } catch (error) {
            console.error("Failed to join campaign:", error);
            alert("There was an error joining the campaign. Please try again.");
            // Revert optimistic state update on error
            setJoinedCampaigns(prev => {
                const newSet = new Set(prev);
                newSet.delete(campaignId);
                return newSet;
            });
        }
    };

    if (loading) return <p className="p-4 text-center">Loading incentives...</p>;

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">Incentive Programs</h2>

            {incentives.map(campaign => {
                const progress = Math.min((campaign.joinedAffiliates / campaign.minAffiliates) * 100, 100);
                const isJoined = joinedCampaigns.has(campaign.id);
                const isEnded = new Date() > campaign.endDate;

                return (
                    <Card key={campaign.id}>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.type === 'GMV Tiers' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                    {campaign.type}
                                </span>
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                     isEnded ? 'bg-surface text-text-secondary' :
                                     campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                     'bg-yellow-500/20 text-yellow-400'
                                 }`}>
                                    {isEnded ? 'Ended' : campaign.status}
                                </span>
                            </div>
                            <h3 className="mt-2 text-lg font-bold text-text-primary">{campaign.title}</h3>
                            <p className="text-sm font-medium text-text-secondary">{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</p>
                            <p className="mt-3 text-sm text-text-secondary">{campaign.description}</p>
                            
                            <div className="mt-4 pt-4 border-t border-border">
                               <h4 className="text-sm font-semibold text-text-primary">Rules:</h4>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-text-secondary">
                                    {campaign.rules.map((rule, index) => <li key={index}>{rule}</li>)}
                                </ul>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-sm font-semibold text-text-primary">Activation Progress:</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-full bg-surface rounded-full h-2.5">
                                        <div 
                                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${progress}%` }}
                                            data-testid={`progress-bar-${campaign.id}`}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
                                        {campaign.joinedAffiliates} / {campaign.minAffiliates}
                                    </span>
                                </div>
                                <p className="text-xs text-center mt-1 text-text-secondary/70">
                                    {campaign.status === 'Pending' ? 'Campaign activates when goal is met.' : 'Campaign is active!'}
                                </p>
                            </div>
                            
                            <div className="mt-4">
                                <Button 
                                    className="w-full" 
                                    onClick={() => handleJoinCampaign(campaign.id)}
                                    disabled={isJoined || isEnded}
                                    data-testid={`join-campaign-${campaign.id}`}
                                >
                                    {isEnded ? 'Campaign Ended' : isJoined ? 'Joined' : 'Join Campaign'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
};

export default IncentivesPage;