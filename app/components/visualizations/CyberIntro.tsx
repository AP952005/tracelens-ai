'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Wifi, AlertTriangle, Zap, Eye, Database, Globe, Cpu, Radio } from 'lucide-react';

interface CyberIntroProps {
    onComplete: () => void;
    duration?: number;
}

export function CyberIntroAnimation({ onComplete, duration = 4000 }: CyberIntroProps) {
    const [phase, setPhase] = useState(0);
    const [showMain, setShowMain] = useState(false);

    useEffect(() => {
        const phases = [
            setTimeout(() => setPhase(1), 500),
            setTimeout(() => setPhase(2), 1200),
            setTimeout(() => setPhase(3), 2000),
            setTimeout(() => setShowMain(true), 2500),
            setTimeout(() => onComplete(), duration)
        ];
        return () => phases.forEach(clearTimeout);
    }, [duration, onComplete]);

    const threatWords = ['SCANNING NETWORK', 'DETECTING THREATS', 'ANALYZING PATTERNS', 'SECURING CONNECTION'];
    const hexCodes = Array.from({ length: 20 }, () =>
        Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020408] overflow-hidden"
        >
            {/* Matrix-style falling hex codes */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                {hexCodes.map((hex, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{
                            y: ['0%', '100%'],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        className="absolute text-green-500 font-mono text-xs"
                        style={{ left: `${(i / 20) * 100}%` }}
                    >
                        {hex.split('').map((c, j) => (
                            <div key={j} className="leading-tight">{c}</div>
                        ))}
                    </motion.div>
                ))}
            </div>

            {/* Cyber grid background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

                {/* Radar sweep effect */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                    <div className="w-full h-full rounded-full border border-cyan-500/20" />
                    <div className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom bg-gradient-to-t from-cyan-500/50 to-transparent" />
                </motion.div>

                {/* Concentric rings */}
                {[1, 2, 3, 4].map((ring) => (
                    <motion.div
                        key={ring}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ delay: ring * 0.2, duration: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/30"
                        style={{ width: ring * 150, height: ring * 150 }}
                    />
                ))}
            </div>

            {/* Floating threat indicators */}
            <AnimatePresence>
                {phase >= 1 && (
                    <>
                        {[
                            { Icon: AlertTriangle, x: '15%', y: '20%', color: 'red', delay: 0 },
                            { Icon: Shield, x: '80%', y: '25%', color: 'cyan', delay: 0.2 },
                            { Icon: Lock, x: '10%', y: '70%', color: 'green', delay: 0.4 },
                            { Icon: Wifi, x: '85%', y: '75%', color: 'yellow', delay: 0.6 },
                            { Icon: Database, x: '25%', y: '45%', color: 'purple', delay: 0.8 },
                            { Icon: Globe, x: '75%', y: '50%', color: 'blue', delay: 1 },
                            { Icon: Cpu, x: '50%', y: '15%', color: 'orange', delay: 1.2 },
                            { Icon: Radio, x: '45%', y: '80%', color: 'pink', delay: 1.4 },
                        ].map((item, i) => {
                            const colorMap: Record<string, string> = {
                                red: '#ef4444',
                                cyan: '#06b6d4',
                                green: '#22c55e',
                                yellow: '#eab308',
                                purple: '#a855f7',
                                blue: '#3b82f6',
                                orange: '#f97316',
                                pink: '#ec4899'
                            };
                            const glowColor = colorMap[item.color] || '#06b6d4';

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 1.2, 1],
                                        opacity: [0, 1, 0.6]
                                    }}
                                    transition={{ delay: item.delay, duration: 0.5 }}
                                    className="absolute w-10 h-10 flex items-center justify-center"
                                    style={{ left: item.x, top: item.y }}
                                >
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                `0 0 20px ${glowColor}`,
                                                `0 0 40px ${glowColor}`,
                                                `0 0 20px ${glowColor}`
                                            ]
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-full h-full rounded-lg bg-white/10 border border-white/30 flex items-center justify-center"
                                        style={{ borderColor: `${glowColor}50`, backgroundColor: `${glowColor}20` }}
                                    >
                                        <item.Icon className="w-5 h-5" style={{ color: glowColor }} />
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </>
                )}
            </AnimatePresence>

            {/* Connection lines between nodes */}
            {phase >= 2 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[
                        { x1: '15%', y1: '20%', x2: '50%', y2: '50%' },
                        { x1: '80%', y1: '25%', x2: '50%', y2: '50%' },
                        { x1: '10%', y1: '70%', x2: '50%', y2: '50%' },
                        { x1: '85%', y1: '75%', x2: '50%', y2: '50%' },
                    ].map((line, i) => (
                        <motion.line
                            key={i}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke="url(#lineGradient)"
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                    ))}
                </svg>
            )}

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10">
                    {/* Pulsing shield icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="relative mx-auto mb-8"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.2, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-cyan-500/30 blur-xl"
                        />
                        <div className="relative w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)]">
                            <Eye className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    {/* Main title */}
                    <AnimatePresence>
                        {showMain && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.h1
                                    className="text-6xl font-black tracking-wider mb-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #22c55e 50%, #06b6d4 100%)',
                                        backgroundSize: '200% 200%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    TRACELENS
                                </motion.h1>
                                <motion.p
                                    className="text-lg text-gray-400 tracking-[0.3em] mb-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    OSINT + DIGITAL FORENSICS
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rotating threat status text */}
                    <div className="h-8 overflow-hidden">
                        <motion.div
                            animate={{ y: [-32 * (phase % 4), -32 * ((phase + 1) % 4)] }}
                            transition={{ duration: 0.5 }}
                            className="space-y-0"
                        >
                            {threatWords.map((word, i) => (
                                <div key={i} className="h-8 flex items-center justify-center">
                                    <span className="text-sm text-cyan-400 font-mono tracking-widest flex items-center gap-2">
                                        <motion.span
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            ●
                                        </motion.span>
                                        {word}
                                        <motion.span
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                                        >
                                            ●
                                        </motion.span>
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                        className="mt-8 w-64 h-1 mx-auto bg-white/10 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 via-green-400 to-cyan-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: duration / 1000 - 0.5, ease: 'easeInOut' }}
                        />
                    </motion.div>

                    {/* Secure connection text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-4 flex items-center justify-center gap-2 text-xs text-green-400"
                    >
                        <Lock className="w-3 h-3" />
                        <span>ESTABLISHING SECURE CONNECTION</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            ...
                        </motion.span>
                    </motion.div>

                    {/* Developer credit */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="mt-8 flex flex-col items-center gap-3"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 hover:border-cyan-500/40 transition-all"
                        >
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white"
                            >
                                AP
                            </motion.div>
                            <span className="text-xs text-gray-400">
                                Developed by{' '}
                                <motion.span
                                    className="text-purple-400 font-medium"
                                    whileHover={{
                                        textShadow: '0 0 10px #8b5cf6',
                                        color: '#c4b5fd'
                                    }}
                                >
                                    Abishek Palani
                                </motion.span>
                            </span>
                            <span className="text-gray-600">|</span>
                            <motion.span
                                className="text-xs text-cyan-400 font-bold"
                                whileHover={{
                                    textShadow: '0 0 10px #06b6d4'
                                }}
                            >
                                AP Solutions
                            </motion.span>
                        </motion.div>

                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            {[
                                { href: 'https://github.com/AP952005', label: 'G', color: 'from-gray-500 to-gray-600' },
                                { href: 'https://www.linkedin.com/in/ap9505', label: 'in', color: 'from-blue-500 to-cyan-500' },
                                { href: 'mailto:abishekpalanisivashanmugam@gmail.com', label: '@', color: 'from-purple-500 to-pink-500' }
                            ].map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.2 + i * 0.1 }}
                                    whileHover={{
                                        scale: 1.2,
                                        boxShadow: '0 0 15px rgba(6,182,212,0.5)'
                                    }}
                                    className={`w-6 h-6 rounded-md bg-gradient-to-br ${social.color} flex items-center justify-center text-[9px] font-bold text-white border border-white/20 hover:border-white/50 transition-all`}
                                >
                                    {social.label}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Corner decorations */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <div
                    key={corner}
                    className={`absolute ${corner.includes('top') ? 'top-4' : 'bottom-4'} ${corner.includes('left') ? 'left-4' : 'right-4'}`}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1.5 }}
                        className="w-16 h-16 border-l-2 border-t-2 border-cyan-500/30"
                        style={{
                            transform: `rotate(${corner === 'top-left' ? 0 : corner === 'top-right' ? 90 : corner === 'bottom-left' ? -90 : 180}deg)`
                        }}
                    />
                </div>
            ))}
        </motion.div>
    );
}
