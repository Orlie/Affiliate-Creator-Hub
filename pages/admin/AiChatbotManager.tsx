import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { SparklesIcon, UserCircleIcon } from '../../components/icons/Icons';

// A mock for uploaded files as per spec
const MOCK_FILES = [
    { name: 'onboarding_guide.pdf', size: '1.2 MB' },
    { name: 'commission_rates.docx', size: '340 KB' },
    { name: 'brand_voice.txt', size: '12 KB' },
];

const AiChatbotManager: React.FC = () => {
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful and friendly assistant for the Creator Hub. Your goal is to answer affiliate questions about campaigns, sample requests, and best practices. Be concise and encouraging.');
    const [savedPrompt, setSavedPrompt] = useState(systemPrompt);
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            // Check if API_KEY is available
            if (!process.env.API_KEY) {
                console.warn("API_KEY environment variable not set. AI Chatbot functionality will be disabled.");
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: savedPrompt,
                },
            });
            setChat(newChat);
            setChatHistory([]); // Reset history when prompt changes
        } catch (error) {
            console.error("Error initializing Gemini:", error);
        }
    }, [savedPrompt]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSavePrompt = () => {
        setSavedPrompt(systemPrompt);
        // Here you would typically save this to a database
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading || !chat) return;

        const userMessage = { role: 'user' as const, text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message });
            let modelResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text = modelResponse;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!process.env.API_KEY) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <h1 className="text-3xl font-bold text-text-primary">AI Chatbot Management</h1>
                <Card className="mt-8 max-w-lg mx-auto">
                    <CardContent>
                        <p className="text-red-400">
                            The Gemini API key is not configured. Please set the `API_KEY` environment variable to enable the AI Chatbot feature.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-text-primary">AI Chatbot Management</h1>
            <p className="mt-2 text-text-secondary">Configure and test the affiliate support chatbot powered by Gemini.</p>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Section */}
                <div className="space-y-6">
                    <Card>
                        <CardContent>
                            <h2 className="text-xl font-bold">System Prompt</h2>
                            <p className="text-sm text-text-secondary mt-1">Define the chatbot's personality and instructions.</p>
                            <Textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={6}
                                className="mt-4"
                                aria-label="System Prompt"
                            />
                            <Button onClick={handleSavePrompt} className="mt-4 w-full" disabled={systemPrompt === savedPrompt}>
                                {systemPrompt === savedPrompt ? 'Saved' : 'Save and Restart Chat'}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <h2 className="text-xl font-bold">Knowledge Base</h2>
                            <p className="text-sm text-text-secondary mt-1">Upload documents to provide context for the chatbot (RAG - coming soon).</p>
                            <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg text-center">
                               <Input type="file" disabled className="w-full" />
                               <p className="mt-2 text-xs text-text-secondary">File upload is not yet implemented.</p>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {MOCK_FILES.map(file => (
                                    <li key={file.name} className="flex justify-between items-center text-sm p-2 bg-surface/50 rounded-md">
                                        <span>{file.name}</span>
                                        <span className="text-text-secondary">{file.size}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Preview Section */}
                <Card className="flex flex-col">
                    <CardContent className="flex-1 flex flex-col">
                        <h2 className="text-xl font-bold text-center">Chat Preview</h2>
                        <div ref={chatContainerRef} className="mt-4 flex-1 h-96 overflow-y-auto bg-background p-4 rounded-lg space-y-4">
                            {chatHistory.map((item, index) => (
                                <div key={index} className={`flex items-start gap-3 ${item.role === 'user' ? 'justify-end' : ''}`}>
                                    {item.role === 'model' && <div className="p-2 rounded-full bg-primary text-black"><SparklesIcon className="h-5 w-5"/></div>}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${item.role === 'user' ? 'bg-primary text-black' : 'bg-surface'}`}>
                                       <p className="text-sm whitespace-pre-wrap">{item.text || '...'}</p>
                                    </div>
                                    {item.role === 'user' && <div className="p-2 rounded-full bg-surface/50"><UserCircleIcon className="h-5 w-5"/></div>}
                                </div>
                            ))}
                            {loading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role !== 'model' && (
                               <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-primary text-black"><SparklesIcon className="h-5 w-5"/></div>
                                    <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-surface">
                                       <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                       </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Test the chatbot..."
                                className="flex-1"
                                disabled={loading}
                                aria-label="Chat message"
                            />
                            <Button type="submit" disabled={loading || !message.trim()}>
                                {loading ? 'Thinking...' : 'Send'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AiChatbotManager;