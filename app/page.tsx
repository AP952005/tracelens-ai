'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Terminal, Activity, Github, Globe, Wifi, Heart, Code, Linkedin, Mail, Fingerprint } from 'lucide-react';

// Developer info
const DEVELOPER = {
  name: 'Abishek Palani',
  company: 'AP Solutions',
  github: 'https://github.com/AP952005',
  linkedin: 'https://www.linkedin.com/in/ap9505',
  email: 'abishekpalanisivashanmugam@gmail.com'
};

// Animated developer name with decrypt effect
function AnimatedDevName({ name }: { name: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(name);

  const handleHoverStart = () => {
    setIsHovered(true);
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF';
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        name.split('').map((char, index) => {
          if (index < iterations) return name[index];
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      iterations += 1;
      if (iterations > name.length) {
        clearInterval(interval);
        setDisplayText(name);
      }
    }, 30);
  };

  return (
    <motion.span
      onHoverStart={handleHoverStart}
      onHoverEnd={() => { setIsHovered(false); setDisplayText(name); }}
      className="relative cursor-pointer"
    >
      <motion.span
        className={`font-medium transition-all duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}
        animate={{
          textShadow: isHovered ? '0 0 15px #06b6d4' : '0 0 0px transparent'
        }}
      >
        {displayText}
      </motion.span>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-400 origin-left"
          />
        )}
      </AnimatePresence>
    </motion.span>
  );
}

// Security-themed social icon
function SecurityIcon({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
      title={label}
    >
      {/* Pulse ring */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.5, 1.5] : 1,
          opacity: isHovered ? [0.5, 0, 0] : 0,
        }}
        transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
        className={`absolute inset-0 rounded-lg ${color}`}
      />

      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isHovered ? `0 0 20px ${color.includes('white') ? 'rgba(255,255,255,0.3)' : color.includes('cyan') ? 'rgba(6,182,212,0.5)' : 'rgba(139,92,246,0.5)'}` : '0 0 0 transparent'
        }}
        className={`relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all ${isHovered ? color : ''}`}
      >
        <Icon className={`w-4 h-4 transition-colors ${isHovered ? color.replace('border', 'text') : 'text-gray-400'}`} />

        {/* Lock indicator */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Lock className="w-1.5 h-1.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white font-sans overflow-hidden relative flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-block p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            TRACELENS AI
          </h1>
          <p className="text-xl text-cyan-100/60 max-w-2xl mx-auto font-mono">
            ADVANCED OSINT & FORENSIC INVESTIGATION TERMINAL
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12"
        >
          {[
            { icon: Terminal, title: "OSINT Scanning", desc: "Automated social footprint analysis" },
            { icon: Lock, title: "Breach Detection", desc: "Deep web credential exposure check" },
            { icon: Activity, title: "Threat Scoring", desc: "Real-time risk assessment engine" }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:border-cyan-500/50 transition-colors">
              <item.icon className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Additional feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-12"
        >
          {[
            { icon: Github, label: "GitHub Intel" },
            { icon: Globe, label: "Domain WHOIS" },
            { icon: Wifi, label: "IP Geolocation" },
            { icon: Shield, label: "VirusTotal" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <item.icon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/dashboard">
            <button className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)]">
              <span className="flex items-center gap-2">
                INITIALIZE TERMINAL
                <Terminal className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </main>

      {/* Developer credits footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 py-6 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold cursor-pointer"
            >
              AP
            </motion.div>
            <div className="text-left">
              <div className="text-sm text-white font-medium">
                Developed by <AnimatedDevName name={DEVELOPER.name} />
              </div>
              <motion.div
                className="text-xs text-purple-400 font-bold flex items-center gap-1"
                whileHover={{ x: 3 }}
              >
                <Shield className="w-3 h-3" />
                AP Solutions
              </motion.div>
            </div>
          </div>

          {/* Social icons with security animations */}
          <div className="flex items-center gap-3">
            <SecurityIcon href={DEVELOPER.github} icon={Github} label="GitHub" color="border-white" />
            <SecurityIcon href={DEVELOPER.linkedin} icon={Linkedin} label="LinkedIn" color="border-cyan-500" />
            <SecurityIcon href={`mailto:${DEVELOPER.email}`} icon={Mail} label="Email" color="border-purple-500" />
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-500" />
              <span>Next.js • TypeScript • AI</span>
            </div>
            <div className="flex items-center gap-1">
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

          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} AP Solutions • All rights reserved
          </div>
        </div>
      </motion.footer>
    </div>
  );
}