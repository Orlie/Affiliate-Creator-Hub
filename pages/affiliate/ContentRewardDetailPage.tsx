import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentRewardCampaign, ContentSubmission } from '../../types';
import { listenToContentRewardCampaigns, listenToSubmissionsForAffiliate, submitContentForReview } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ChevronLeftIcon, InformationCircleIcon, DocumentTextIcon } from '../../components/icons/Icons';
import SubmissionCard from '../../components/affiliate/SubmissionCard';
import { TikTokIcon, InstagramIcon, YouTubeIcon } from '../../components/icons/Icons';

const platformIcons: Record<ContentRewardCampaign['platforms'][number], React.FC<{className?: string}>> = {
    'TikTok': TikTokIcon,
    'Instagram': InstagramIcon,
    'YouTube': YouTubeIcon,
};


const ContentRewardDetailPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState<ContentRewardCampaign | null>(null);
    const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [videoUrl, setVideoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!campaignId) return;
        setLoading(true);

        const unsubCampaigns = listenToContentRewardCampaigns(campaigns => {
            const current = campaigns.find(c => c.id === campaignId);
            setCampaign(current || null);
        });

        const unsubSubmissions = user ? listenToSubmissionsForAffiliate(user.uid, subs => {
             const campaignSubs = subs.filter(s => s.campaignId === campaignId);
            setSubmissions(campaignSubs); // Listener already sorts by newest first
        }) : () => {};
        
        setTimeout(() => setLoading(false), 500);

        return () => {
            unsubCampaigns();
            unsubSubmissions();
        };
    }, [campaignId, user]);

    const handleSubmitVideo = async () => {
        if (!videoUrl || !user || !campaign) return;
        setIsSubmitting(true);
        await submitContentForReview({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            affiliateId: user.uid,
            affiliateTiktok: user.tiktokUsername || '',
            videoUrl,
        });
        setVideoUrl('');
        setIsSubmitting(false);
    };
    
    if (loading) return <p className="p-4 text-center">Loading...</p>;
    if (!campaign) return <p className="p-4 text-center">Campaign not found.</p>;

    const budgetProgress = campaign.totalBudget > 0 ? (campaign.totalPaidOut / campaign.totalBudget) * 100 : 0;

    return (
        <div className="space-y-4 pb-8">
            <div className="p-4">
                <Link to="/rewards" className="inline-flex items-center text-sm text-text-secondary hover:text-primary font-medium">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Rewards
                </Link>
            </div>
            
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-56 object-cover rounded-lg" />
            
            <div className="p-4 space-y-6">
                
                {campaign.infoBannerText && (
                    <div className="p-3 rounded-lg bg-yellow-900/50 border border-yellow-700 text-yellow-300 flex items-center gap-3">
                        <InformationCircleIcon className="h-6 w-6 flex-shrink-0" />
                        <p className="text-sm font-medium">{campaign.infoBannerText}</p>
                    </div>
                )}
                
                <div>
                    <div className="flex justify-between items-center text-sm text-text-secondary">
                        <span>PAID OUT</span>
                        <span>{budgetProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2.5 mt-1">
                        <div className="bg-orange-500 h-2.5 rounded-full" style={{width: `${budgetProgress}%`}}></div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">${campaign.totalPaidOut.toLocaleString()} of ${campaign.totalBudget.toLocaleString()} paid out</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center border-y border-border py-4">
                    <Metric title="REWARD" value={`$${campaign.payoutRate.toFixed(2)} / 1K`} primary />
                    <Metric title="TYPE" value={campaign.type} />
                    <Metric title="MINIMUM PAYOUT" value={`$${campaign.minimumPayout?.toFixed(2) || '1.00'}`} />
                    <Metric title="MAXIMUM PAYOUT" value={`$${campaign.maximumPayout?.toFixed(2) || '250.00'}`} />
                    <Metric title="CATEGORY" value={campaign.category || 'N/A'} />
                    <Metric title="PLATFORMS">
                        <div className="flex justify-center gap-2 mt-1">
                            {campaign.platforms.map(p => {
                                const Icon = platformIcons[p];
                                return <Icon key={p} className="h-6 w-6" />;
                            })}
                        </div>
                    </Metric>
                </div>

                <div>
                    <h2 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-3">Requirements</h2>
                    <div className="flex flex-wrap gap-2">
                        {campaign.requirements.map((req, i) => (
                            <span key={i} className="px-3 py-2 text-sm bg-surface rounded-lg">{req}</span>
                        ))}
                    </div>
                </div>

                {campaign.assets && campaign.assets.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-3">Assets</h2>
                        <div className="space-y-2">
                        {campaign.assets.map((asset, i) => (
                           <a href={asset.url} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors">
                                <DocumentTextIcon className="h-6 w-6 text-text-secondary" />
                                <div>
                                    <p className="font-semibold text-text-primary">{asset.title}</p>
                                    <p className="text-xs text-primary truncate">{asset.url}</p>
                                </div>
                           </a>
                        ))}
                        </div>
                    </div>
                )}

                {campaign.disclaimer && (
                    <div>
                        <h2 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-3">Disclaimer</h2>
                        <p className="text-xs text-text-secondary">{campaign.disclaimer}</p>
                    </div>
                )}

                <div className="pt-6 border-t border-border">
                    <Card>
                        <CardContent>
                            <h2 className="font-bold text-lg">Submit a New Video</h2>
                            <p className="text-sm text-text-secondary mt-1">You can submit multiple videos for this campaign. Each will be reviewed independently.</p>
                            <div className="mt-4 space-y-2">
                                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://tiktok.com/..." />
                                <Button className="w-full" onClick={handleSubmitVideo} disabled={!videoUrl || isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Video'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {submissions.length > 0 && (
                        <div className="space-y-4 mt-6">
                            <h2 className="font-bold text-lg">My Submissions for this Campaign</h2>
                            {submissions.map(sub => (
                                <SubmissionCard key={sub.id} submission={sub} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};


const Metric: React.FC<{title: string; value?: string; primary?: boolean; children?: React.ReactNode}> = ({ title, value, primary = false, children }) => (
    <div>
        <p className="text-xs text-text-secondary uppercase font-semibold">{title}</p>
        {value && <p className={`mt-1 font-bold ${primary ? 'text-primary text-lg' : 'text-text-primary'}`}>{value}</p>}
        {children}
    </div>
);


export default ContentRewardDetailPage;