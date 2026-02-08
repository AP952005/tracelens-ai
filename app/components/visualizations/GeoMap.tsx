'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Clock, Shield, Wifi, AlertTriangle } from 'lucide-react';

interface GeoLocation {
    city: string;
    country: string;
    lat: number;
    lng: number;
    confidence: number;
    source: string;
}

interface GeoMapProps {
    query: string;
    profiles: { platform: string; username: string; notes: string }[];
}

export function GeoIntelligenceMap({ query, profiles }: GeoMapProps) {
    const [locations, setLocations] = useState<GeoLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
    const [vpnSuspicion, setVpnSuspicion] = useState(0);

    useEffect(() => {
        // Generate mock geo data based on profiles
        const hash = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

        const mockLocations: GeoLocation[] = [
            { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, confidence: 85, source: 'IP Geolocation' },
            { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, confidence: 72, source: 'Social Profile' },
            { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, confidence: 45, source: 'Timezone Analysis' },
            { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, confidence: 38, source: 'Language Hints' },
            { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, confidence: 25, source: 'Activity Pattern' },
        ];

        // Select 2-4 locations based on hash
        const count = 2 + (hash % 3);
        const shuffled = mockLocations.sort(() => (hash % 2) - 0.5);
        setLocations(shuffled.slice(0, count));
        setVpnSuspicion((hash % 60) + 10);
    }, [query, profiles]);

    // Simple world map projection
    const projectToMap = (lat: number, lng: number) => {
        const x = ((lng + 180) / 360) * 100;
        const y = ((90 - lat) / 180) * 100;
        return { x: `${x}%`, y: `${y}%` };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-gradient-to-br from-[#0a0f1a] to-[#0d1528] rounded-xl border border-white/10 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white">GEO INTELLIGENCE</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {locations.length} Locations
                    </div>
                    <div className={`flex items-center gap-1 ${vpnSuspicion > 50 ? 'text-red-400' : vpnSuspicion > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                        <Shield className="w-3 h-3" />
                        VPN: {vpnSuspicion}%
                    </div>
                </div>
            </div>

            {/* Map container */}
            <div className="relative h-[280px] p-4">
                {/* World map SVG outline */}
                <div className="absolute inset-4 opacity-30">
                    <svg viewBox="0 0 1000 500" className="w-full h-full">
                        {/* Simplified world map paths */}
                        <path
                            d="M150,150 Q200,100 280,120 T350,140 Q400,130 450,160 T520,150 L540,180 Q560,200 540,220 T520,260 L480,280 Q450,300 400,290 T320,300 L280,280 Q240,260 220,220 T180,180 Z"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1"
                            opacity="0.3"
                        />
                        <path
                            d="M550,120 Q600,100 680,110 T780,130 Q820,140 860,160 L880,200 Q900,240 880,280 T840,320 L780,340 Q720,360 660,340 T580,300 L560,260 Q540,220 560,180 T550,120 Z"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1"
                            opacity="0.3"
                        />
                        <ellipse cx="500" cy="250" rx="450" ry="200" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />
                    </svg>
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-4 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:10%_10%]" />

                {/* Location markers */}
                {locations.map((loc, i) => {
                    const pos = projectToMap(loc.lat, loc.lng);
                    const isSelected = selectedLocation?.city === loc.city;

                    return (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2, type: 'spring' }}
                            className="absolute cursor-pointer"
                            style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                            onClick={() => setSelectedLocation(isSelected ? null : loc)}
                        >
                            {/* Pulse ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: `rgba(6, 182, 212, ${loc.confidence / 200})`,
                                    width: 40 + loc.confidence / 2,
                                    height: 40 + loc.confidence / 2,
                                    marginLeft: -(20 + loc.confidence / 4),
                                    marginTop: -(20 + loc.confidence / 4)
                                }}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            />

                            {/* Main dot */}
                            <motion.div
                                className={`relative w-4 h-4 rounded-full border-2 ${isSelected ? 'bg-cyan-500 border-white' : 'bg-cyan-500/50 border-cyan-400'}`}
                                whileHover={{ scale: 1.5 }}
                                animate={isSelected ? {
                                    boxShadow: ['0 0 20px #06b6d4', '0 0 40px #06b6d4', '0 0 20px #06b6d4']
                                } : {}}
                                transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
                            />

                            {/* Tooltip */}
                            {isSelected && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute left-1/2 -translate-x-1/2 top-6 z-50 min-w-[180px] p-3 bg-black/95 border border-cyan-500/50 rounded-lg"
                                >
                                    <div className="font-bold text-cyan-400">{loc.city}, {loc.country}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        <div className="flex justify-between">
                                            <span>Confidence:</span>
                                            <span className={loc.confidence > 70 ? 'text-green-400' : loc.confidence > 40 ? 'text-yellow-400' : 'text-gray-400'}>
                                                {loc.confidence}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span>Source:</span>
                                            <span className="text-white">{loc.source}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 rounded"
                                            style={{ width: `${loc.confidence}%` }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Connection lines between markers */}
                <svg className="absolute inset-4 w-full h-full pointer-events-none">
                    {locations.slice(0, -1).map((loc, i) => {
                        const nextLoc = locations[i + 1];
                        if (!nextLoc) return null;
                        const pos1 = projectToMap(loc.lat, loc.lng);
                        const pos2 = projectToMap(nextLoc.lat, nextLoc.lng);
                        return (
                            <motion.line
                                key={i}
                                x1={pos1.x}
                                y1={pos1.y}
                                x2={pos2.x}
                                y2={pos2.y}
                                stroke="#06b6d4"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.3 }}
                                transition={{ delay: 1, duration: 1 }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between p-3 border-t border-white/10 bg-black/30 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Primary TZ: PST (UTC-8)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span>Lang: English, German</span>
                    </div>
                </div>
                {vpnSuspicion > 40 && (
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1 text-yellow-400"
                    >
                        <AlertTriangle className="w-3 h-3" />
                        VPN/Proxy Detected
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
