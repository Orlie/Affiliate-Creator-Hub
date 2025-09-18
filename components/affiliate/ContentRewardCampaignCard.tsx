
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentRewardCampaign } from '../../types';
import Card, { CardContent } from '../ui/Card';
import { TikTokIcon, InstagramIcon, YouTubeIcon } from '../icons/Icons';

interface ContentRewardCampaignCardProps {
    campaign: ContentRewardCampaign;
}

const platformIcons = {
    'TikTok': TikTokIcon,
    'Instagram': InstagramIcon,
    'YouTube': YouTubeIcon,
};

const ContentRewardCampaignCard: React.FC<ContentRewardCampaignCardProps> = ({ campaign }) => {
    const budgetProgress = campaign.totalBudget > 0 ? (campaign.totalPaidOut / campaign.totalBudget) * 100 : 0;

    return (
        <Link to={`/rewards/${campaign.id}`} className="block">
            <Card className="hover:border-primary/50 transition-colors">
                <CardContent>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-bold text-text-primary">{campaign.title}</h3>
                            <p className="text-sm text-text-secondary line-clamp-1">
                               Earn ${campaign.payoutRate.toFixed(2)} per 1,000 Views
                            </p>
                        </div>
                        <span className="ml-4 px-3 py-1 text-sm font-bold bg-blue-500/20 text-blue-400 rounded-full">${campaign.payoutRate.toFixed(2)} / 1K</span>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                        <div>
                            <p className="text-xs text-text-secondary uppercase font-semibold">Type</p>
                            <p className="text-sm font-medium">{campaign.type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary uppercase font-semibold">Platforms</p>
                            <div className="flex gap-2 mt-1">
                                {campaign.platforms.map(p => {
                                    const Icon = platformIcons[p];
                                    return <Icon key={p} className="h-5 w-5" />;
                                })}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary uppercase font-semibold">Views</p>
                            <p className="text-sm font-medium">{campaign.totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                            <span>${campaign.totalPaidOut.toLocaleString()} paid out</span>
                            <span>{budgetProgress.toFixed(0)}%</span>
                        </div>
                         <div className="w-full bg-background rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{width: `${budgetProgress}%`}}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ContentRewardCampaignCard;
