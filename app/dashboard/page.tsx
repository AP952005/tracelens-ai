'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, AlertTriangle, Shield, Eye, Database,
    Activity, Zap, Globe, Target, ChevronRight, Clock,
    Users, FileWarning, Fingerprint
} from 'lucide-react';
import { InvestigationCase } from '@root/types/investigation';
import { ScanningOverlay, GlassCard, StatCard } from '../components/visualizations';
import { CyberIntroAnimation } from '../components/visualizations/CyberIntro';

export default function DashboardPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showIntro, setShowIntro] = useState(true);
    const [recentCases, setRecentCases] = useState<InvestigationCase[]>([]);
    const [stats, setStats] = useState({ totalScans: 0, breaches: 0, profiles: 0 });

    useEffect(() => {
        // Fetch recent cases
        fetch('/api/cases')
            .then(res => res.json())
            .then(cases => {
                setRecentCases(cases.slice(0, 5));
                // Calculate stats
                const totalBreaches = cases.reduce((acc: number, c: InvestigationCase) => acc + c.breaches.length, 0);
                const totalProfiles = cases.reduce((acc: number, c: InvestigationCase) => acc + c.socialProfiles.length, 0);
                setStats({ totalScans: cases.length, breaches: totalBreaches, profiles: totalProfiles });
            })
            .catch(() => { });
    }, []);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/investigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            if (!res.ok) throw new Error('Investigation failed');

            const data: InvestigationCase = await res.json();

            // Artificial delay for the scanning animation to complete
            setTimeout(() => {
                router.push(`/case/${data.id}`);
            }, 4500);
        } catch (err) {
            setError('System Error: Scan failed to initialize.');
            setLoading(false);
        }
    };

    if (showIntro) {
        return <CyberIntroAnimation onComplete={() => setShowIntro(false)} />;
    }

    return (
        <>
            <ScanningOverlay isScanning={loading} query={query} />

            <div className="min-h-screen bg-[#05070d] text-white font-mono relative overflow-hidden">
                {/* Animated background */}
                <div className="fixed inset-0 pointer-events-none">
                    {/* Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

                    {/* Radial gradient */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />

                    {/* Floating orbs */}
                    <motion.div
                        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"
                        animate={{
                            x: [0, -50, 0],
                            y: [0, -100, 0],
                            scale: [1, 0.8, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 rounded-full border-2 border-cyan-500/50 flex items-center justify-center"
                            >
                                <Shield className="w-6 h-6 text-cyan-400" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                                    TRACELENS
                                </h1>
                                <p className="text-xs text-gray-500 tracking-widest">OSINT + DIGITAL FORENSICS</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <motion.div
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-xs text-green-400">SYSTEMS ONLINE</span>
                            </motion.div>
                            <button
                                onClick={() => router.push('/history')}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                CASE ARCHIVE
                            </button>
                        </div>
                    </motion.header>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto"
                    >
                        <StatCard
                            label="Total Scans"
                            value={stats.totalScans}
                            icon={<Target className="w-5 h-5" />}
                            color="cyan"
                            delay={0.3}
                        />
                        <StatCard
                            label="Breaches Found"
                            value={stats.breaches}
                            icon={<FileWarning className="w-5 h-5" />}
                            color="red"
                            delay={0.4}
                        />
                        <StatCard
                            label="Profiles Identified"
                            value={stats.profiles}
                            icon={<Users className="w-5 h-5" />}
                            color="green"
                            delay={0.5}
                        />
                        <StatCard
                            label="Active Sessions"
                            value={1}
                            icon={<Activity className="w-5 h-5" />}
                            color="purple"
                            delay={0.6}
                        />
                    </motion.div>

                    {/* Main search area */}
                    <GlassCard className="max-w-3xl mx-auto p-8" delay={0.3}>
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.4 }}
                                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center"
                            >
                                <Fingerprint className="w-10 h-10 text-cyan-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">INITIATE INVESTIGATION</h2>
                            <p className="text-gray-500 text-sm">Enter a target identifier to begin deep reconnaissance</p>
                        </div>

                        <form onSubmit={handleScan}>
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-cyan-500/50" />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="EMAIL / USERNAME / IP ADDRESS / DOMAIN"
                                    className="w-full bg-black/50 border border-cyan-500/30 rounded-xl pl-12 pr-6 py-5 text-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-cyan-100 placeholder:text-gray-600"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-cyan-500/50 text-sm"
                                    >
                                        █
                                    </motion.div>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading || !query}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                />
                                <Zap className="w-5 h-5" />
                                <span>EXECUTE DEEP SCAN</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-3"
                            >
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Quick actions */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Quick Actions</div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: <Globe className="w-4 h-4" />, label: 'Domain Scan', example: 'example.com' },
                                    { icon: <Eye className="w-4 h-4" />, label: 'Email Lookup', example: 'user@email.com' },
                                    { icon: <Database className="w-4 h-4" />, label: 'IP Trace', example: '192.168.1.1' }
                                ].map((action, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        onClick={() => setQuery(action.example)}
                                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                            {action.icon}
                                            <span className="text-xs font-medium">{action.label}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Recent cases */}
                    {recentCases.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="max-w-3xl mx-auto mt-8"
                        >
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Recent Investigations
                            </h3>
                            <div className="space-y-2">
                                {recentCases.map((c, i) => (
                                    <motion.button
                                        key={c.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        onClick={() => router.push(`/case/${c.id}`)}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.threatScore > 70 ? 'bg-red-500/20 text-red-400' : c.threatScore > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{c.query}</div>
                                                <div className="text-xs text-gray-500">{new Date(c.created).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`text-2xl font-bold ${c.threatScore > 70 ? 'text-red-400' : c.threatScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {c.threatScore}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
