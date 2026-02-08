'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Heart, Shield, ExternalLink, Github, Linkedin, Mail, Lock, Fingerprint, Eye, Zap, Cpu, Radio } from 'lucide-react';

// Developer social links
const DEVELOPER = {
    name: 'Abishek Palani',
    company: 'AP Solutions',
    github: 'https://github.com/AP952005',
    linkedin: 'https://www.linkedin.com/in/ap9505',
    email: 'abishekpalanisivashanmugam@gmail.com'
};

interface FooterProps {
    variant?: 'minimal' | 'full';
}

// Animated developer name with security effect
function AnimatedDeveloperName({ name }: { name: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const [displayText, setDisplayText] = useState(name);

    const handleHoverStart = () => {
        setIsHovered(true);
        // Glitch/decrypt effect
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF';
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplayText(
                name
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) return name[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );
            iterations += 1;
            if (iterations > name.length) {
                clearInterval(interval);
                setDisplayText(name);
            }
        }, 30);
    };

    const handleHoverEnd = () => {
        setIsHovered(false);
        setDisplayText(name);
    };

    return (
        <motion.span
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            className="relative cursor-pointer"
        >
            <motion.span
                className={`font-bold transition-all duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}
                animate={{
                    textShadow: isHovered
                        ? ['0 0 10px #06b6d4', '0 0 20px #06b6d4', '0 0 10px #06b6d4']
                        : '0 0 0px transparent'
                }}
                transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
            >
                {displayText}
            </motion.span>

            {/* Scanning line effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ left: 0, opacity: 0 }}
                        animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                    />
                )}
            </AnimatePresence>
        </motion.span>
    );
}

// Security-themed social icon button
function SecurityIconButton({
    href,
    icon: Icon,
    color,
    label
}: {
    href: string;
    icon: any;
    color: string;
    label: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative group"
            title={label}
        >
            {/* Outer ring animation */}
            <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                    scale: isHovered ? [1, 1.5, 1.5] : 1,
                    opacity: isHovered ? [0, 0.5, 0] : 0,
                    rotate: isHovered ? 360 : 0
                }}
                transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                className={`absolute inset-0 rounded-lg border-2 ${color}`}
            />

            {/* Secondary pulse */}
            <motion.div
                animate={{
                    scale: isHovered ? [1, 1.3] : 1,
                    opacity: isHovered ? [0.5, 0] : 0
                }}
                transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
                className={`absolute inset-0 rounded-lg ${color.replace('border', 'bg').replace('-500', '-500/30')}`}
            />

            {/* Main button */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: isHovered
                        ? `0 0 20px ${color.includes('white') ? 'rgba(255,255,255,0.3)' : color.includes('cyan') ? 'rgba(6,182,212,0.5)' : 'rgba(139,92,246,0.5)'}`
                        : '0 0 0px transparent'
                }}
                className={`
                    relative w-8 h-8 rounded-lg flex items-center justify-center
                    bg-white/5 hover:bg-white/10 border border-white/10
                    transition-all duration-300
                    ${isHovered ? color.replace('border', 'border') : ''}
                `}
            >
                <Icon className={`w-4 h-4 transition-colors duration-300 ${isHovered ? color.replace('border', 'text') : 'text-gray-400'}`} />

                {/* Corner security indicators */}
                <AnimatePresence>
                    {isHovered && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 w-2 h-2"
                            >
                                <div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
                            </motion.div>

                            {/* Lock icon overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -bottom-1 -right-1"
                            >
                                <Lock className="w-2 h-2 text-green-500" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[10px] text-white whitespace-nowrap z-50"
                    >
                        {label}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-white/10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.a>
    );
}

// Animated company badge
function AnimatedCompanyBadge() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.span
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer"
        >
            <motion.span
                className="text-purple-400 font-bold"
                animate={{
                    textShadow: isHovered
                        ? ['0 0 10px #8b5cf6', '0 0 20px #8b5cf6', '0 0 10px #8b5cf6']
                        : '0 0 0px transparent'
                }}
            >
                AP Solutions
            </motion.span>

            {/* Shield animation on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0, x: 5 }}
                        animate={{ opacity: 1, scale: 1, x: 8 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="inline-block ml-1"
                    >
                        <Shield className="w-3 h-3 text-purple-400 inline" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.span>
    );
}

export function Footer({ variant = 'minimal' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    if (variant === 'minimal') {
        return (
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="py-4 px-6 border-t border-white/5 bg-[#02030a]"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-500" />
                        <span className="text-cyan-400 font-bold">TraceLens</span>
                        <span>v1.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Developed with</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                        </motion.span>
                        <span>by</span>
                        <AnimatedDeveloperName name={DEVELOPER.name} />
                        <span className="text-gray-600">|</span>
                        <AnimatedCompanyBadge />
                    </div>
                    <div className="text-gray-600">
                        © {currentYear} All rights reserved
                    </div>
                </div>
            </motion.footer>
        );
    }

    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="py-8 px-6 border-t border-white/10 bg-gradient-to-b from-[#05070d] to-[#02030a]"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center"
                            >
                                <Shield className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                                    TRACELENS
                                </h3>
                                <p className="text-xs text-gray-500">OSINT + Digital Forensics</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 max-w-md">
                            Advanced AI-powered forensic investigation platform for digital intelligence gathering,
                            threat analysis, and comprehensive OSINT reconnaissance.
                        </p>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Features</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Fingerprint className="w-3 h-3" /> GitHub Intelligence
                            </li>
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Eye className="w-3 h-3" /> Social Profile Scanner
                            </li>
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Shield className="w-3 h-3" /> VirusTotal Analysis
                            </li>
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Radio className="w-3 h-3" /> IP Geolocation
                            </li>
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Cpu className="w-3 h-3" /> Domain WHOIS
                            </li>
                            <li className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Dark Web Monitor
                            </li>
                        </ul>
                    </div>

                    {/* Developer */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Developer</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: [0, -5, 5, 0],
                                        boxShadow: '0 0 20px rgba(139,92,246,0.5)'
                                    }}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                                >
                                    AP
                                </motion.div>
                                <div>
                                    <div className="text-white font-bold">
                                        <AnimatedDeveloperName name={DEVELOPER.name} />
                                    </div>
                                    <div className="text-sm font-medium">
                                        <AnimatedCompanyBadge />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <SecurityIconButton
                                    href={DEVELOPER.github}
                                    icon={Github}
                                    color="border-white"
                                    label="GitHub"
                                />
                                <SecurityIconButton
                                    href={DEVELOPER.linkedin}
                                    icon={Linkedin}
                                    color="border-cyan-500"
                                    label="LinkedIn"
                                />
                                <SecurityIconButton
                                    href={`mailto:${DEVELOPER.email}`}
                                    icon={Mail}
                                    color="border-purple-500"
                                    label="Email"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>© {currentYear}</span>
                        <AnimatedCompanyBadge />
                        <span>• All rights reserved</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Built with</span>
                        <Code className="w-3 h-3 text-cyan-500" />
                        <span>Next.js, TypeScript & AI</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Made with</span>
                        <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                        </motion.span>
                        <span>in India 🇮🇳</span>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}

// Developer credit badge for embedding anywhere
export function DeveloperBadge() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.a
            href={DEVELOPER.github}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
        >
            {/* Scanning line effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
                    />
                )}
            </AnimatePresence>

            <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white"
            >
                AP
            </motion.div>
            <span className="text-xs text-gray-300 relative z-10">
                by <AnimatedDeveloperName name={DEVELOPER.name} />
            </span>
        </motion.a>
    );
}
