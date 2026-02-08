'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    delay?: number;
    hover?: boolean;
}

export function GlassCard({
    children,
    className = '',
    glowColor = 'rgba(6, 182, 212, 0.1)',
    delay = 0,
    hover = true
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={hover ? {
                scale: 1.02,
                boxShadow: `0 0 40px ${glowColor}`,
                borderColor: 'rgba(6, 182, 212, 0.5)'
            } : undefined}
            className={`
                relative overflow-hidden
                bg-gradient-to-br from-[#0a1020]/90 to-[#0d1528]/90
                backdrop-blur-xl
                border border-white/10
                rounded-2xl
                shadow-[0_0_20px_${glowColor}]
                transition-all duration-300
                ${className}
            `}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">{children}</div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30 rounded-br-2xl" />
        </motion.div>
    );
}

// Stat card with animated counter
interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color?: 'cyan' | 'red' | 'yellow' | 'green' | 'purple';
    delay?: number;
    suffix?: string;
}

export function StatCard({ label, value, icon, color = 'cyan', delay = 0, suffix = '' }: StatCardProps) {
    const colors = {
        cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'rgba(6,182,212,0.3)' },
        red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'rgba(239,68,68,0.3)' },
        yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.3)' },
        green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', glow: 'rgba(34,197,94,0.3)' },
        purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'rgba(168,85,247,0.3)' }
    };

    const c = colors[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${c.glow}` }}
            className={`
                relative p-5 rounded-xl border ${c.border} ${c.bg}
                backdrop-blur-sm
                transition-all duration-300
                cursor-default
            `}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>
                    {icon}
                </div>
                <motion.div
                    className={`w-2 h-2 rounded-full ${c.text.replace('text', 'bg')}`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            <motion.div
                className={`text-3xl font-black ${c.text}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring' }}
            >
                {typeof value === 'number' ? (
                    <CountUp end={value} delay={delay} />
                ) : value}
                {suffix && <span className="text-lg ml-1">{suffix}</span>}
            </motion.div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {label}
            </div>
        </motion.div>
    );
}

// Animated counter
function CountUp({ end, delay = 0, duration = 1500 }: { end: number; delay?: number; duration?: number }) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            const steps = 60;
            const increment = end / steps;
            let current = 0;
            const interval = setInterval(() => {
                current += increment;
                if (current >= end) {
                    setCount(end);
                    clearInterval(interval);
                } else {
                    setCount(Math.round(current));
                }
            }, duration / steps);
            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [end, delay, duration]);

    return <>{count}</>;
}

// Timeline event card
interface TimelineCardProps {
    time: string;
    title: string;
    description: string;
    type: 'scan' | 'breach' | 'profile' | 'analysis';
    index: number;
}

export function TimelineCard({ time, title, description, type, index }: TimelineCardProps) {
    const typeStyles = {
        scan: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: '🔍' },
        breach: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: '⚠️' },
        profile: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', icon: '👤' },
        analysis: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: '📊' }
    };

    const style = typeStyles[type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
        >
            {/* Timeline line */}
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`w-10 h-10 rounded-full ${style.bg} ${style.border} border-2 flex items-center justify-center text-lg`}
                >
                    {style.icon}
                </motion.div>
                <div className="flex-1 w-px bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
                <div className="text-xs text-gray-500 mb-1">{time}</div>
                <div className={`font-bold ${style.color}`}>{title}</div>
                <div className="text-sm text-gray-400 mt-1">{description}</div>
            </div>
        </motion.div>
    );
}

// Animated badge
interface AnimatedBadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
    pulse?: boolean;
}

export function AnimatedBadge({ children, variant = 'info', pulse = true }: AnimatedBadgeProps) {
    const variants = {
        success: 'bg-green-500/20 text-green-400 border-green-500/50',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        danger: 'bg-red-500/20 text-red-400 border-red-500/50',
        info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
    };

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                border ${variants[variant]}
            `}
        >
            {pulse && (
                <motion.span
                    className={`w-2 h-2 rounded-full ${variant === 'danger' ? 'bg-red-400' : variant === 'warning' ? 'bg-yellow-400' : variant === 'success' ? 'bg-green-400' : 'bg-cyan-400'}`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
            {children}
        </motion.span>
    );
}
