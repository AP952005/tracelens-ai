'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle, Database, MessageSquare, Globe, Shield, Search, Clock } from 'lucide-react';

interface DarkWebMonitorProps {
    query: string;
    breachCount: number;
}

export function DarkWebMonitor({ query, breachCount }: DarkWebMonitorProps) {
    // Generate mock dark web data
    const hash = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const darkWebFindings = {
        breachHits: breachCount,
        pastebinMentions: hash % 3,
        telegramDumps: hash % 5 > 2 ? 'Suspected' : 'None',
        forumMentions: hash % 4,
        darknetMarkets: hash % 6 > 4 ? 'Alert' : 'Clear',
        lastScan: new Date(Date.now() - (hash % 3600000)).toISOString()
    };

    const threatLevel =
        breachCount > 3 || darkWebFindings.pastebinMentions > 1 ? 'high' :
            breachCount > 1 || darkWebFindings.forumMentions > 0 ? 'medium' : 'low';

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', glow: '#ef4444' };
            case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: '#eab308' };
            default: return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', glow: '#22c55e' };
        }
    };

    const colors = getThreatColor(threatLevel);

    const monitorItems = [
        {
            label: 'Breach Database Hits',
            value: darkWebFindings.breachHits,
            icon: <Database className="w-4 h-4" />,
            alert: darkWebFindings.breachHits > 2
        },
        {
            label: 'Pastebin Mentions',
            value: darkWebFindings.pastebinMentions > 0 ? `${darkWebFindings.pastebinMentions} Found` : 'None',
            icon: <Globe className="w-4 h-4" />,
            alert: darkWebFindings.pastebinMentions > 0
        },
        {
            label: 'Telegram Dump Status',
            value: darkWebFindings.telegramDumps,
            icon: <MessageSquare className="w-4 h-4" />,
            alert: darkWebFindings.telegramDumps === 'Suspected'
        },
        {
            label: 'Forum Mentions',
            value: darkWebFindings.forumMentions > 0 ? `${darkWebFindings.forumMentions} Threads` : 'None',
            icon: <Search className="w-4 h-4" />,
            alert: darkWebFindings.forumMentions > 0
        },
        {
            label: 'Darknet Markets',
            value: darkWebFindings.darknetMarkets,
            icon: <Shield className="w-4 h-4" />,
            alert: darkWebFindings.darknetMarkets === 'Alert'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg}`}
        >
            {/* Animated scan line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent"
                style={{ color: colors.glow }}
                animate={{
                    y: [0, 200, 0],
                    opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            boxShadow: [
                                `0 0 10px ${colors.glow}`,
                                `0 0 25px ${colors.glow}`,
                                `0 0 10px ${colors.glow}`
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}
                    >
                        <Eye className={`w-5 h-5 ${colors.text}`} />
                    </motion.div>
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            DARK WEB MONITORING
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-xs px-2 py-0.5 rounded-full bg-white/10"
                            >
                                LIVE
                            </motion.span>
                        </h3>
                        <p className="text-xs text-gray-500">Continuous scan for &quot;{query}&quot;</p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg ${colors.bg} ${colors.text} font-bold text-sm flex items-center gap-2`}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        {threatLevel === 'high' ? '🔴' : threatLevel === 'medium' ? '🟡' : '🟢'}
                    </motion.div>
                    {threatLevel.toUpperCase()} RISK
                </div>
            </div>

            {/* Monitor grid */}
            <div className="p-4 space-y-3">
                {monitorItems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${item.alert ? 'text-red-400' : 'text-gray-500'}`}>
                                {item.icon}
                            </div>
                            <span className="text-sm text-gray-300">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${item.alert ? 'text-red-400' : 'text-gray-400'}`}>
                                {item.value}
                            </span>
                            {item.alert && (
                                <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Last scan: {new Date(darkWebFindings.lastScan).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Search className="w-3 h-3" />
                    </motion.div>
                    <span>Scanning 847 sources</span>
                </div>
            </div>
        </motion.div>
    );
}
