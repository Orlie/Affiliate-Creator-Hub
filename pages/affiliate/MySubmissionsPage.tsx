
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContentSubmission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { listenToSubmissionsForAffiliate } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import { ChevronLeftIcon } from '../../components/icons/Icons';
import SubmissionCard from '../../components/affiliate/SubmissionCard';

const MySubmissionsPage: React.FC = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const unsubscribe = listenToSubmissionsForAffiliate(user.uid, data => {
            setSubmissions(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <Link to="/rewards" className="flex items-center text-sm text-text-secondary hover:text-primary font-medium">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Rewards
                </Link>
            </div>
            <h2 className="text-xl font-bold text-text-primary text-center">My Submissions</h2>

            {loading && <p className="text-center text-text-secondary">Loading your submissions...</p>}
            
            {!loading && submissions.length === 0 && (
                 <Card>
                    <CardContent className="text-center py-10">
                        <h3 className="text-lg font-semibold text-text-primary">No Submissions Yet</h3>
                        <p className="mt-2 text-sm text-text-secondary">You haven't submitted any videos for Content Rewards. Browse the Rewards tab to get started.</p>
                    </CardContent>
                </Card>
            )}

            {!loading && submissions.length > 0 && (
                <div className="space-y-3">
                    {submissions.map(sub => (
                       <SubmissionCard key={sub.id} submission={sub} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubmissionsPage;
