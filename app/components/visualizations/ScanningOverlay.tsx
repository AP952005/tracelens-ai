'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Database, Search, Wifi, Lock, Globe, Zap } from 'lucide-react';

interface ScanningOverlayProps {
    isScanning: boolean;
    query: string;
    onComplete?: () => void;
}

const scanningSteps = [
    { text: 'INITIALIZING THREAT DETECTION...', icon: <Shield className="w-4 h-4" />, color: '#06b6d4' },
    { text: 'CONNECTING TO OSINT DATABASES...', icon: <Database className="w-4 h-4" />, color: '#8b5cf6' },
    { text: 'SCANNING SOCIAL NETWORKS...', icon: <Globe className="w-4 h-4" />, color: '#22c55e' },
    { text: 'QUERYING BREACH DATABASES...', icon: <AlertTriangle className="w-4 h-4" />, color: '#ef4444' },
    { text: 'ANALYZING DIGITAL FOOTPRINT...', icon: <Search className="w-4 h-4" />, color: '#f59e0b' },
    { text: 'CALCULATING THREAT METRICS...', icon: <Zap className="w-4 h-4" />, color: '#ec4899' },
    { text: 'COMPILING INVESTIGATION REPORT...', icon: <Lock className="w-4 h-4" />, color: '#06b6d4' },
];

export function ScanningOverlay({ isScanning, query }: ScanningOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isScanning) {
            setCurrentStep(0);
            setProgress(0);
            return;
        }

        const stepDuration = 650;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            if (step < scanningSteps.length) {
                setCurrentStep(step);
                setProgress(((step + 1) / scanningSteps.length) * 100);
            } else {
                clearInterval(interval);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, [isScanning]);

    const currentColor = scanningSteps[currentStep]?.color || '#06b6d4';

    return (
        <AnimatePresence>
            {isScanning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-[#020408]/98 backdrop-blur-xl flex items-center justify-center"
                >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Multi-color gradient mesh */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                background: [
                                    'radial-gradient(circle at 20% 30%, rgba(6,182,212,0.15) 0%, transparent 50%)',
                                    'radial-gradient(circle at 80% 70%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                                    'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.15) 0%, transparent 50%)',
                                    'radial-gradient(circle at 20% 30%, rgba(6,182,212,0.15) 0%, transparent 50%)',
                                ]
                            }}
                            transition={{ duration: 8, repeat: Infinity }}
                        />

                        {/* Cyber grid with gradient colors */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                        {/* Multiple scanning lines with different colors */}
                        <motion.div
                            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                            animate={{ y: ['0vh', '100vh'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                            animate={{ y: ['100vh', '0vh'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                            className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-pink-500 to-transparent"
                            animate={{ x: ['0vw', '100vw'] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Radar sweep */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
                            <motion.div
                                className="w-full h-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            >
                                <div className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom bg-gradient-to-t from-cyan-500/50 to-transparent" />
                            </motion.div>
                            {[1, 2, 3, 4].map((ring) => (
                                <div
                                    key={ring}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                                    style={{
                                        width: ring * 150,
                                        height: ring * 150,
                                        borderColor: `rgba(139, 92, 246, ${0.2 - ring * 0.03})`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 max-w-2xl w-full mx-4">
                        {/* Central orb with multi-color glow */}
                        <div className="flex justify-center mb-12">
                            <motion.div
                                className="relative w-40 h-40"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            >
                                {/* Outer glow ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    animate={{
                                        boxShadow: [
                                            '0 0 60px rgba(6,182,212,0.4), 0 0 120px rgba(139,92,246,0.2)',
                                            '0 0 80px rgba(139,92,246,0.4), 0 0 160px rgba(236,72,153,0.2)',
                                            '0 0 60px rgba(236,72,153,0.4), 0 0 120px rgba(6,182,212,0.2)',
                                            '0 0 60px rgba(6,182,212,0.4), 0 0 120px rgba(139,92,246,0.2)',
                                        ]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />

                                {/* Outer ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2"
                                    style={{ borderColor: currentColor }}
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />

                                {/* Middle ring - purple */}
                                <motion.div
                                    className="absolute inset-4 rounded-full border-2 border-purple-500/60"
                                    animate={{ scale: [1, 0.95, 1], rotate: -360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                />

                                {/* Inner ring - pink */}
                                <motion.div
                                    className="absolute inset-8 rounded-full border-2 border-pink-500/50"
                                    animate={{ scale: [0.95, 1.05, 0.95] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />

                                {/* Core glow */}
                                <motion.div
                                    className="absolute inset-12 rounded-full"
                                    style={{ backgroundColor: `${currentColor}30` }}
                                    animate={{
                                        boxShadow: [
                                            `0 0 30px ${currentColor}50`,
                                            `0 0 60px ${currentColor}70`,
                                            `0 0 30px ${currentColor}50`
                                        ]
                                    }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />

                                {/* Center icon */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    <div style={{ color: currentColor }}>
                                        {scanningSteps[currentStep]?.icon}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Target info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">TARGET IDENTIFIER</div>
                            <motion.div
                                className="text-2xl font-mono text-white bg-gradient-to-r from-black/50 via-black/30 to-black/50 px-6 py-3 rounded-lg inline-block"
                                style={{
                                    border: `1px solid ${currentColor}50`,
                                    boxShadow: `0 0 30px ${currentColor}20`
                                }}
                            >
                                <span style={{ color: currentColor }}>{query}</span>
                            </motion.div>
                        </motion.div>

                        {/* Progress bar with gradient */}
                        <div className="mb-8">
                            <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4)`,
                                        backgroundSize: '200% 100%',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${progress}%`,
                                        backgroundPosition: ['0% 50%', '100% 50%']
                                    }}
                                    transition={{
                                        width: { duration: 0.3 },
                                        backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                                <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="text-purple-400"
                                >
                                    SCANNING IN PROGRESS
                                </motion.span>
                            </div>
                        </div>

                        {/* Status messages with icons and colors */}
                        <div className="bg-black/40 rounded-xl border border-white/10 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-green-400"
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                                <span className="text-green-400 text-xs font-mono">SYSTEM ACTIVE</span>
                                <motion.div
                                    className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </div>

                            <div className="space-y-3 max-h-48 overflow-hidden">
                                {scanningSteps.slice(0, currentStep + 1).map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3 font-mono text-sm"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: `${step.color}20`,
                                                border: `1px solid ${step.color}50`
                                            }}
                                        >
                                            <div style={{ color: step.color }}>{step.icon}</div>
                                        </div>
                                        <span style={{ color: i === currentStep ? step.color : '#6b7280' }}>
                                            {step.text}
                                        </span>
                                        {i < currentStep && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-green-400 ml-auto"
                                            >
                                                ✓
                                            </motion.span>
                                        )}
                                        {i === currentStep && (
                                            <motion.span
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                                style={{ color: step.color }}
                                                className="ml-auto"
                                            >
                                                ▶
                                            </motion.span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Floating particles with multiple colors */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(30)].map((_, i) => {
                                const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b'];
                                const color = colors[i % colors.length];
                                return (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{
                                            x: Math.random() * 100 + '%',
                                            y: '100%',
                                            opacity: 0
                                        }}
                                        animate={{
                                            y: '-100%',
                                            opacity: [0, 0.8, 0]
                                        }}
                                        transition={{
                                            duration: 2 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Keep the old IntroAnimation for backwards compatibility but it's now replaced by CyberIntro
export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-[#05070d] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-black text-cyan-400">TRACELENS</h1>
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
        </div>
    );
}
