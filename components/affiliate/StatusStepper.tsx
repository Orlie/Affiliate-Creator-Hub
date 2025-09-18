import React from 'react';
import { ContentSubmission } from '../../types';

interface StatusStepperProps {
    status: ContentSubmission['status'];
}

const STEPS = ['Submitted', 'In Review', 'Approved', 'Paid'];

const getStepForStatus = (status: ContentSubmission['status']): number => {
    switch (status) {
        case 'PendingReview':
            return 1;
        case 'Approved':
            return 2;
        case 'AwaitingPayout':
            return 3;
        case 'Paid':
            return 4;
        case 'Rejected':
            return 1; // It fails at the first step
        default:
            return 0;
    }
};

const StatusStepper: React.FC<StatusStepperProps> = ({ status }) => {
    const currentStep = getStepForStatus(status);
    const isRejected = status === 'Rejected';

    return (
        <div className="relative pt-8">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border" style={{ transform: 'translateY(-50%)' }}></div>
            <div 
                className={`absolute top-1/2 left-0 h-0.5 ${isRejected ? 'bg-red-500' : 'bg-primary'} transition-all duration-500`} 
                style={{ transform: 'translateY(-50%)', width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            <div className="flex justify-between items-start relative">
                {STEPS.map((label, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const stepColor = isRejected && isActive ? 'bg-red-500 border-red-500' : isActive ? 'bg-primary border-primary' : 'bg-surface border-border';
                    const textColor = isCurrent ? (isRejected ? 'text-red-400' : 'text-primary') : 'text-text-secondary';

                    return (
                        <div key={label} className="flex flex-col items-center text-center w-1/4">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stepColor}`}>
                                {isActive && !isRejected && <div className="w-2 h-2 bg-background rounded-full"></div>}
                                {isRejected && stepNumber === 1 && <span className="text-white font-bold text-sm">!</span>}
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${textColor}`}>
                                {isRejected && stepNumber === 1 ? 'Rejected' : label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusStepper;