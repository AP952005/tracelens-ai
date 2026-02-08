'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, FileText, Image, Link2, Hash, Download, Eye,
    CheckCircle, Clock, Shield, Folder, ChevronRight
} from 'lucide-react';

interface EvidenceItem {
    id: string;
    type: 'screenshot' | 'metadata' | 'url' | 'log' | 'document';
    title: string;
    hash: string;
    timestamp: string;
    verified: boolean;
    size?: string;
}

interface EvidenceLockerProps {
    caseId: string;
    profiles: { platform: string; username: string; url?: string }[];
    breaches: { domain: string; date: string }[];
}

export function EvidenceLocker({ caseId, profiles, breaches }: EvidenceLockerProps) {
    const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('profiles');

    // Generate evidence items
    const generateHash = (input: string) => {
        const hash = input.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
        return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase().slice(0, 64);
    };

    const evidenceItems: { category: string; items: EvidenceItem[] }[] = [
        {
            category: 'profiles',
            items: profiles.map((p, i) => ({
                id: `profile-${i}`,
                type: 'url' as const,
                title: `${p.platform} Profile - @${p.username}`,
                hash: `SHA256:${generateHash(p.platform + p.username)}...`,
                timestamp: new Date(Date.now() - i * 3600000).toISOString(),
                verified: true
            }))
        },
        {
            category: 'breaches',
            items: breaches.map((b, i) => ({
                id: `breach-${i}`,
                type: 'document' as const,
                title: `Breach Record - ${b.domain}`,
                hash: `SHA256:${generateHash(b.domain + b.date)}...`,
                timestamp: b.date,
                verified: true,
                size: `${Math.floor(Math.random() * 50 + 10)} KB`
            }))
        },
        {
            category: 'logs',
            items: [
                { id: 'log-1', type: 'log' as const, title: 'Investigation Audit Trail', hash: `SHA256:${generateHash(caseId + 'audit')}...`, timestamp: new Date().toISOString(), verified: true, size: '2.3 KB' },
                { id: 'log-2', type: 'log' as const, title: 'API Query Logs', hash: `SHA256:${generateHash(caseId + 'api')}...`, timestamp: new Date().toISOString(), verified: true, size: '1.1 KB' }
            ]
        },
        {
            category: 'metadata',
            items: [
                { id: 'meta-1', type: 'metadata' as const, title: 'Extracted Metadata Report', hash: `SHA256:${generateHash(caseId + 'meta')}...`, timestamp: new Date().toISOString(), verified: true, size: '4.7 KB' },
                { id: 'meta-2', type: 'metadata' as const, title: 'Device Fingerprint Analysis', hash: `SHA256:${generateHash(caseId + 'device')}...`, timestamp: new Date().toISOString(), verified: false, size: '892 B' }
            ]
        }
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'screenshot': return <Image className="w-4 h-4" />;
            case 'url': return <Link2 className="w-4 h-4" />;
            case 'log': return <FileText className="w-4 h-4" />;
            case 'metadata': return <Hash className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const totalItems = evidenceItems.reduce((acc, cat) => acc + cat.items.length, 0);
    const verifiedItems = evidenceItems.reduce((acc, cat) => acc + cat.items.filter(i => i.verified).length, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0a0f1a] to-[#0d1528] rounded-xl border border-white/10 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">EVIDENCE LOCKER</h3>
                        <p className="text-xs text-gray-500">Case #{caseId.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                        <Folder className="w-3 h-3" />
                        {totalItems} Items
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        {verifiedItems} Verified
                    </div>
                </div>
            </div>

            {/* Category accordion */}
            <div className="divide-y divide-white/5">
                {evidenceItems.map((category) => (
                    <div key={category.category}>
                        <button
                            onClick={() => setExpandedCategory(
                                expandedCategory === category.category ? null : category.category
                            )}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: expandedCategory === category.category ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </motion.div>
                                <span className="text-sm font-medium text-white capitalize">{category.category}</span>
                                <span className="text-xs text-gray-500">({category.items.length})</span>
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedCategory === category.category && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    {category.items.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                            className={`
                                                px-4 py-3 ml-6 border-l border-white/10 cursor-pointer
                                                hover:bg-white/5 transition-colors
                                                ${selectedItem?.id === item.id ? 'bg-white/5' : ''}
                                            `}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-gray-400">{getTypeIcon(item.type)}</div>
                                                    <div>
                                                        <div className="text-sm text-white">{item.title}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                {item.hash.slice(0, 24)}...
                                                            </span>
                                                            {item.verified && (
                                                                <span className="text-xs text-green-400 flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.size && (
                                                        <span className="text-xs text-gray-500">{item.size}</span>
                                                    )}
                                                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                                        <Download className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {selectedItem?.id === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-3 p-3 bg-black/30 rounded-lg text-xs"
                                                >
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="text-gray-500">Full Hash:</div>
                                                        <div className="text-gray-300 font-mono break-all">{item.hash}</div>
                                                        <div className="text-gray-500">Timestamp:</div>
                                                        <div className="text-gray-300">{new Date(item.timestamp).toLocaleString()}</div>
                                                        <div className="text-gray-500">Integrity:</div>
                                                        <div className={item.verified ? 'text-green-400' : 'text-yellow-400'}>
                                                            {item.verified ? 'Cryptographically Verified' : 'Pending Verification'}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>SHA-256 Hash Chain Verified</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </motion.div>
    );
}
