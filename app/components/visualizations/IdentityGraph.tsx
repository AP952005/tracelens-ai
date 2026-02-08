'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Linkedin, Globe, Database, Instagram, Twitter, Facebook, AlertTriangle } from 'lucide-react';

interface GraphNode {
    id: string;
    label: string;
    type: 'identity' | 'social' | 'email' | 'breach' | 'alias';
    x: number;
    y: number;
    color: string;
    icon: React.ReactNode;
}

interface GraphEdge {
    source: string;
    target: string;
    label?: string;
}

interface IdentityGraphProps {
    query: string;
    profiles: { platform: string; username: string }[];
    breaches: { domain: string }[];
}

export function IdentityLinkGraph({ query, profiles, breaches }: IdentityGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [animationPhase, setAnimationPhase] = useState(0);

    const getIconForPlatform = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('github')) return <Github className="w-4 h-4" />;
        if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
        if (p.includes('twitter')) return <Twitter className="w-4 h-4" />;
        if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
        if (p.includes('email') || p.includes('gmail')) return <Mail className="w-4 h-4" />;
        return <Globe className="w-4 h-4" />;
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'identity': return '#06b6d4';
            case 'social': return '#8b5cf6';
            case 'email': return '#22c55e';
            case 'breach': return '#ef4444';
            case 'alias': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    useEffect(() => {
        // Build graph data
        const graphNodes: GraphNode[] = [];
        const graphEdges: GraphEdge[] = [];
        const centerX = 200;
        const centerY = 150;

        // Central identity node
        graphNodes.push({
            id: 'identity',
            label: query,
            type: 'identity',
            x: centerX,
            y: centerY,
            color: getColorForType('identity'),
            icon: <User className="w-5 h-5" />
        });

        // Email node (derived from query if it looks like email)
        const emailLabel = query.includes('@') ? query : `${query}@email.com`;
        graphNodes.push({
            id: 'email',
            label: emailLabel,
            type: 'email',
            x: centerX - 120,
            y: centerY - 80,
            color: getColorForType('email'),
            icon: <Mail className="w-4 h-4" />
        });
        graphEdges.push({ source: 'identity', target: 'email', label: 'owns' });

        // Social profile nodes in a circle
        profiles.slice(0, 6).forEach((profile, i) => {
            const angle = (i / Math.min(profiles.length, 6)) * Math.PI * 2 - Math.PI / 2;
            const radius = 120;
            graphNodes.push({
                id: `social-${i}`,
                label: `@${profile.username}`,
                type: 'social',
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                color: getColorForType('social'),
                icon: getIconForPlatform(profile.platform)
            });
            graphEdges.push({ source: 'identity', target: `social-${i}`, label: 'uses' });
        });

        // Breach nodes
        breaches.slice(0, 4).forEach((breach, i) => {
            const angle = (i / Math.min(breaches.length, 4)) * Math.PI + Math.PI;
            const radius = 160;
            graphNodes.push({
                id: `breach-${i}`,
                label: breach.domain,
                type: 'breach',
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius + 40,
                color: getColorForType('breach'),
                icon: <Database className="w-4 h-4" />
            });
            graphEdges.push({ source: 'email', target: `breach-${i}`, label: 'leaked' });
        });

        // Alias variations
        const aliases = generateAliases(query);
        aliases.slice(0, 3).forEach((alias, i) => {
            graphNodes.push({
                id: `alias-${i}`,
                label: alias,
                type: 'alias',
                x: centerX + 140 + i * 20,
                y: centerY - 60 + i * 40,
                color: getColorForType('alias'),
                icon: <AlertTriangle className="w-4 h-4" />
            });
            graphEdges.push({ source: 'identity', target: `alias-${i}`, label: 'variant' });
        });

        setNodes(graphNodes);
        setEdges(graphEdges);

        // Animate nodes appearing one by one
        const timer = setInterval(() => {
            setAnimationPhase(p => {
                if (p >= graphNodes.length) {
                    clearInterval(timer);
                    return p;
                }
                return p + 1;
            });
        }, 200);

        return () => clearInterval(timer);
    }, [query, profiles, breaches]);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-[350px] bg-gradient-to-br from-[#0a0f1a] to-[#0d1528] rounded-xl border border-white/10 overflow-hidden"
        >
            {/* Animated background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" opacity="0.5" />
                    </marker>
                </defs>
                {edges.map((edge, i) => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const sourceIndex = nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = nodes.findIndex(n => n.id === edge.target);
                    const isVisible = animationPhase > Math.max(sourceIndex, targetIndex);

                    return (
                        <motion.line
                            key={i}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={hoveredNode === edge.source || hoveredNode === edge.target ? '#06b6d4' : '#ffffff20'}
                            strokeWidth={hoveredNode === edge.source || hoveredNode === edge.target ? 2 : 1}
                            strokeDasharray={hoveredNode === edge.source || hoveredNode === edge.target ? '0' : '5,5'}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: isVisible ? 1 : 0,
                                opacity: isVisible ? 1 : 0
                            }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
                const isVisible = animationPhase > i;
                const isHovered = hoveredNode === node.id;
                const isConnected = edges.some(e =>
                    (e.source === hoveredNode && e.target === node.id) ||
                    (e.target === hoveredNode && e.source === node.id)
                );

                return (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: isVisible ? 1 : 0,
                            opacity: isVisible ? 1 : 0
                        }}
                        whileHover={{ scale: 1.2, zIndex: 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`absolute cursor-pointer transition-all duration-300`}
                        style={{
                            left: node.x - (node.type === 'identity' ? 30 : 20),
                            top: node.y - (node.type === 'identity' ? 30 : 20)
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <motion.div
                            className={`
                                relative flex items-center justify-center
                                ${node.type === 'identity' ? 'w-[60px] h-[60px]' : 'w-[40px] h-[40px]'}
                                rounded-full border-2
                                ${isHovered || isConnected ? 'z-50' : 'z-10'}
                            `}
                            style={{
                                backgroundColor: `${node.color}20`,
                                borderColor: isHovered || isConnected ? node.color : `${node.color}50`,
                                boxShadow: isHovered ? `0 0 30px ${node.color}50` : 'none'
                            }}
                            animate={isHovered ? {
                                boxShadow: [
                                    `0 0 20px ${node.color}30`,
                                    `0 0 40px ${node.color}50`,
                                    `0 0 20px ${node.color}30`
                                ]
                            } : {}}
                            transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                        >
                            <div style={{ color: node.color }}>
                                {node.icon}
                            </div>
                        </motion.div>

                        {/* Label tooltip */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 border border-white/20 rounded-lg whitespace-nowrap z-50"
                        >
                            <div className="text-xs font-bold" style={{ color: node.color }}>
                                {node.type.toUpperCase()}
                            </div>
                            <div className="text-xs text-white">{node.label}</div>
                        </motion.div>
                    </motion.div>
                );
            })}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex gap-3 text-xs">
                {[
                    { type: 'identity', label: 'Identity' },
                    { type: 'social', label: 'Social' },
                    { type: 'breach', label: 'Breach' },
                    { type: 'alias', label: 'Alias' }
                ].map(item => (
                    <div key={item.type} className="flex items-center gap-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getColorForType(item.type) }}
                        />
                        <span className="text-gray-500">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Title */}
            <div className="absolute top-3 left-3 text-xs text-gray-500 font-mono">
                IDENTITY LINK GRAPH
            </div>
        </motion.div>
    );
}

function generateAliases(username: string): string[] {
    const base = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
        base.replace(/o/g, '0').replace(/i/g, '1'),
        base + '99',
        base.replace(/a/g, '4').replace(/e/g, '3'),
    ].filter(a => a !== base);
}
