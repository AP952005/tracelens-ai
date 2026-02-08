'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Code, Heart, ArrowLeft, Github, Linkedin, Mail, Globe,
    Terminal, Database, Activity, Lock, Eye, Wifi, Server, Users,
    Fingerprint, Zap, Radio, Cpu, Scan
} from 'lucide-react';

// Developer info
const DEVELOPER = {
    name: 'Abishek Palani',
    company: 'AP Solutions',
    github: 'https://github.com/AP952005',
    linkedin: 'https://www.linkedin.com/in/ap9505',
    email: 'abishekpalanisivashanmugam@gmail.com'
};

// Animated developer name with decrypt effect
function AnimatedName({ name, size = 'normal' }: { name: string; size?: 'normal' | 'large' }) {
    const [isHovered, setIsHovered] = useState(false);
    const [displayText, setDisplayText] = useState(name);

    const handleHoverStart = () => {
        setIsHovered(true);
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF';
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplayText(
                name
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) return name[index];
                        if (char === ' ') return ' ';
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );
            iterations += 1;
            if (iterations > name.length) {
                clearInterval(interval);
                setDisplayText(name);
            }
        }, 40);
    };

    const handleHoverEnd = () => {
        setIsHovered(false);
        setDisplayText(name);
    };

    return (
        <motion.span
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            className="relative cursor-pointer inline-block"
        >
            <motion.span
                className={`font-black transition-all duration-300 ${size === 'large' ? 'text-3xl' : 'text-xl'} ${isHovered ? 'text-cyan-300' : 'text-white'}`}
                animate={{
                    textShadow: isHovered
                        ? ['0 0 10px #06b6d4', '0 0 30px #06b6d4', '0 0 10px #06b6d4']
                        : '0 0 0px transparent'
                }}
                transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
            >
                {displayText}
            </motion.span>

            {/* Scanning line effect */}
            <AnimatePresence>
                {isHovered && (
                    <>
                        <motion.span
                            initial={{ left: 0, opacity: 0 }}
                            animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                        />
                        {/* Glowing underline */}
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 origin-left"
                        />
                    </>
                )}
            </AnimatePresence>
        </motion.span>
    );
}

// Security-themed social button with advanced animations
function SecuritySocialButton({
    href,
    icon: Icon,
    label,
    color,
    glowColor
}: {
    href: string;
    icon: any;
    label: string;
    color: string;
    glowColor: string;
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
        >
            {/* Pulsing outer rings */}
            {[1, 2, 3].map((ring) => (
                <motion.div
                    key={ring}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{
                        scale: isHovered ? [1, 2, 2] : 1,
                        opacity: isHovered ? [0.3, 0, 0] : 0,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isHovered ? Infinity : 0,
                        delay: ring * 0.2
                    }}
                    className={`absolute inset-0 rounded-xl border ${color}`}
                />
            ))}

            {/* Radar sweep effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-xl overflow-hidden"
                    >
                        <div className={`absolute top-1/2 left-1/2 w-0.5 h-1/2 origin-bottom ${color.replace('border', 'bg')}`} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main button */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: isHovered ? `0 0 30px ${glowColor}` : '0 0 0px transparent'
                }}
                className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    bg-white/5 backdrop-blur-sm border border-white/10
                    transition-all duration-300
                    ${isHovered ? color : ''}
                `}
            >
                <motion.div
                    animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                >
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${isHovered ? color.replace('border', 'text') : 'text-gray-400'}`} />
                </motion.div>

                {/* Security indicators */}
                <AnimatePresence>
                    {isHovered && (
                        <>
                            {/* Top-right status */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-full h-full rounded-full bg-green-500"
                                />
                            </motion.div>

                            {/* Lock icon */}
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/80 flex items-center justify-center border border-green-500/50"
                            >
                                <Lock className="w-2 h-2 text-green-500" />
                            </motion.div>

                            {/* Fingerprint scan effect */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.3, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 rounded-xl flex items-center justify-center"
                            >
                                <Fingerprint className={`w-8 h-8 ${color.replace('border', 'text')}`} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Label */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap"
            >
                {label}
            </motion.div>
        </motion.a>
    );
}

export default function AboutPage() {
    const [avatarHovered, setAvatarHovered] = useState(false);

    const features = [
        { icon: Github, title: 'GitHub Intelligence', desc: 'User profiles, repos, commit email leaks', color: 'cyan' },
        { icon: Mail, title: 'Email Verification', desc: 'Validity, disposable detection, domain intel', color: 'purple' },
        { icon: Shield, title: 'VirusTotal Scanning', desc: 'URL, domain, IP, file hash analysis', color: 'green' },
        { icon: Wifi, title: 'IP Geolocation', desc: 'Location, VPN/Tor/Proxy detection', color: 'yellow' },
        { icon: Globe, title: 'WHOIS Intelligence', desc: 'Domain registration, DNS records', color: 'blue' },
        { icon: Users, title: 'Social Scanner', desc: '25+ platforms profile detection', color: 'pink' },
        { icon: Server, title: 'Shodan Integration', desc: 'IoT devices, open ports, vulnerabilities', color: 'orange' },
        { icon: Lock, title: 'Breach Detection', desc: 'HaveIBeenPwned integration', color: 'red' },
    ];

    const techStack = [
        'Next.js 15', 'React 19', 'TypeScript', 'Framer Motion',
        'TailwindCSS', 'Lucide Icons', 'Google Gemini AI'
    ];

    return (
        <div className="min-h-screen bg-[#05070d] text-white font-mono">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-b border-white/10"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: -10 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </motion.button>
                        <div className="flex items-center gap-2">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Shield className="w-6 h-6 text-cyan-400" />
                            </motion.div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                                TRACELENS
                            </span>
                        </div>
                    </Link>
                </div>
            </motion.header>

            <main className="max-w-6xl mx-auto py-16 px-6">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                        About TraceLens
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        An advanced AI-powered OSINT and Digital Forensics Investigation Platform
                        for comprehensive threat analysis and intelligence gathering.
                    </p>
                </motion.div>

                {/* Developer Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-white/10 relative overflow-hidden">
                        {/* Background grid animation */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            {/* Developer Avatar with security animation */}
                            <motion.div
                                onHoverStart={() => setAvatarHovered(true)}
                                onHoverEnd={() => setAvatarHovered(false)}
                                className="relative"
                            >
                                {/* Orbiting rings */}
                                {[1, 2, 3].map((ring) => (
                                    <motion.div
                                        key={ring}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3 + ring, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{
                                            width: 160 + ring * 20,
                                            height: 160 + ring * 20,
                                            left: -(ring * 10),
                                            top: -(ring * 10)
                                        }}
                                    >
                                        <div className={`w-full h-full rounded-full border ${avatarHovered ? 'border-cyan-500/50' : 'border-white/10'} transition-colors`}>
                                            <div className={`absolute w-2 h-2 rounded-full ${avatarHovered ? 'bg-cyan-500' : 'bg-purple-500'} transition-colors`}
                                                style={{ top: '50%', left: 0, transform: 'translateY(-50%)' }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Main avatar */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    animate={{
                                        boxShadow: avatarHovered
                                            ? ['0 0 30px rgba(139,92,246,0.5)', '0 0 50px rgba(6,182,212,0.5)', '0 0 30px rgba(139,92,246,0.5)']
                                            : '0 0 20px rgba(139,92,246,0.3)'
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center cursor-pointer"
                                >
                                    <motion.span
                                        className="text-6xl font-black text-white"
                                        animate={{
                                            textShadow: avatarHovered
                                                ? ['0 0 10px #fff', '0 0 20px #fff', '0 0 10px #fff']
                                                : '0 0 0px transparent'
                                        }}
                                    >
                                        AP
                                    </motion.span>

                                    {/* Scan overlay on hover */}
                                    <AnimatePresence>
                                        {avatarHovered && (
                                            <motion.div
                                                initial={{ y: '-100%' }}
                                                animate={{ y: '100%' }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>

                            {/* Developer Info */}
                            <div className="flex-1 text-center md:text-left relative z-10">
                                <AnimatedName name={DEVELOPER.name} size="large" />
                                <motion.div
                                    className="text-xl text-purple-400 font-bold mb-4 flex items-center gap-2 justify-center md:justify-start"
                                    whileHover={{ x: 5 }}
                                >
                                    <Shield className="w-5 h-5" />
                                    Founder & Lead Developer
                                </motion.div>
                                <p className="text-gray-400 mb-6 max-w-xl">
                                    Passionate about cybersecurity, OSINT, and building tools that empower
                                    investigators and security professionals. TraceLens is the culmination
                                    of expertise in AI, web development, and digital forensics.
                                </p>

                                {/* Social Links with security animations */}
                                <div className="flex items-center gap-6 justify-center md:justify-start">
                                    <SecuritySocialButton
                                        href={DEVELOPER.github}
                                        icon={Github}
                                        label="GitHub"
                                        color="border-white"
                                        glowColor="rgba(255,255,255,0.3)"
                                    />
                                    <SecuritySocialButton
                                        href={DEVELOPER.linkedin}
                                        icon={Linkedin}
                                        label="LinkedIn"
                                        color="border-cyan-500"
                                        glowColor="rgba(6,182,212,0.5)"
                                    />
                                    <SecuritySocialButton
                                        href={`mailto:${DEVELOPER.email}`}
                                        icon={Mail}
                                        label="Email"
                                        color="border-purple-500"
                                        glowColor="rgba(139,92,246,0.5)"
                                    />
                                </div>
                            </div>

                            {/* Company Badge */}
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                                className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/30 relative overflow-hidden"
                            >
                                {/* Scanning effect */}
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
                                />

                                <motion.div
                                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2 relative"
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    style={{ backgroundSize: '200% 200%' }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    AP
                                </motion.div>
                                <div className="text-lg font-bold text-white relative">Solutions</div>
                                <div className="text-xs text-gray-500 mt-2 relative">Innovation • Excellence</div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Features Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-bold text-center text-cyan-400 mb-8">
                        <Terminal className="inline w-6 h-6 mr-2" />
                        Platform Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="p-6 rounded-xl bg-gradient-to-br from-[#0a1020] to-[#0d1528] border border-white/10 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                            >
                                {/* Hover glow */}
                                <motion.div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                        background: `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 70%)`
                                    }}
                                />

                                <feature.icon className="w-8 h-8 text-cyan-400 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-white mb-2 relative z-10">{feature.title}</h3>
                                <p className="text-sm text-gray-500 relative z-10">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Tech Stack */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-bold text-center text-purple-400 mb-8">
                        <Code className="inline w-6 h-6 mr-2" />
                        Technology Stack
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {techStack.map((tech, i) => (
                            <motion.span
                                key={tech}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + i * 0.05 }}
                                whileHover={{ scale: 1.1, y: -3 }}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white font-medium hover:border-cyan-500/50 transition-all cursor-pointer"
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6,182,212,0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                        >
                            Launch TraceLens Terminal
                        </motion.button>
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>© {new Date().getFullYear()}</span>
                        <span className="text-purple-400 font-bold">AP Solutions</span>
                        <span>• All rights reserved</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>Made with</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </motion.span>
                        <span>in India 🇮🇳</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
