import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserOnboardingStatus, listenToGlobalSettings } from '../../services/mockApi';
import { GlobalSettings } from '../../types';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';

const OnboardingGuide: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        const unsubscribe = listenToGlobalSettings(setSettings);
        return () => unsubscribe();
    }, []);

    if (!user || !user.onboardingStatus || user.onboardingStatus === 'completed' || user.onboardingStatus === 'needsToJoinCommunity') {
        return null;
    }

    const handleStep1Click = async () => {
        if (!settings?.tiktokShowcaseUrl) {
            console.error("TikTok Showcase URL is not configured by the admin.");
            return;
        }
        setLoading(true);
        window.open(settings.tiktokShowcaseUrl, '_blank');
        try {
            await updateUserOnboardingStatus(user.uid, 'pendingAdminAuthorization');
            // State will update via listener on AuthContext, which will re-render TasksPage
        } catch (error) {
            console.error('Failed to update status:', error);
            // Optionally show an error to the user
        } finally {
            setLoading(false);
        }
    };
    
    const handleStep3Click = async () => {
        setLoading(true);
        try {
            await updateUserOnboardingStatus(user.uid, 'completed');
            // State will update and this component will disappear
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (user.onboardingStatus) {
            case 'needsToShowcase':
                return (
                    <div>
                        <h3 className="font-bold text-text-primary text-lg">Step 1 of 3: Add to Showcase</h3>
                        <p className="text-sm text-text-secondary mt-2">
                            Welcome! Your first step is to add our featured product to your TikTok Showcase.
                        </p>
                        {settings?.tiktokShowcaseUrl && (
                            <Button className="w-full mt-4" onClick={handleStep1Click} disabled={loading}>
                                {loading ? 'Updating...' : 'Add to Showcase'}
                            </Button>
                        )}
                    </div>
                );
            case 'pendingAdminAuthorization':
                return (
                    <div>
                        <h3 className="font-bold text-text-primary text-lg">Step 2 of 3: Awaiting Authorization</h3>
                        <p className="text-sm text-text-secondary mt-2">
                            Great job! Our admin team has been notified. We will send you an authorization request on TikTok within 24 hours. Please keep an eye out for it!
                        </p>
                    </div>
                );
            case 'pendingAffiliateAcceptance':
                return (
                    <div>
                        <h3 className="font-bold text-text-primary text-lg">Step 3 of 3: Authorize & Learn</h3>
                        <div className="text-sm text-text-secondary mt-2 space-y-3">
                           <p><strong>Action Required:</strong> Please accept the authorization request we sent you on TikTok.</p>
                           <p><strong>Action Required:</strong> Watch this quick tutorial video to learn how to get started with samples.</p>
                        </div>
                        {settings?.youtubeTutorialUrl && (
                            <a href={settings.youtubeTutorialUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button variant="secondary" className="w-full mt-4">Watch Tutorial Video</Button>
                            </a>
                        )}
                        <Button className="w-full mt-2" onClick={handleStep3Click} disabled={loading}>
                            {loading ? 'Completing...' : 'All Done! Let\'s Go!'}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="border-2 border-primary">
            <CardContent>
                <h2 className="text-sm font-bold uppercase text-primary tracking-wider">Getting Started</h2>
                <div className="mt-2">
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
    );
};

export default OnboardingGuide;