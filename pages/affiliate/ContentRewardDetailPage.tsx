
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentRewardCampaign, ContentSubmission } from '../../types';
import { listenToContentRewardCampaigns, listenToSubmissionsForAffiliate, submitContentForReview, submitPayoutEvidence } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ChevronLeftIcon } from '../../components/icons/Icons';

const ContentRewardDetailPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState<ContentRewardCampaign | null>(null);
    const [submission, setSubmission] = useState<ContentSubmission | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [videoUrl, setVideoUrl] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [estimatedViews, setEstimatedViews] = useState('');
     const estimatedEarnings = campaign ? (Number(estimatedViews) / 1000) * campaign.payoutRate : 0;

    useEffect(() => {
        if (!campaignId) return;
        setLoading(true);

        const unsubCampaigns = listenToContentRewardCampaigns(campaigns => {
            const current = campaigns.find(c => c.id === campaignId);
            setCampaign(current || null);
        });

        const unsubSubmissions = user ? listenToSubmissionsForAffiliate(user.uid, subs => {
            const current = subs.find(s => s.campaignId === campaignId);
            setSubmission(current || null);
        }) : () => {};

        setLoading(false);

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
    
    const handleSubmitProof = async () => {
        if (!screenshotUrl || !submission) return;
        setIsSubmitting(true);
        await submitPayoutEvidence(submission.id, screenshotUrl);
        setScreenshotUrl('');
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
                        <h2 className="font-bold text-lg">Your Submission</h2>
                        {!submission ? (
                            <div className="space-y-2 mt-2">
                                <p className="text-sm text-text-secondary">Submit your video link to participate.</p>
                                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://tiktok.com/..." />
                                <Button className="w-full" onClick={handleSubmitVideo} disabled={!videoUrl || isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Video'}</Button>
                            </div>
                        ) : (
                            <div className="mt-2 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold">Status: <span className="text-primary">{submission.status.replace(/([A-Z])/g, ' $1').trim()}</span></p>
                                    <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-text-secondary hover:underline">View Your Submission</a>
                                </div>
                                {submission.status === 'Approved' && (
                                     <div>
                                        <h3 className="font-semibold">Earnings Estimator</h3>
                                        <Input type="number" value={estimatedViews} onChange={e => setEstimatedViews(e.target.value)} placeholder="Enter current view count" />
                                        <p className="text-center text-2xl font-bold mt-2 text-green-400">${estimatedEarnings.toFixed(2)}</p>
                                        <p className="text-xs text-center text-text-secondary">Estimated Earnings</p>
                                        <p className="text-xs text-center text-text-secondary mt-4">Once your tracking period ends, you will be prompted here to submit a screenshot for final payout.</p>
                                    </div>
                                )}
                                {submission.status === 'AwaitingPayout' && (
                                    <p className="text-sm p-2 bg-primary/10 text-primary rounded-lg">Your proof has been submitted and is awaiting final review and payout.</p>
                                )}
                                {submission.status === 'Paid' && (
                                     <div className="text-center p-4 bg-green-500/10 rounded-lg">
                                        <p className="font-bold text-2xl text-green-400">${submission.calculatedEarnings?.toFixed(2)}</p>
                                        <p className="text-sm text-green-400">Paid Out!</p>
                                        <p className="text-xs text-text-secondary">{submission.finalViewCount?.toLocaleString()} final views</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContentRewardDetailPage;
