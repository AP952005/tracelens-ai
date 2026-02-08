'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Terminal, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
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
    </div>
  );
}