import React, { useState, useEffect } from 'react';
import { ContentSubmission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { listenToSubmissionsForAffiliate } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
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
        <div className="space-y-4">
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