'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RiskFactor {
    category: string;
    points: number;
    maxPoints: number;
    description: string;
}

interface RiskBreakdownProps {
    factors: RiskFactor[];
    animated?: boolean;
}

export function RiskBreakdown({ factors, animated = true }: RiskBreakdownProps) {
    const getBarColor = (percentage: number) => {
        if (percentage < 30) return { bar: 'bg-green-500', glow: 'shadow-green-500/50' };
        if (percentage < 60) return { bar: 'bg-yellow-500', glow: 'shadow-yellow-500/50' };
        if (percentage < 80) return { bar: 'bg-orange-500', glow: 'shadow-orange-500/50' };
        return { bar: 'bg-red-500', glow: 'shadow-red-500/50' };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0a1020] to-[#0d1528] rounded-2xl p-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
        >
            <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                RISK FACTOR ANALYSIS
            </h3>

            <div className="space-y-5">
                {factors.map((factor, index) => {
                    const percentage = (factor.points / factor.maxPoints) * 100;
                    const { bar, glow } = getBarColor(percentage);

                    return (
                        <motion.div
                            key={factor.category}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: animated ? index * 0.1 : 0, duration: 0.4 }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-300">{factor.category}</span>
                                <span className="text-sm font-mono text-cyan-400">
                                    {factor.points}/{factor.maxPoints}
                                </span>
                            </div>

                            {/* Progress bar container */}
                            <div className="relative h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                {/* Background grid pattern */}
                                <div className="absolute inset-0 opacity-20">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 w-px bg-white/20"
                                            style={{ left: `${i * 10}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Animated progress bar */}
                                <motion.div
                                    className={`absolute inset-y-0 left-0 ${bar} rounded-full shadow-lg ${glow}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                        delay: animated ? index * 0.1 + 0.2 : 0,
                                        duration: 0.8,
                                        ease: 'easeOut'
                                    }}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '200%' }}
                                        transition={{
                                            delay: animated ? index * 0.1 + 1 : 0,
                                            duration: 1,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    />
                                </motion.div>
                            </div>

                            <p className="text-xs text-gray-500 mt-1.5 pl-1">{factor.description}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Total score indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 pt-4 border-t border-white/10"
            >
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">COMPOSITE SCORE</span>
                    <span className="text-2xl font-bold text-cyan-400">
                        {factors.reduce((acc, f) => acc + f.points, 0)}
                        <span className="text-sm text-gray-500 ml-1">
                            / {factors.reduce((acc, f) => acc + f.maxPoints, 0)}
                        </span>
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Radial chart version for more visual impact
export function RiskRadial({ factors }: { factors: RiskFactor[] }) {
    const size = 300;
    const center = size / 2;
    const maxRadius = size / 2 - 40;
    const minRadius = 40;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-[#0a1020] to-[#0d1528] rounded-2xl p-6 border border-cyan-500/20"
        >
            <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">RISK RADAR</h3>

            <svg width={size} height={size} className="mx-auto">
                <defs>
                    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(6, 182, 212, 0.1)" />
                        <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                    </radialGradient>
                </defs>

                {/* Background circles */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={maxRadius * scale}
                        fill="none"
                        stroke="rgba(6, 182, 212, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Center glow */}
                <circle
                    cx={center}
                    cy={center}
                    r={maxRadius}
                    fill="url(#radarGradient)"
                />

                {/* Axis lines */}
                {factors.map((_, i) => {
                    const angle = (i / factors.length) * 360 - 90;
                    const x = center + maxRadius * Math.cos(angle * Math.PI / 180);
                    const y = center + maxRadius * Math.sin(angle * Math.PI / 180);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(6, 182, 212, 0.3)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data polygon */}
                <motion.polygon
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    points={factors.map((f, i) => {
                        const angle = (i / factors.length) * 360 - 90;
                        const percentage = f.points / f.maxPoints;
                        const r = minRadius + (maxRadius - minRadius) * percentage;
                        const x = center + r * Math.cos(angle * Math.PI / 180);
                        const y = center + r * Math.sin(angle * Math.PI / 180);
                        return `${x},${y}`;
                    }).join(' ')}
                    fill="rgba(239, 68, 68, 0.2)"
                    stroke="rgba(239, 68, 68, 0.8)"
                    strokeWidth="2"
                />

                {/* Data points */}
                {factors.map((f, i) => {
                    const angle = (i / factors.length) * 360 - 90;
                    const percentage = f.points / f.maxPoints;
                    const r = minRadius + (maxRadius - minRadius) * percentage;
                    const x = center + r * Math.cos(angle * Math.PI / 180);
                    const y = center + r * Math.sin(angle * Math.PI / 180);

                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                        />
                    );
                })}

                {/* Labels */}
                {factors.map((f, i) => {
                    const angle = (i / factors.length) * 360 - 90;
                    const labelR = maxRadius + 25;
                    const x = center + labelR * Math.cos(angle * Math.PI / 180);
                    const y = center + labelR * Math.sin(angle * Math.PI / 180);

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] fill-gray-400"
                        >
                            {f.category.split(' ')[0]}
                        </text>
                    );
                })}
            </svg>
        </motion.div>
    );
}
