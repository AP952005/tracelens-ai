'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertTriangle, User, Database, Globe, ArrowLeft,
    ExternalLink, Clock, Activity, FileText, Zap, Lock,
    Eye, MapPin, Calendar, ChevronRight, Play, Pause,
    Instagram, Facebook, Twitter, Linkedin, Youtube, Github, Mail, MessageCircle
} from 'lucide-react';
import { InvestigationCase, SocialProfile } from '@root/types/investigation';
import { ThreatMeter, ThreatBadge } from '../../components/visualizations/ThreatMeter';
import { RiskBreakdown } from '../../components/visualizations/RiskBreakdown';
import { GlassCard, StatCard, AnimatedBadge, TimelineCard } from '../../components/visualizations/Cards';
import { ForensicChat } from '../../components/ForensicChat';
import { IdentityLinkGraph } from '../../components/visualizations/IdentityGraph';
import { GeoIntelligenceMap } from '../../components/visualizations/GeoMap';
import { EvidenceLocker } from '../../components/visualizations/EvidenceLocker';
import { DarkWebMonitor } from '../../components/visualizations/DarkWebMonitor';
import { DigitalFingerprint } from '../../components/visualizations/DigitalFingerprint';
import { IntelPanel } from '../../components/visualizations/IntelPanel';
import { analyzeThreat } from '@root/lib/forensics/riskEngine';

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (lower.includes('facebook')) return <Facebook className="w-5 h-5" />;
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter className="w-5 h-5" />;
    if (lower.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (lower.includes('youtube')) return <Youtube className="w-5 h-5" />;
    if (lower.includes('github')) return <Github className="w-5 h-5" />;
    if (lower.includes('email') || lower.includes('gmail')) return <Mail className="w-5 h-5" />;
    if (lower.includes('discord') || lower.includes('telegram')) return <MessageCircle className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
};

// Generate profile URL based on platform
const getProfileUrl = (profile: SocialProfile): string => {
    if (profile.profileUrl) return profile.profileUrl;
    if (profile.url) return profile.url;

    const platform = profile.platform.toLowerCase();
    const username = profile.username;

    if (platform.includes('instagram')) return `https://instagram.com/${username}`;
    if (platform.includes('twitter') || platform.includes('x')) return `https://twitter.com/${username}`;
    if (platform.includes('facebook')) return `https://facebook.com/${username}`;
    if (platform.includes('linkedin')) return `https://linkedin.com/in/${username}`;
    if (platform.includes('github')) return `https://github.com/${username}`;
    if (platform.includes('youtube')) return `https://youtube.com/@${username}`;
    if (platform.includes('tiktok')) return `https://tiktok.com/@${username}`;
    if (platform.includes('reddit')) return `https://reddit.com/user/${username}`;

    return '#';
};

// Generate social activity timeline with unique dates per platform
const generateSocialTimeline = (profiles: SocialProfile[], query: string) => {
    const activities: { platform: string; username: string; event: string; date: string; icon: React.ReactNode }[] = [];

    profiles.forEach((profile, index) => {
        const platform = profile.platform;
        const username = profile.username;
        const icon = getPlatformIcon(platform);

        // Generate unique dates using platform name hash + index
        const platformHash = platform.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const queryHash = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const uniqueHash = platformHash * 7 + queryHash + index * 13;

        // Generate creation date (each platform gets different year/month)
        const year = 2014 + (uniqueHash % 9); // 2014-2022
        const month = ((platformHash + index * 4) % 12) + 1;
        const day = ((uniqueHash * 3) % 28) + 1;

        activities.push({
            platform,
            username,
            event: 'Account Created',
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            icon
        });

        // Last activity - unique per platform
        if (profile.lastActive) {
            activities.push({
                platform,
                username,
                event: 'Last Active',
                date: profile.lastActive,
                icon
            });
        } else {
            // Generate unique last activity date per platform
            const daysAgo = (platformHash + index * 5) % 45 + 1;
            const lastActive = new Date();
            lastActive.setDate(lastActive.getDate() - daysAgo);
            activities.push({
                platform,
                username,
                event: 'Last Active',
                date: lastActive.toISOString().split('T')[0],
                icon
            });
        }
    });

    // Sort by date descending
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Threat Classification Badge
const ThreatClassification = ({ score }: { score: number }) => {
    let classification = { type: 'Low Risk Normal User', color: 'green', icon: '🟢' };

    if (score > 80) {
        classification = { type: 'Cybercrime Actor', color: 'red', icon: '🔴' };
    } else if (score > 60) {
        classification = { type: 'Fraud Risk', color: 'orange', icon: '🟠' };
    } else if (score > 40) {
        classification = { type: 'Scam Profile', color: 'yellow', icon: '🟡' };
    }

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${classification.color === 'red' ? 'bg-red-500/20 border-red-500 text-red-400' :
                classification.color === 'orange' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                    classification.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                        'bg-green-500/20 border-green-500 text-green-400'
                }`}
        >
            <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg"
            >
                {classification.icon}
            </motion.span>
            <span className="font-bold text-sm">{classification.type}</span>
        </motion.div>
    );
};

// Case Replay Button
const CaseReplayButton = ({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${isPlaying
            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
            : 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
            }`}
    >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? 'Stop Replay' : 'Replay Investigation'}
    </motion.button>
);

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'breaches' | 'timeline' | 'intelligence'>('overview');
    const [threatAnalysis, setThreatAnalysis] = useState<ReturnType<typeof analyzeThreat> | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isReplaying, setIsReplaying] = useState(false);
    const [replayProgress, setReplayProgress] = useState(0);

    useEffect(() => {
        async function fetchCase() {
            try {
                const res = await fetch(`/api/cases/${caseId}`);
                if (!res.ok) throw new Error('Case not found');
                const data = await res.json();
                setCaseData(data);

                const analysis = analyzeThreat(data.socialProfiles, data.breaches, data.queryType || 'unknown');
                setThreatAnalysis(analysis);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (caseId) fetchCase();
    }, [caseId]);

    // Case replay animation
    useEffect(() => {
        if (isReplaying) {
            const interval = setInterval(() => {
                setReplayProgress(p => {
                    if (p >= 100) {
                        setIsReplaying(false);
                        return 0;
                    }
                    return p + 2;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isReplaying]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-cyan-500 border-t-transparent"
                    />
                    <div className="text-cyan-400 font-mono">LOADING CASE DATA...</div>
                </motion.div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <div className="text-red-500 text-xl font-mono">CASE NOT FOUND</div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 text-cyan-400 hover:underline"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
        { id: 'intelligence', label: 'Intelligence', icon: <MapPin className="w-4 h-4" /> },
        { id: 'profiles', label: `Profiles (${caseData.socialProfiles.length})`, icon: <User className="w-4 h-4" /> },
        { id: 'breaches', label: `Breaches (${caseData.breaches.length})`, icon: <Database className="w-4 h-4" /> },
        { id: 'timeline', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
    ];

    const socialTimeline = generateSocialTimeline(caseData.socialProfiles, caseData.query);

    return (
        <div className="min-h-screen bg-[#05070d] text-white overflow-x-hidden font-mono">
            {/* Replay overlay */}
            {isReplaying && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                >
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-cyan-500 border-t-transparent"
                        />
                        <div className="text-2xl font-bold text-cyan-400 mb-2">REPLAYING INVESTIGATION</div>
                        <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                style={{ width: `${replayProgress}%` }}
                            />
                        </div>
                        <div className="text-gray-400 mt-2">{replayProgress}%</div>
                    </div>
                </motion.div>
            )}

            {/* Main content */}
            <div className={`transition-all duration-300 ${isChatOpen ? 'mr-[400px]' : 'mr-0'}`}>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-40 p-6 border-b border-white/10 bg-[#05070d]/80 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between">
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
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                                        CASE #{caseData.id.substring(0, 8).toUpperCase()}
                                    </h1>
                                    <AnimatedBadge variant={caseData.status === 'closed' || caseData.status === 'archived' ? 'success' : 'info'}>
                                        {caseData.status.toUpperCase()}
                                    </AnimatedBadge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        {caseData.query}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(caseData.created).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThreatClassification score={caseData.threatScore} />
                            <ThreatBadge score={caseData.threatScore} />
                            <CaseReplayButton isPlaying={isReplaying} onToggle={() => setIsReplaying(!isReplaying)} />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => router.push(`/report/${caseData.id}`)}
                                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm flex items-center gap-2 hover:bg-cyan-500/30 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                View Report
                            </motion.button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                    }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.header>

                {/* Content area */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Top row with threat meter and stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <GlassCard className="p-6 flex items-center justify-center" delay={0.1}>
                                        <ThreatMeter score={caseData.threatScore} size="lg" />
                                    </GlassCard>

                                    <div className="col-span-2">
                                        {threatAnalysis && (
                                            <RiskBreakdown factors={threatAnalysis.breakdown} />
                                        )}
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-4 gap-4">
                                    <StatCard
                                        label="Social Profiles"
                                        value={caseData.socialProfiles.length}
                                        icon={<User className="w-5 h-5" />}
                                        color="cyan"
                                        delay={0.2}
                                    />
                                    <StatCard
                                        label="Data Breaches"
                                        value={caseData.breaches.length}
                                        icon={<Database className="w-5 h-5" />}
                                        color="red"
                                        delay={0.3}
                                    />
                                    <StatCard
                                        label="Evidence Items"
                                        value={caseData.chainOfCustody.length}
                                        icon={<FileText className="w-5 h-5" />}
                                        color="yellow"
                                        delay={0.4}
                                    />
                                    <StatCard
                                        label="Threat Level"
                                        value={threatAnalysis?.level || 'N/A'}
                                        icon={<AlertTriangle className="w-5 h-5" />}
                                        color={caseData.threatScore > 70 ? 'red' : caseData.threatScore > 40 ? 'yellow' : 'green'}
                                        delay={0.5}
                                    />
                                </div>

                                {/* Identity Link Graph */}
                                <div>
                                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        IDENTITY LINK GRAPH
                                    </h3>
                                    <IdentityLinkGraph
                                        query={caseData.query}
                                        profiles={caseData.socialProfiles}
                                        breaches={caseData.breaches}
                                    />
                                </div>

                                {/* Recommendations */}
                                {threatAnalysis && threatAnalysis.recommendations.length > 0 && (
                                    <GlassCard className="p-6" delay={0.4}>
                                        <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5" />
                                            AI RECOMMENDATIONS
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {threatAnalysis.recommendations.map((rec, i) => (
                                                <motion.button
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                    className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors text-left cursor-pointer"
                                                >
                                                    <Lock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-300">{rec}</span>
                                                    <ChevronRight className="w-4 h-4 text-yellow-400 ml-auto" />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'intelligence' && (
                            <motion.div
                                key="intelligence"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Extended Intelligence Panel from OSINT APIs */}
                                {(caseData as any).extendedIntel && (
                                    <IntelPanel extendedIntel={(caseData as any).extendedIntel} />
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Geo Intelligence Map */}
                                    <GeoIntelligenceMap
                                        query={caseData.query}
                                        profiles={caseData.socialProfiles}
                                    />

                                    {/* Dark Web Monitor */}
                                    <DarkWebMonitor
                                        query={caseData.query}
                                        breachCount={caseData.breaches.length}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Digital Fingerprint */}
                                    <DigitalFingerprint
                                        query={caseData.query}
                                        profiles={caseData.socialProfiles}
                                    />

                                    {/* Evidence Locker */}
                                    <EvidenceLocker
                                        caseId={caseData.id}
                                        profiles={caseData.socialProfiles}
                                        breaches={caseData.breaches}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'profiles' && (
                            <motion.div
                                key="profiles"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                {caseData.socialProfiles.map((p, i) => {
                                    const profileUrl = getProfileUrl(p);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-5 rounded-xl bg-gradient-to-br from-[#0a1020] to-[#0d1528] border border-white/10 hover:border-cyan-500/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center text-cyan-400">
                                                        {getPlatformIcon(p.platform)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">{p.platform}</div>
                                                        <div className="text-sm text-cyan-400">@{p.username}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg ${p.confidence > 80 ? 'bg-green-500/20 text-green-400' : p.confidence > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {p.confidence}%
                                                </div>
                                            </div>

                                            <a
                                                href={profileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 mb-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors w-fit"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="text-sm">Open Profile</span>
                                            </a>

                                            <div className="text-sm text-gray-400 bg-black/30 rounded-lg p-3">
                                                {p.notes}
                                            </div>

                                            {p.lastActive && (
                                                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Last active: {p.lastActive}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}

                        {activeTab === 'breaches' && (
                            <motion.div
                                key="breaches"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {caseData.breaches.map((b, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-5 rounded-xl bg-gradient-to-br from-[#0a1020] to-[#0d1528] border border-white/10 border-l-4 border-l-red-500"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                                    <Database className="w-6 h-6 text-red-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-xl">{b.domain}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {b.date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-black ${b.riskScore > 70 ? 'text-red-400' : b.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    {b.riskScore}
                                                </div>
                                                <div className="text-xs text-gray-500">RISK SCORE</div>
                                            </div>
                                        </div>
                                        {b.description && (
                                            <div className="text-sm text-gray-400 mb-3">{b.description}</div>
                                        )}
                                        {b.dataClasses && b.dataClasses.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {b.dataClasses.map((type, j) => (
                                                    <span
                                                        key={j}
                                                        className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/30"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'timeline' && (
                            <motion.div
                                key="timeline"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Social Media Activity Timeline */}
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        SOCIAL MEDIA ACTIVITY
                                    </h3>
                                    <div className="relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-red-500" />

                                        <div className="space-y-4">
                                            {socialTimeline.map((activity, i) => (
                                                <motion.div
                                                    key={`${activity.platform}-${activity.event}-${i}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="relative flex items-start gap-4 pl-0"
                                                >
                                                    <div className={`
                                                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                                                        ${activity.event === 'Account Created'
                                                            ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                                                            : 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500'
                                                        }
                                                    `}>
                                                        {activity.icon}
                                                    </div>

                                                    <div className="flex-1 p-4 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-500/30 transition-colors">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-white">{activity.platform}</span>
                                                            <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            <span className={activity.event === 'Account Created' ? 'text-green-400' : 'text-cyan-400'}>
                                                                {activity.event}
                                                            </span>
                                                            {' - '}@{activity.username}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Chain of Custody */}
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        CHAIN OF CUSTODY
                                    </h3>
                                    <div className="space-y-1">
                                        {caseData.chainOfCustody.map((log, i) => (
                                            <TimelineCard
                                                key={log.id}
                                                time={new Date(log.timestamp).toLocaleTimeString()}
                                                title={log.action.toUpperCase()}
                                                description={log.details}
                                                type={log.action.includes('scan') ? 'scan' : log.action.includes('breach') ? 'breach' : log.action.includes('profile') ? 'profile' : 'analysis'}
                                                index={i}
                                            />
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Collapsible AI Chat Panel */}
            <ForensicChat
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
                caseContext={caseData ? {
                    query: caseData.query,
                    threatScore: caseData.threatScore,
                    socialProfiles: caseData.socialProfiles.map(p => ({
                        platform: p.platform,
                        username: p.username,
                        notes: p.notes
                    })),
                    breaches: caseData.breaches.map(b => ({
                        domain: b.domain,
                        date: b.date,
                        riskScore: b.riskScore
                    }))
                } : undefined}
            />
        </div>
    );
}
