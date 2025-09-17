import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { listenToGlobalSettings } from '../../services/mockApi';
import { GlobalSettings } from '../../types';

const CommunityOnboardingGate: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [discordUsername, setDiscordUsername] = useState(user?.discordUsername || '');
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = listenToGlobalSettings(setSettings);
        return () => unsubscribe();
    }, []);

    const showDiscordInput = !user?.discordUsername;

    const handleConfirm = async () => {
        if (showDiscordInput && !discordUsername.trim()) {
            setError('Please enter your Discord username to continue.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const profileUpdate: {
                onboardingStatus: 'needsToShowcase';
                discordUsername?: string;
            } = {
                onboardingStatus: 'needsToShowcase',
            };
            if (showDiscordInput) {
                profileUpdate.discordUsername = discordUsername;
            }
            await updateProfile(profileUpdate);
            // The AffiliateDashboard will re-render and show the main app
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('There was an error saving your information. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto flex flex-col justify-center items-center bg-background p-4 font-sans">
            <Card className="w-full">
                <CardContent className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary">Welcome to the Creator Hub!</h1>
                    <p className="mt-2 text-text-secondary">
                        Join our exclusive communities to connect with other creators and get the latest updates. This is a required first step.
                    </p>

                    <div className="mt-6 space-y-3">
                        {settings?.discordInviteUrl && (
                            <a href={settings.discordInviteUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <Button variant="secondary" className="w-full">Join our Discord</Button>
                            </a>
                        )}
                        {settings?.facebookGroupUrl && (
                            <a href={settings.facebookGroupUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <Button variant="secondary" className="w-full">Join our Facebook Group</Button>
                            </a>
                        )}
                    </div>
                    
                    {showDiscordInput && (
                        <div className="mt-6 text-left">
                            <Input
                                id="discordUsername"
                                label="Your Discord Username"
                                placeholder="username#1234"
                                value={discordUsername}
                                onChange={(e) => setDiscordUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

                    <Button className="w-full mt-6" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Unlocking...' : "I've Joined & Confirmed!"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default CommunityOnboardingGate;