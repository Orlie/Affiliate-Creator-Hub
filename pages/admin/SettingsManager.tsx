import React, { useState, useEffect } from 'react';
import { GlobalSettings } from '../../types';
import { listenToGlobalSettings, updateGlobalSettings } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Community Links state
  const [discordUrl, setDiscordUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [linksSaved, setLinksSaved] = useState(false);

  // Onboarding Links state
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingSaved, setOnboardingSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToGlobalSettings((data) => {
      setSettings(data);
      if (data) {
        setDiscordUrl(data.discordInviteUrl || '');
        setFacebookUrl(data.facebookGroupUrl || '');
        setTiktokUrl(data.tiktokShowcaseUrl || '');
        setYoutubeUrl(data.youtubeTutorialUrl || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = (key: keyof GlobalSettings, value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings); // Optimistic update
    updateGlobalSettings({ [key]: value });
  };
  
  const handleSaveLinks = async () => {
    setIsSavingLinks(true);
    setLinksSaved(false);
    try {
        await updateGlobalSettings({
            discordInviteUrl: discordUrl,
            facebookGroupUrl: facebookUrl,
        });
        setLinksSaved(true);
        setTimeout(() => setLinksSaved(false), 2500);
    } catch (error: any) {
        console.error("Failed to save links:", error);
        let errorMessage = "There was an error saving the links. Please try again.";
        if (error.code === 'permission-denied') {
            errorMessage = "Permission Denied: Your account does not have permission to save these settings. Please check your Firestore security rules to ensure admins have write access to the 'settings' collection.";
        }
        alert(errorMessage);
    } finally {
        setIsSavingLinks(false);
    }
  };

  const handleSaveOnboardingLinks = async () => {
    setIsSavingOnboarding(true);
    setOnboardingSaved(false);
    try {
        await updateGlobalSettings({
            tiktokShowcaseUrl: tiktokUrl,
            youtubeTutorialUrl: youtubeUrl,
        });
        setOnboardingSaved(true);
        setTimeout(() => setOnboardingSaved(false), 2500);
    } catch (error: any) {
        console.error("Failed to save onboarding links:", error);
        let errorMessage = "There was an error saving the links. Please try again.";
        if (error.code === 'permission-denied') {
            errorMessage = "Permission Denied: Your account does not have permission to save these settings. Please check your Firestore security rules.";
        }
        alert(errorMessage);
    } finally {
        setIsSavingOnboarding(false);
    }
  };


  if (loading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <p>Loading settings...</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hub Settings</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Manage global feature flags and settings for the affiliate hub.</p>

      <Card className="mt-8 max-w-2xl">
        <CardContent>
            <h2 className="text-xl font-bold">Feature Flags</h2>
            <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                <div className="py-4 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Require Video & Ad Code for Samples</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            If ON, affiliates must submit a video/code and be approved to unlock their share link & QR code.
                        </p>
                    </div>
                    <label htmlFor="require-approval-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.requireVideoApproval ?? true}
                            onChange={(e) => handleToggle('requireVideoApproval', e.target.checked)}
                            id="require-approval-toggle"
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card className="mt-8 max-w-2xl">
        <CardContent>
            <h2 className="text-xl font-bold">Community Links</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage the community links shown to new affiliates during onboarding. Leave blank to hide a link.
            </p>
            <div className="mt-6 space-y-4">
                <Input
                    label="Discord Invite URL"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="https://discord.gg/..."
                />
                <Input
                    label="Facebook Group URL"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/groups/..."
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSaveLinks} disabled={isSavingLinks} className="w-full">
                    {isSavingLinks ? 'Saving...' : linksSaved ? 'Saved!' : 'Save Community Links'}
                </Button>
            </div>
        </CardContent>
      </Card>

       <Card className="mt-8 max-w-2xl">
        <CardContent>
            <h2 className="text-xl font-bold">Onboarding Links</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage links used in the multi-step affiliate onboarding guide. Leave blank to hide a button.
            </p>
            <div className="mt-6 space-y-4">
                <Input
                    label="TikTok Showcase URL"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://affiliate-us.tiktok.com/..."
                />
                <Input
                    label="Tutorial Video URL"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/..."
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSaveOnboardingLinks} disabled={isSavingOnboarding} className="w-full">
                    {isSavingOnboarding ? 'Saving...' : onboardingSaved ? 'Saved!' : 'Save Onboarding Links'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;