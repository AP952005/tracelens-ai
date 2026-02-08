'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, X, ChevronLeft, ChevronRight, Bot, User,
    Loader2, Sparkles, AlertCircle, Trash2, Minimize2, Maximize2
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ForensicChatProps {
    caseContext?: {
        query: string;
        threatScore: number;
        socialProfiles: { platform: string; username: string; notes: string }[];
        breaches: { domain: string; date: string; riskScore: number }[];
    };
    isOpen: boolean;
    onToggle: () => void;
}

export function ForensicChat({ caseContext, isOpen, onToggle }: ForensicChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0 && caseContext) {
            setMessages([{
                id: '1',
                role: 'assistant',
                content: `🔍 **TraceLens AI Assistant Active**\n\nI'm analyzing the investigation for target: **${caseContext.query}**\n\n**Current Threat Score:** ${caseContext.threatScore}/100\n**Profiles Found:** ${caseContext.socialProfiles.length}\n**Breaches Detected:** ${caseContext.breaches.length}\n\nHow can I assist with this investigation?`,
                timestamp: new Date()
            }]);
        }
    }, [caseContext, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const buildContextPrompt = () => {
        if (!caseContext) return '';

        let context = `You are TraceLens AI, a forensic investigation assistant. You're analyzing a case with the following data:\n\n`;
        context += `Target: ${caseContext.query}\n`;
        context += `Threat Score: ${caseContext.threatScore}/100\n\n`;

        if (caseContext.socialProfiles.length > 0) {
            context += `Social Profiles Found:\n`;
            caseContext.socialProfiles.forEach(p => {
                context += `- ${p.platform}: @${p.username} - ${p.notes}\n`;
            });
            context += '\n';
        }

        if (caseContext.breaches.length > 0) {
            context += `Data Breaches:\n`;
            caseContext.breaches.forEach(b => {
                context += `- ${b.domain} (${b.date}) - Risk: ${b.riskScore}\n`;
            });
        }

        context += `\nProvide helpful insights about this investigation. Be concise but thorough. Format responses with markdown for clarity.`;

        return context;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    context: buildContextPrompt(),
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError('Failed to connect to AI. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Toggle button when closed */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        onClick={onToggle}
                        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-l from-cyan-600 to-cyan-500 text-white px-3 py-6 rounded-l-xl shadow-lg hover:from-cyan-500 hover:to-cyan-400 transition-all"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="writing-vertical text-xs font-bold tracking-wider" style={{ writingMode: 'vertical-rl' }}>
                                AI ASSISTANT
                            </span>
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[400px] z-50 flex flex-col bg-gradient-to-b from-[#0a1020] to-[#0d1528] border-l border-cyan-500/30 shadow-[-10px_0_40px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-cyan-500/20 bg-[#05070d] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center"
                                >
                                    <Bot className="w-4 h-4 text-white" />
                                </motion.div>
                                <div>
                                    <h2 className="text-cyan-400 font-bold text-sm">TraceLens AI</h2>
                                    <div className="flex items-center gap-1.5">
                                        <motion.div
                                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <span className="text-xs text-gray-500">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearChat}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                                    title="Clear chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onToggle}
                                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                                    title="Close panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                        ${message.role === 'user'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-cyan-500/20 text-cyan-400'
                                        }
                                    `}>
                                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`
                                        max-w-[80%] p-3 rounded-xl text-sm
                                        ${message.role === 'user'
                                            ? 'bg-purple-500/20 text-white rounded-tr-none'
                                            : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10'
                                        }
                                    `}>
                                        <div
                                            className="prose prose-sm prose-invert max-w-none [&_strong]:text-cyan-400 [&_code]:text-cyan-300 [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded"
                                            dangerouslySetInnerHTML={{
                                                __html: message.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/`(.*?)`/g, '<code>$1</code>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                        />
                                        <div className="text-[10px] text-gray-500 mt-2">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Analyzing...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-cyan-500/20 bg-[#05070d]">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about this investigation..."
                                    disabled={isLoading}
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                            <div className="text-center mt-2 text-[10px] text-gray-600">
                                Powered by Gemini AI • TraceLens v1.0
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
