import React, { useState, useEffect, useMemo } from 'react';
import { ContentRewardCampaign, ContentSubmission, CampaignPlatform } from '../../types';
import { listenToAllContentRewardCampaignsAdmin, addContentRewardCampaign, updateContentRewardCampaign, listenToSubmissionsForCampaign, updateContentSubmission, finalizeSubmissionPayout } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

// --- Helper type for the modal form state ---
type EditableCampaign = Omit<Partial<ContentRewardCampaign>, 'requirements' | 'assets'> & {
    requirements?: string; // Stored as a newline-separated string in the form
    assets?: { title: string; url: string }[];
};


const ContentRewardsManager: React.FC = () => {
    const [campaigns, setCampaigns] = useState<ContentRewardCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<ContentRewardCampaign | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCampaignData, setCurrentCampaignData] = useState<EditableCampaign | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToAllContentRewardCampaignsAdmin(data => {
            setCampaigns(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleOpenModal = (campaign?: ContentRewardCampaign) => {
        if (campaign) {
            // Convert arrays to string/object for editing
            setCurrentCampaignData({
                ...campaign,
                requirements: campaign.requirements?.join('\n') || '',
                assets: campaign.assets || [],
            });
        } else {
            setCurrentCampaignData({ requirements: '', assets: [], platforms: [] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCampaignData(null);
    };

    const handleSaveCampaign = async () => {
        if (!currentCampaignData || !currentCampaignData.title) return;
        
        // Convert form data back to the correct types
        const dataToSave: Partial<ContentRewardCampaign> = {
            ...currentCampaignData,
            payoutRate: Number(currentCampaignData.payoutRate || 0),
            totalBudget: Number(currentCampaignData.totalBudget || 0),
            minimumPayout: Number(currentCampaignData.minimumPayout || 0),
            maximumPayout: Number(currentCampaignData.maximumPayout || 0),
            platforms: currentCampaignData.platforms || [],
            status: currentCampaignData.status || 'Active',
            requirements: typeof currentCampaignData.requirements === 'string' 
                ? currentCampaignData.requirements.split('\n').filter(r => r.trim() !== '') 
                : [],
            assets: currentCampaignData.assets || [],
            contentBrief: '', // Deprecated, but ensure it's cleared
        };

        if (currentCampaignData.id) {
            await updateContentRewardCampaign(currentCampaignData.id, dataToSave);
        } else {
            await addContentRewardCampaign(dataToSave as any);
        }
        handleCloseModal();
    };

    if (selectedCampaign) {
        return <ContentSubmissionReview campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Content Rewards</h1>
                    <p className="mt-2 text-text-secondary">Create and manage pay-per-view campaigns for affiliates.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>Create Campaign</Button>
            </div>
            
            <div className="mt-8 space-y-4">
                {loading && <p>Loading campaigns...</p>}
                {!loading && campaigns.length === 0 && <p>No campaigns created yet.</p>}
                {campaigns.map(campaign => (
                    <Card key={campaign.id} className="hover:bg-surface/80 transition-colors">
                        <CardContent>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-text-primary">{campaign.title}</p>
                                    <p className="text-sm text-primary">${campaign.payoutRate.toFixed(2)} / 1k views</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(campaign)}>Edit</Button>
                                    <Button size="sm" onClick={() => setSelectedCampaign(campaign)}>View Submissions</Button>
                                </div>
                            </div>
                             <div className="mt-4">
                                <p className="text-sm font-medium text-text-secondary">Budget</p>
                                <div className="w-full bg-background rounded-full h-2.5 mt-1">
                                    <div className="bg-primary h-2.5 rounded-full" style={{width: `${(campaign.totalPaidOut / campaign.totalBudget) * 100}%`}}></div>
                                </div>
                                <p className="text-xs text-text-secondary mt-1 text-right">${campaign.totalPaidOut.toLocaleString()} / ${campaign.totalBudget.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isModalOpen && <CampaignModal campaign={currentCampaignData} onClose={handleCloseModal} onSave={handleSaveCampaign} setData={setCurrentCampaignData} />}
        </div>
    );
};

// --- Submission Review Component (Nested) ---
type ReviewTab = 'PendingReview' | 'Approved' | 'AwaitingPayout' | 'Paid' | 'Rejected';

const ContentSubmissionReview: React.FC<{ campaign: ContentRewardCampaign, onBack: () => void }> = ({ campaign, onBack }) => {
    const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ReviewTab>('PendingReview');
    const [rejectionReason, setRejectionReason] = useState('');
    const [finalViews, setFinalViews] = useState<Record<string, string>>({});

    useEffect(() => {
        setLoading(true);
        setError(null);
        const unsubscribe = listenToSubmissionsForCampaign(
            campaign.id, 
            data => {
                setSubmissions(data);
                setLoading(false);
            },
            (err) => {
                console.error("Submission listener error:", err);
                setError("Could not load submissions. This is often caused by a missing database index. Please open the developer console (F12) and look for a Firestore error message containing a link to create the required index.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [campaign.id]);
    
    const filteredSubmissions = useMemo(() => submissions.filter(s => s.status === activeTab), [submissions, activeTab]);

    const handleApprove = (id: string) => updateContentSubmission(id, { status: 'Approved', approvedAt: new Date() });
    const handleReject = (id: string) => updateContentSubmission(id, { status: 'Rejected', rejectionReason });

    const handleFinalize = async (sub: ContentSubmission) => {
        const views = parseInt(finalViews[sub.id] || '0', 10);
        if (views > 0) {
            await finalizeSubmissionPayout(sub, views);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back to Campaigns</Button>
            <h1 className="text-3xl font-bold mt-4">{campaign.title}</h1>
            <p className="text-text-secondary">Reviewing Submissions</p>
            
            <div className="mt-6 border-b border-border">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {(['PendingReview', 'Approved', 'AwaitingPayout', 'Paid', 'Rejected'] as ReviewTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {tab.replace(/([A-Z])/g, ' $1').trim()} ({submissions.filter(s => s.status === tab).length})
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-8 space-y-4">
                {loading && <p>Loading submissions...</p>}
                {error && <p className="p-4 text-center bg-red-900/50 text-red-300 rounded-lg">{error}</p>}
                {!loading && !error && filteredSubmissions.length === 0 && <p>No submissions in this queue.</p>}
                {!loading && !error && filteredSubmissions.map(sub => (
                    <Card key={sub.id}>
                        <CardContent>
                            <p className="font-bold">{sub.affiliateTiktok}</p>
                            <p className="text-sm text-text-secondary">Submitted: {sub.submittedAt.toLocaleString()}</p>
                            <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">View Video</a>
                            
                            {sub.status === 'PendingReview' && (
                                <div className="mt-4 flex gap-2 items-center">
                                    <Input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Rejection reason (optional)" className="flex-1"/>
                                    <Button size="sm" variant="danger" onClick={() => handleReject(sub.id)}>Reject</Button>
                                    <Button size="sm" onClick={() => handleApprove(sub.id)}>Approve</Button>
                                </div>
                            )}
                             {sub.status === 'AwaitingPayout' && (
                                <div className="mt-4">
                                    <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-semibold">View Proof Screenshot</a>
                                    <div className="flex gap-2 items-center mt-2">
                                        <Input type="number" value={finalViews[sub.id] || ''} onChange={e => setFinalViews({...finalViews, [sub.id]: e.target.value})} placeholder="Final View Count" className="flex-1"/>
                                        <Button size="sm" onClick={() => handleFinalize(sub)}>Finalize & Pay</Button>
                                    </div>
                                </div>
                            )}
                            {sub.status === 'Paid' && (
                                <div className="mt-2 text-sm">
                                    <p>Views: {sub.finalViewCount?.toLocaleString()}</p>
                                    <p className="font-semibold text-green-400">Paid: ${sub.calculatedEarnings?.toFixed(2)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- Campaign Create/Edit Modal ---
const CampaignModal: React.FC<{campaign: EditableCampaign | null, onClose: () => void, onSave: () => void, setData: (data: any) => void}> = ({ campaign, onClose, onSave, setData }) => {
    if (!campaign) return null;

    const handlePlatformToggle = (platform: CampaignPlatform) => {
        const current = campaign.platforms || [];
        const newPlatforms = current.includes(platform) ? current.filter(p => p !== platform) : [...current, platform];
        setData({ ...campaign, platforms: newPlatforms });
    };
    
    const handleAssetChange = (index: number, field: 'title' | 'url', value: string) => {
        const newAssets = [...(campaign.assets || [])];
        newAssets[index] = { ...newAssets[index], [field]: value };
        setData({ ...campaign, assets: newAssets });
    };

    const addAsset = () => setData({ ...campaign, assets: [...(campaign.assets || []), { title: '', url: '' }] });
    const removeAsset = (index: number) => setData({ ...campaign, assets: (campaign.assets || []).filter((_, i) => i !== index) });

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="p-6 text-2xl font-bold border-b border-border flex-shrink-0">{campaign.id ? 'Edit' : 'Create'} Content Reward Campaign</h2>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <Input label="Title" value={campaign.title || ''} onChange={e => setData({ ...campaign, title: e.target.value })} />
                    <Input label="Image URL" value={campaign.imageUrl || ''} onChange={e => setData({ ...campaign, imageUrl: e.target.value })} />
                    <Input label="Info Banner Text (Optional)" value={campaign.infoBannerText || ''} onChange={e => setData({ ...campaign, infoBannerText: e.target.value })} />
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input label="Payout Rate ($/1k views)" type="number" value={campaign.payoutRate || ''} onChange={e => setData({ ...campaign, payoutRate: e.target.value })} />
                        <Input label="Total Budget ($)" type="number" value={campaign.totalBudget || ''} onChange={e => setData({ ...campaign, totalBudget: e.target.value })} />
                        <Input label="Minimum Payout ($)" type="number" value={campaign.minimumPayout || ''} onChange={e => setData({ ...campaign, minimumPayout: e.target.value })} />
                        <Input label="Maximum Payout ($)" type="number" value={campaign.maximumPayout || ''} onChange={e => setData({ ...campaign, maximumPayout: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Campaign Type (e.g., Clipping)" value={campaign.type || ''} onChange={e => setData({ ...campaign, type: e.target.value })} />
                        <Input label="Category (e.g., Products)" value={campaign.category || ''} onChange={e => setData({ ...campaign, category: e.target.value })} />
                    </div>
                    <Textarea label="Requirements (one per line)" value={campaign.requirements || ''} onChange={e => setData({ ...campaign, requirements: e.target.value })} rows={5} />
                    
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Assets</label>
                        <div className="space-y-2">
                        {(campaign.assets || []).map((asset, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-surface/50">
                                <Input placeholder="Asset Title" value={asset.title} onChange={e => handleAssetChange(index, 'title', e.target.value)} className="flex-1" />
                                <Input placeholder="Asset URL" value={asset.url} onChange={e => handleAssetChange(index, 'url', e.target.value)} className="flex-1" />
                                <Button variant="danger" size="sm" onClick={() => removeAsset(index)}>X</Button>
                            </div>
                        ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={addAsset} className="mt-2">Add Asset</Button>
                    </div>

                    <Textarea label="Disclaimer (Optional)" value={campaign.disclaimer || ''} onChange={e => setData({ ...campaign, disclaimer: e.target.value })} rows={3} />

                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Platforms</label>
                        <div className="flex gap-2">
                            {(['TikTok', 'Instagram', 'YouTube'] as CampaignPlatform[]).map(p => (
                                <Button key={p} variant={(campaign.platforms || []).includes(p) ? 'primary' : 'secondary'} onClick={() => handlePlatformToggle(p)}>{p}</Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                        <select value={campaign.status || 'Active'} onChange={e => setData({ ...campaign, status: e.target.value as any })} className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md">
                            <option value="Active">Active</option>
                            <option value="Ended">Ended</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 flex justify-end space-x-3 border-t border-border flex-shrink-0">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave}>Save Campaign</Button>
                </div>
            </Card>
        </div>
    );
}

export default ContentRewardsManager;