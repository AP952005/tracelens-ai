'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreatMeterProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animated?: boolean;
}

export function ThreatMeter({ score, size = 'md', showLabel = true, animated = true }: ThreatMeterProps) {
    const [displayScore, setDisplayScore] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        if (animated) {
            const duration = 2000;
            const steps = 60;
            const increment = score / steps;
            let current = 0;
            const interval = setInterval(() => {
                current += increment;
                if (current >= score) {
                    setDisplayScore(score);
                    clearInterval(interval);
                } else {
                    setDisplayScore(Math.round(current));
                }
            }, duration / steps);
            return () => clearInterval(interval);
        } else {
            setDisplayScore(score);
        }
    }, [score, animated]);

    const getLevel = (s: number) => {
        if (s < 20) return { level: 'LOW', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' };
        if (s < 45) return { level: 'MEDIUM', color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' };
        if (s < 70) return { level: 'HIGH', color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' };
        return { level: 'CRITICAL', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' };
    };

    const { level, color, glow } = getLevel(displayScore);

    const sizes = {
        sm: { outer: 120, inner: 100, stroke: 8, font: 'text-2xl' },
        md: { outer: 180, inner: 150, stroke: 12, font: 'text-4xl' },
        lg: { outer: 240, inner: 200, stroke: 16, font: 'text-5xl' }
    };

    const s = sizes[size];
    const radius = (s.inner - s.stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (displayScore / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                className="relative"
                style={{ width: s.outer, height: s.outer }}
            >
                {/* Outer glow ring */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                        boxShadow: [
                            `0 0 20px ${glow}`,
                            `0 0 40px ${glow}`,
                            `0 0 20px ${glow}`
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Background circle with grid pattern */}
                <svg width={s.outer} height={s.outer} className="absolute inset-0">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <circle
                        cx={s.outer / 2}
                        cy={s.outer / 2}
                        r={radius + s.stroke}
                        fill="url(#grid)"
                        stroke="rgba(6, 182, 212, 0.2)"
                        strokeWidth="1"
                    />
                </svg>

                {/* Progress ring SVG */}
                <svg width={s.outer} height={s.outer} className="absolute inset-0 -rotate-90">
                    {/* Background track */}
                    <circle
                        cx={s.outer / 2}
                        cy={s.outer / 2}
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={s.stroke}
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx={s.outer / 2}
                        cy={s.outer / 2}
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={s.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                    {/* Tick marks */}
                    {[...Array(20)].map((_, i) => {
                        const angle = (i / 20) * 360 - 90;
                        const x1 = s.outer / 2 + (radius + s.stroke / 2 + 2) * Math.cos(angle * Math.PI / 180);
                        const y1 = s.outer / 2 + (radius + s.stroke / 2 + 2) * Math.sin(angle * Math.PI / 180);
                        const x2 = s.outer / 2 + (radius + s.stroke / 2 + 8) * Math.cos(angle * Math.PI / 180);
                        const y2 = s.outer / 2 + (radius + s.stroke / 2 + 8) * Math.sin(angle * Math.PI / 180);
                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={i % 5 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
                                strokeWidth={i % 5 === 0 ? 2 : 1}
                            />
                        );
                    })}
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className={`font-black ${s.font}`}
                        style={{ color }}
                        animate={{
                            textShadow: [
                                `0 0 10px ${glow}`,
                                `0 0 20px ${glow}`,
                                `0 0 10px ${glow}`
                            ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {displayScore}
                    </motion.span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">THREAT</span>
                </div>

                {/* Scanning line effect */}
                <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    style={{ width: s.outer, height: s.outer }}
                >
                    <motion.div
                        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                        initial={{ top: 0 }}
                        animate={{ top: s.outer }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ opacity: 0.5 }}
                    />
                </motion.div>
            </motion.div>

            {/* Label */}
            {showLabel && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-center"
                >
                    <motion.span
                        className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border"
                        style={{
                            color,
                            borderColor: color,
                            backgroundColor: `${color}20`,
                            boxShadow: `0 0 20px ${glow}`
                        }}
                        animate={{
                            boxShadow: [
                                `0 0 10px ${glow}`,
                                `0 0 25px ${glow}`,
                                `0 0 10px ${glow}`
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {level} RISK
                    </motion.span>
                </motion.div>
            )}
        </div>
    );
}

// Compact inline version
export function ThreatBadge({ score }: { score: number }) {
    const getLevel = (s: number) => {
        if (s < 20) return { level: 'LOW', color: '#22c55e', bg: 'bg-green-500/20', border: 'border-green-500/50' };
        if (s < 45) return { level: 'MED', color: '#eab308', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
        if (s < 70) return { level: 'HIGH', color: '#f97316', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
        return { level: 'CRIT', color: '#ef4444', bg: 'bg-red-500/20', border: 'border-red-500/50' };
    };

    const { level, color, bg, border } = getLevel(score);

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg} ${border} border`}
        >
            <span className="font-bold text-lg" style={{ color }}>{score}</span>
            <span className="text-xs font-medium" style={{ color }}>{level}</span>
        </motion.div>
    );
}
