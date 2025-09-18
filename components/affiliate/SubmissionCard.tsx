
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentSubmission } from '../../types';
import Card, { CardContent } from '../ui/Card';

interface SubmissionCardProps {
    submission: ContentSubmission;
}

const getStatusBadgeStyle = (status: ContentSubmission['status']) => {
    switch (status) {
        case 'PendingReview': return 'bg-yellow-500/20 text-yellow-400';
        case 'Approved': return 'bg-blue-500/20 text-blue-400';
        case 'AwaitingPayout': return 'bg-primary/20 text-primary';
        case 'Paid': return 'bg-green-500/20 text-green-400';
        case 'Rejected': return 'bg-red-500/20 text-red-400';
        default: return 'bg-surface text-text-secondary';
    }
};

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
    const statusStyle = getStatusBadgeStyle(submission.status);
    const statusText = submission.status.replace(/([A-Z])/g, ' $1').trim();

    return (
        <Link to={`/rewards/${submission.campaignId}`}>
            <Card className="hover:bg-white/5 transition-colors">
                <CardContent>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-text-primary flex-1 mr-2 line-clamp-2">{submission.campaignTitle}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusStyle}`}>
                            {statusText}
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                        Submitted on {submission.submittedAt.toLocaleDateString()}
                    </p>
                     <a 
                        href={submission.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                        View Submitted Video
                    </a>
                    {submission.status === 'Rejected' && submission.rejectionReason && (
                         <p className="text-xs text-red-400 mt-2 p-2 bg-red-900/50 rounded-lg">
                            <strong>Reason:</strong> {submission.rejectionReason}
                         </p>
                    )}
                     {submission.status === 'Paid' && (
                         <p className="text-sm font-semibold text-green-400 mt-2">
                            Paid: ${submission.calculatedEarnings?.toFixed(2)}
                         </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};

export default SubmissionCard;
