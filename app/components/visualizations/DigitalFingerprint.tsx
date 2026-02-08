'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Cpu, Globe, Clock, Monitor, Smartphone, Key, AlertTriangle } from 'lucide-react';

interface FingerprintProps {
    query: string;
    profiles: { platform: string; username: string }[];
}

export function DigitalFingerprint({ query, profiles }: FingerprintProps) {
    const [animationPhase, setAnimationPhase] = useState(0);

    // Generate fingerprint data
    const hash = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const aliases = generateAliasVariants(query);
    const similarityScores = profiles.map(p => ({
        ...p,
        similarity: 60 + ((hash + p.platform.charCodeAt(0)) % 40)
    }));

    const fingerprintData = {
        deviceGuess: hash % 3 === 0 ? 'Mobile (iPhone)' : hash % 3 === 1 ? 'Desktop (Windows)' : 'Mobile (Android)',
        browserHint: hash % 4 === 0 ? 'Chrome' : hash % 4 === 1 ? 'Safari' : hash % 4 === 2 ? 'Firefox' : 'Edge',
        activityPattern: hash % 2 === 0 ? 'Morning Active (6-10 AM)' : 'Night Owl (10 PM - 2 AM)',
        passwordStrength: hash % 10 > 6 ? 'Weak (Likely Reused)' : hash % 10 > 3 ? 'Medium' : 'Unknown',
        namingPattern: detectNamingPattern(query),
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationPhase(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-[#0d1528]"
        >
            {/* Fingerprint SVG animation background */}
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400">
                    <defs>
                        <clipPath id="fingerprint-clip">
                            <circle cx="50" cy="50" r="40" />
                        </clipPath>
                    </defs>
                    <g clipPath="url(#fingerprint-clip)">
                        {[...Array(8)].map((_, i) => (
                            <motion.ellipse
                                key={i}
                                cx="50"
                                cy="50 + i * 3"
                                rx={35 - i * 4}
                                ry={40 - i * 4}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                            />
                        ))}
                    </g>
                </svg>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center"
                    >
                        <Fingerprint className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <div>
                        <h3 className="font-bold text-white">DIGITAL FINGERPRINT</h3>
                        <p className="text-xs text-gray-500">Pattern Analysis</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Username similarity section */}
                <div className="space-y-2">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider">Username Similarity Scores</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {similarityScores.slice(0, 4).map((profile, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5"
                            >
                                <span className="text-xs text-gray-400">{profile.platform}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${profile.similarity}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold ${profile.similarity > 80 ? 'text-green-400' : profile.similarity > 60 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        {profile.similarity}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Alias variants */}
                <div className="space-y-2">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        Alias Variants Detected
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">
                            {aliases.length} Found
                        </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {aliases.map((alias, i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                                className="px-2 py-1 text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-md font-mono"
                            >
                                {alias}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Metadata analyzer */}
                <div className="space-y-2">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider">Metadata Analysis</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { icon: <Monitor className="w-3 h-3" />, label: 'Device', value: fingerprintData.deviceGuess },
                            { icon: <Globe className="w-3 h-3" />, label: 'Browser', value: fingerprintData.browserHint },
                            { icon: <Clock className="w-3 h-3" />, label: 'Activity', value: fingerprintData.activityPattern },
                            { icon: <Key className="w-3 h-3" />, label: 'Password', value: fingerprintData.passwordStrength, alert: hash % 10 > 6 }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1 }}
                                className="p-2 rounded-lg bg-black/30 border border-white/5"
                            >
                                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                                    {item.icon}
                                    {item.label}
                                </div>
                                <div className={`text-xs font-medium ${item.alert ? 'text-red-400' : 'text-white'}`}>
                                    {item.value}
                                    {item.alert && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Naming pattern */}
                <div className="p-3 rounded-lg bg-black/30 border border-cyan-500/20">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Cpu className="w-3 h-3" />
                        <span>Naming Pattern Detected</span>
                    </div>
                    <div className="text-sm text-cyan-400 font-mono">
                        {fingerprintData.namingPattern}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function generateAliasVariants(username: string): string[] {
    const base = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const variants: string[] = [];

    // Leetspeak variants
    if (base.includes('o')) variants.push(base.replace(/o/g, '0'));
    if (base.includes('i')) variants.push(base.replace(/i/g, '1'));
    if (base.includes('e')) variants.push(base.replace(/e/g, '3'));
    if (base.includes('a')) variants.push(base.replace(/a/g, '4'));
    if (base.includes('s')) variants.push(base.replace(/s/g, '5'));

    // Number suffixes
    variants.push(base + '99');
    variants.push(base + '_official');
    variants.push(base + '.real');

    // Filter out original and duplicates
    return [...new Set(variants)].filter(v => v !== base).slice(0, 6);
}

function detectNamingPattern(username: string): string {
    const patterns: string[] = [];

    if (/^[a-z]+_[a-z]+$/i.test(username)) patterns.push('firstname_lastname');
    if (/^[a-z]+\d{2,4}$/i.test(username)) patterns.push('name+year');
    if (/[0-9]/.test(username)) patterns.push('contains_numbers');
    if (/_/.test(username)) patterns.push('underscore_separator');
    if (/\./.test(username)) patterns.push('dot_separator');
    if (/^[a-z]{3,}$/i.test(username)) patterns.push('single_word');

    return patterns.length > 0 ? patterns.join(' + ') : 'custom_pattern';
}
