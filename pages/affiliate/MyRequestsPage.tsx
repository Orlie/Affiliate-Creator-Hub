import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, SampleRequest, SampleRequestStatus } from '../../types';
import { listenToSampleRequestsForAffiliate, listenToCampaigns } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardContent } from '../../components/ui/Card';
import { ChevronLeftIcon } from '../../components/icons/Icons';

interface RequestWithCampaign extends SampleRequest {
    campaign?: Campaign;
}

const getStatusBadge = (status: SampleRequestStatus) => {
    switch (status) {
        case 'PendingApproval':
            return { text: 'Pending Approval', color: 'bg-yellow-500/20 text-yellow-400' };
        case 'PendingShowcase':
            return { text: 'Approved', color: 'bg-secondary/20 text-secondary' };
        case 'PendingOrder':
            return { text: 'Ready for Order', color: 'bg-primary/20 text-primary' };
        case 'Shipped':
            return { text: 'Shipped', color: 'bg-green-500/20 text-green-400' };
        case 'Rejected':
            return { text: 'Rejected', color: 'bg-red-500/20 text-red-400' };
        default:
            return { text: status, color: 'bg-surface text-text-secondary' };
    }
};

const MyRequestsPage: React.FC = () => {
    const { user } = useAuth();
    const [allRequests, setAllRequests] = useState<SampleRequest[]>([]);
    const [campaigns, setCampaigns] = useState<Map<string, Campaign>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const unsubCampaigns = listenToCampaigns((campaignData) => {
            setCampaigns(new Map(campaignData.map(c => [c.id, c])));
        });
        
        const unsubRequests = listenToSampleRequestsForAffiliate(user.uid, (requests) => {
            setAllRequests(requests);
            setLoading(false);
        });

        return () => {
            unsubCampaigns();
            unsubRequests();
        };
    }, [user]);
    
    const requestsWithCampaigns: RequestWithCampaign[] = useMemo(() => {
        return allRequests
            .map(req => ({
                ...req,
                campaign: campaigns.get(req.campaignId),
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [allRequests, campaigns]);

    if (loading) {
        return <p className="p-4 text-center text-text-secondary">Loading your requests...</p>;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                 <Link to="/profile" className="flex items-center text-sm text-text-secondary hover:text-primary font-medium">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Profile
                </Link>
            </div>
            <h2 className="text-xl font-bold text-text-primary text-center">My Sample Requests</h2>
            
            {requestsWithCampaigns.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-10">
                        <h3 className="text-lg font-semibold text-text-primary">No Requests Yet</h3>
                        <p className="mt-2 text-sm text-text-secondary">You haven't requested any samples. Browse the Campaigns tab to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {requestsWithCampaigns.map(req => {
                        const status = getStatusBadge(req.status);
                        return (
                            <Link to={`/campaign/${req.campaignId}`} key={req.id}>
                                <Card className="hover:bg-white/5 transition-colors">
                                    <CardContent>
                                        <div className="flex items-start gap-4">
                                            <img 
                                                src={req.campaign?.imageUrl} 
                                                alt={req.campaign?.name} 
                                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0" 
                                            />
                                            <div className="flex-1">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                                                    {status.text}
                                                </span>
                                                <h3 className="font-bold text-text-primary line-clamp-2 mt-1">{req.campaign?.name}</h3>
                                                <p className="text-sm text-text-secondary mt-2">
                                                    Requested on {req.createdAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRequestsPage;