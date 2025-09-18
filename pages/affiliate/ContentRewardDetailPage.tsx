import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentRewardCampaign, ContentSubmission } from '../../types';
import { listenToContentRewardCampaigns, listenToSubmissionsForAffiliate, submitContentForReview } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ChevronLeftIcon } from '../../components/icons/Icons';
import SubmissionCard from '../../components/affiliate/SubmissionCard';

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
        
        // Let listeners populate
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

    return (
        <div className="space-y-4">
            <div className="p-4">
                <Link to="/rewards" className="inline-flex items-center text-sm text-text-secondary hover:text-primary font-medium">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Rewards
                </Link>
            </div>
            
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-48 object-cover" />
            
            <div className="p-4 space-y-4">
                <h1 className="text-3xl font-bold text-center">Make ${campaign.payoutRate.toFixed(2)} per 1,000 views</h1>
                <p className="text-center text-text-secondary">{campaign.title}</p>
                
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-2xl font-bold">{campaign.participantCount}</p>
                        <p className="text-xs text-text-secondary">Creators</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">${campaign.totalPaidOut.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">Paid Out</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">{campaign.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">Total Views</p>
                    </div>
                </div>

                <Card>
                    <CardContent>
                        <h2 className="font-bold text-lg">Content Brief</h2>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap mt-2">{campaign.contentBrief}</p>
                    </CardContent>
                </Card>

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
                    <div className="space-y-4">
                        <h2 className="font-bold text-lg pt-4">My Submissions for this Campaign</h2>
                        {submissions.map(sub => (
                            <SubmissionCard key={sub.id} submission={sub} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentRewardDetailPage;