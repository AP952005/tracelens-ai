'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Shield, Calendar, ChevronRight, Archive,
    AlertTriangle, Users, Database, Filter, ArrowLeft,
    SortAsc, SortDesc, Trash2
} from 'lucide-react';
import { InvestigationCase } from '@root/types/investigation';
import { GlassCard, AnimatedBadge } from '../components/visualizations/Cards';

export default function HistoryPage() {
    const router = useRouter();
    const [cases, setCases] = useState<InvestigationCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterLevel, setFilterLevel] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

    useEffect(() => {
        setLoading(true);
        fetch('/api/cases')
            .then(res => res.json())
            .then(data => {
                setCases(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getRiskLevel = (score: number) => {
        if (score < 20) return 'low';
        if (score < 45) return 'medium';
        if (score < 70) return 'high';
        return 'critical';
    };

    const getRiskColor = (score: number) => {
        if (score < 20) return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
        if (score < 45) return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
        if (score < 70) return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
        return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    };

    const filteredCases = cases
        .filter(c => {
            if (searchQuery && !c.query.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filterLevel !== 'all' && getRiskLevel(c.threatScore) !== filterLevel) return false;
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created).getTime();
            const dateB = new Date(b.created).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="min-h-screen bg-[#05070d] text-white font-mono relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <motion.div
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
            </div>

            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => router.push('/dashboard')}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </motion.button>
                            <div>
                                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center gap-3">
                                    <Archive className="w-8 h-8 text-cyan-400" />
                                    CASE ARCHIVE
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {cases.length} investigation{cases.length !== 1 ? 's' : ''} on record
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <GlassCard className="p-4" delay={0.1}>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search investigations..."
                                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>

                            {/* Risk filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
                                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="low">Low Risk</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="high">High Risk</option>
                                    <option value="critical">Critical Risk</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <button
                                onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center gap-2 px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg hover:border-cyan-500/30 transition-colors"
                            >
                                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                                <span className="text-sm">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                            </button>
                        </div>
                    </GlassCard>
                </motion.header>

                {/* Cases list */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-cyan-500 border-t-transparent"
                                />
                                <div className="text-gray-500">Loading archives...</div>
                            </motion.div>
                        ) : filteredCases.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <Archive className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <div className="text-gray-500 text-lg mb-2">No investigations found</div>
                                <p className="text-gray-600 text-sm">
                                    {searchQuery ? 'Try adjusting your search filters' : 'Start a new scan from the dashboard'}
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => router.push('/dashboard')}
                                    className="mt-6 px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400"
                                >
                                    Go to Dashboard
                                </motion.button>
                            </motion.div>
                        ) : (
                            filteredCases.map((c, i) => {
                                const colors = getRiskColor(c.threatScore);
                                return (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: i * 0.05 }}
                                        layout
                                    >
                                        <Link href={`/case/${c.id}`} className="block">
                                            <motion.div
                                                whileHover={{ scale: 1.01, x: 5 }}
                                                className={`
                                                    relative overflow-hidden
                                                    bg-gradient-to-r from-[#0a1020] to-[#0d1528]
                                                    border ${colors.border} border-l-4
                                                    rounded-xl p-5
                                                    transition-all duration-300
                                                    hover:shadow-lg hover:shadow-cyan-500/5
                                                    group
                                                `}
                                            >
                                                {/* Background glow on hover */}
                                                <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-30 transition-opacity`} />

                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {/* Risk indicator */}
                                                        <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                                            <Shield className={`w-7 h-7 ${colors.text}`} />
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                                                                    {c.query}
                                                                </span>
                                                                <AnimatedBadge
                                                                    variant={c.threatScore > 70 ? 'danger' : c.threatScore > 40 ? 'warning' : 'success'}
                                                                    pulse={false}
                                                                >
                                                                    {getRiskLevel(c.threatScore).toUpperCase()}
                                                                </AnimatedBadge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(c.created).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    {c.socialProfiles.length} profiles
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Database className="w-3 h-3" />
                                                                    {c.breaches.length} breaches
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        {/* Threat score */}
                                                        <div className="text-right">
                                                            <div className={`text-3xl font-black ${colors.text}`}>
                                                                {c.threatScore}
                                                            </div>
                                                            <div className="text-xs text-gray-500">THREAT</div>
                                                        </div>

                                                        <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats footer */}
                {cases.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 pt-6 border-t border-white/10"
                    >
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Critical', count: cases.filter(c => c.threatScore >= 70).length, color: 'text-red-400' },
                                { label: 'High', count: cases.filter(c => c.threatScore >= 45 && c.threatScore < 70).length, color: 'text-orange-400' },
                                { label: 'Medium', count: cases.filter(c => c.threatScore >= 20 && c.threatScore < 45).length, color: 'text-yellow-400' },
                                { label: 'Low', count: cases.filter(c => c.threatScore < 20).length, color: 'text-green-400' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="text-center p-4 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
                                    <div className="text-xs text-gray-500">{stat.label} Risk</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
