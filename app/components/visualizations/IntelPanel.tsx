'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github, Mail, Globe, Wifi, Shield, AlertTriangle, Server, Eye,
    Users, FileCode, Calendar, MapPin, Lock, Unlock, ChevronDown,
    ChevronRight, ExternalLink, Copy, Check, Zap, Radio
} from 'lucide-react';

interface IntelPanelProps {
    extendedIntel: {
        github?: any;
        email?: any;
        ip?: any;
        domain?: any;
        socialScan?: any;
        virusTotal?: any;
        shodan?: any;
    };
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Copy"
        >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
        </button>
    );
}

function CollapsibleSection({
    title,
    icon: Icon,
    color,
    children,
    defaultOpen = false,
    badge
}: {
    title: string;
    icon: any;
    color: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20`, border: `1px solid ${color}50` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="flex-1 text-left font-semibold text-white">{title}</span>
                {badge && (
                    <span
                        className="px-2 py-0.5 text-xs rounded-full font-medium"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        {badge}
                    </span>
                )}
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 border-t border-white/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DataRow({ label, value, copyable = false }: { label: string; value: string | number | undefined; copyable?: boolean }) {
    if (!value && value !== 0) return null;

    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-white text-sm font-mono">{value}</span>
                {copyable && typeof value === 'string' && <CopyButton text={value} />}
            </div>
        </div>
    );
}

export function GitHubIntelPanel({ data }: { data: any }) {
    if (!data?.profile) return null;

    const profile = data.profile;

    return (
        <CollapsibleSection
            title="GitHub Intelligence"
            icon={Github}
            color="#f0883e"
            defaultOpen={true}
            badge={`${data.repos?.length || 0} repos`}
        >
            <div className="space-y-4">
                {/* Profile header */}
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    {profile.avatarUrl && (
                        <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-full" />
                    )}
                    <div>
                        <div className="text-white font-bold">{profile.name || profile.username}</div>
                        <div className="text-gray-400 text-sm">@{profile.username}</div>
                        {profile.bio && <div className="text-gray-500 text-xs mt-1">{profile.bio}</div>}
                    </div>
                    <a href={profile.profileUrl} target="_blank" rel="noopener" className="ml-auto p-2 hover:bg-white/10 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Repos', value: profile.publicRepos },
                        { label: 'Gists', value: profile.publicGists },
                        { label: 'Followers', value: profile.followers },
                        { label: 'Following', value: profile.following },
                    ].map(stat => (
                        <div key={stat.label} className="text-center p-2 bg-white/5 rounded-lg">
                            <div className="text-orange-400 font-bold text-lg">{stat.value}</div>
                            <div className="text-gray-500 text-xs">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <DataRow label="Location" value={profile.location} />
                    <DataRow label="Company" value={profile.company} />
                    <DataRow label="Email" value={profile.email} copyable />
                    <DataRow label="Website" value={profile.blog} />
                    <DataRow label="Twitter" value={profile.twitterUsername ? `@${profile.twitterUsername}` : undefined} />
                    <DataRow label="Account Created" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : undefined} />
                </div>

                {/* Commit Emails (leaked) */}
                {data.commitEmails?.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-500 text-sm font-medium">Leaked Emails in Commits</span>
                        </div>
                        <div className="space-y-2">
                            {data.commitEmails.map((email: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <span className="text-yellow-300 text-sm font-mono">{email.email}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-xs">{email.repo}</span>
                                        <CopyButton text={email.email} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Topics */}
                {data.pinnedTopics?.length > 0 && (
                    <div className="mt-4">
                        <div className="text-gray-400 text-xs mb-2">TOPICS</div>
                        <div className="flex flex-wrap gap-2">
                            {data.pinnedTopics.map((topic: string) => (
                                <span key={topic} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Risk indicators */}
                {data.riskIndicators?.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Risk Indicators</span>
                        </div>
                        <div className="space-y-1">
                            {data.riskIndicators.map((indicator: string, i: number) => (
                                <div key={i} className="text-red-300/80 text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                                    {indicator}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}

export function EmailIntelPanel({ data }: { data: any }) {
    if (!data?.verification) return null;

    const { verification, breachCheck } = data;

    return (
        <CollapsibleSection
            title="Email Intelligence"
            icon={Mail}
            color="#06b6d4"
            defaultOpen={true}
            badge={breachCheck?.breached ? 'BREACHED' : 'Clean'}
        >
            <div className="space-y-4">
                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${verification.valid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {verification.valid ? '✓ Valid Format' : '✗ Invalid'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${verification.disposable ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                        {verification.disposable ? '⚠ Disposable' : '✓ Permanent'}
                    </span>
                    {verification.freeProvider && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            Free Provider
                        </span>
                    )}
                    {verification.role && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                            Role Account
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <DataRow label="Email" value={verification.email} copyable />
                    <DataRow label="Domain" value={verification.domain} />
                    <DataRow label="Quality Score" value={`${verification.score}/100`} />
                </div>

                {/* Breach info */}
                {breachCheck?.breached && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-bold">Data Breach Detected!</span>
                        </div>

                        {breachCheck.sources?.length > 0 && (
                            <div className="mb-3">
                                <div className="text-gray-400 text-xs mb-2">BREACH SOURCES</div>
                                <div className="flex flex-wrap gap-2">
                                    {breachCheck.sources.map((source: string) => (
                                        <span key={source} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {breachCheck.exposedData?.length > 0 && (
                            <div>
                                <div className="text-gray-400 text-xs mb-2">EXPOSED DATA TYPES</div>
                                <div className="flex flex-wrap gap-2">
                                    {breachCheck.exposedData.map((type: string) => (
                                        <span key={type} className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}

export function IPIntelPanel({ data }: { data: any }) {
    if (!data) return null;

    const riskColor = data.riskLevel === 'critical' ? '#ef4444' :
        data.riskLevel === 'high' ? '#f97316' :
            data.riskLevel === 'medium' ? '#eab308' : '#22c55e';

    return (
        <CollapsibleSection
            title="IP Intelligence"
            icon={Wifi}
            color="#8b5cf6"
            defaultOpen={true}
            badge={data.riskLevel?.toUpperCase()}
        >
            <div className="space-y-4">
                {/* Location map placeholder */}
                <div className="h-32 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                        <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-white font-bold">{data.city}, {data.country}</div>
                        <div className="text-gray-400 text-sm">{data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}</div>
                    </div>
                </div>

                {/* Threat indicators */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'VPN', active: data.isVPN, icon: Shield },
                        { label: 'Proxy', active: data.isProxy, icon: Server },
                        { label: 'Tor', active: data.isTor, icon: Eye },
                        { label: 'Datacenter', active: data.isDatacenter, icon: Server },
                    ].map(item => (
                        <div
                            key={item.label}
                            className={`text-center p-2 rounded-lg border ${item.active
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-white/5 border-white/10 text-gray-500'
                                }`}
                        >
                            <item.icon className="w-4 h-4 mx-auto mb-1" />
                            <div className="text-xs">{item.label}</div>
                            <div className="text-[10px] font-bold">{item.active ? 'YES' : 'NO'}</div>
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <DataRow label="IP Address" value={data.ip} copyable />
                    <DataRow label="ISP" value={data.isp} />
                    <DataRow label="Organization" value={data.organization} />
                    <DataRow label="ASN" value={data.asn} />
                    <DataRow label="Timezone" value={data.timezone} />
                    <DataRow label="Risk Score" value={`${data.riskScore}/100`} />
                </div>
            </div>
        </CollapsibleSection>
    );
}

export function DomainIntelPanel({ data }: { data: any }) {
    if (!data) return null;

    return (
        <CollapsibleSection
            title="Domain / WHOIS Intelligence"
            icon={Globe}
            color="#22c55e"
            defaultOpen={true}
            badge={data.whois?.isNewDomain ? 'NEW' : undefined}
        >
            <div className="space-y-4">
                {data.whois && (
                    <>
                        <div className="text-gray-400 text-xs mb-2">REGISTRATION INFO</div>
                        <div className="space-y-1">
                            <DataRow label="Domain" value={data.whois.domain} copyable />
                            <DataRow label="Registrar" value={data.whois.registrar} />
                            <DataRow label="Created" value={data.whois.creationDate ? new Date(data.whois.creationDate).toLocaleDateString() : undefined} />
                            <DataRow label="Expires" value={data.whois.expirationDate ? new Date(data.whois.expirationDate).toLocaleDateString() : undefined} />
                            <DataRow label="Age" value={data.whois.ageInDays ? `${data.whois.ageInDays} days` : undefined} />
                            <DataRow label="DNSSEC" value={data.whois.dnssec ? 'Enabled' : 'Disabled'} />
                            <DataRow label="Country" value={data.whois.registrantCountry} />
                            <DataRow label="Organization" value={data.whois.registrantOrg} />
                        </div>
                    </>
                )}

                {data.dns && (
                    <>
                        <div className="text-gray-400 text-xs mt-4 mb-2">DNS RECORDS</div>
                        {data.dns.a?.length > 0 && (
                            <div className="mb-2">
                                <span className="text-xs text-gray-500">A Records:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.dns.a.map((ip: string) => (
                                        <span key={ip} className="px-2 py-0.5 bg-white/5 text-white text-xs font-mono rounded">
                                            {ip}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.dns.mx?.length > 0 && (
                            <div className="mb-2">
                                <span className="text-xs text-gray-500">MX Records:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.dns.mx.map((mx: any) => (
                                        <span key={mx.host} className="px-2 py-0.5 bg-white/5 text-white text-xs font-mono rounded">
                                            {mx.host}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.dns.ns?.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-500">Nameservers:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.dns.ns.map((ns: string) => (
                                        <span key={ns} className="px-2 py-0.5 bg-white/5 text-white text-xs font-mono rounded">
                                            {ns}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {data.technologies?.length > 0 && (
                    <div className="mt-4">
                        <div className="text-gray-400 text-xs mb-2">DETECTED TECHNOLOGIES</div>
                        <div className="flex flex-wrap gap-2">
                            {data.technologies.map((tech: string) => (
                                <span key={tech} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {data.riskIndicators?.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-500 text-sm font-medium">Risk Indicators</span>
                        </div>
                        <div className="space-y-1">
                            {data.riskIndicators.map((indicator: string, i: number) => (
                                <div key={i} className="text-yellow-300/80 text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                                    {indicator}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}

export function VirusTotalPanel({ data }: { data: any }) {
    if (!data) return null;

    const riskColor = data.riskLevel === 'malicious' ? '#ef4444' :
        data.riskLevel === 'suspicious' ? '#f97316' : '#22c55e';

    return (
        <CollapsibleSection
            title="VirusTotal Analysis"
            icon={Shield}
            color={riskColor}
            defaultOpen={true}
            badge={`${data.positives}/${data.total}`}
        >
            <div className="space-y-4">
                {/* Detection meter */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${riskColor}10` }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">Detection Rate</span>
                        <span className="text-2xl font-bold" style={{ color: riskColor }}>
                            {data.positives}/{data.total}
                        </span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${(data.positives / Math.max(data.total, 1)) * 100}%`,
                                backgroundColor: riskColor
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <DataRow label="Resource" value={data.resource} copyable />
                    <DataRow label="Type" value={data.resourceType?.toUpperCase()} />
                    <DataRow label="Risk Level" value={data.riskLevel?.toUpperCase()} />
                    <DataRow label="Reputation" value={data.reputation} />
                    <DataRow label="Last Scan" value={data.scanDate ? new Date(data.scanDate).toLocaleString() : undefined} />
                </div>

                {data.threatNames?.length > 0 && (
                    <div className="mt-4">
                        <div className="text-gray-400 text-xs mb-2">THREAT DETECTIONS</div>
                        <div className="flex flex-wrap gap-2">
                            {data.threatNames.slice(0, 10).map((name: string) => (
                                <span key={name} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {data.categories?.length > 0 && (
                    <div className="mt-4">
                        <div className="text-gray-400 text-xs mb-2">CATEGORIES</div>
                        <div className="flex flex-wrap gap-2">
                            {data.categories.map((cat: string) => (
                                <span key={cat} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <a
                    href={data.permalink}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-center gap-2 mt-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                >
                    View on VirusTotal <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </CollapsibleSection>
    );
}

export function ShodanPanel({ data }: { data: any }) {
    if (!data) return null;

    // Check if it's a host result or domain result
    const isHost = 'ports' in data;

    if (isHost) {
        const riskColor = data.riskLevel === 'critical' ? '#ef4444' :
            data.riskLevel === 'high' ? '#f97316' :
                data.riskLevel === 'medium' ? '#eab308' : '#22c55e';

        return (
            <CollapsibleSection
                title="Shodan Intelligence"
                icon={Radio}
                color="#ec4899"
                defaultOpen={true}
                badge={`${data.ports?.length || 0} ports`}
            >
                <div className="space-y-4">
                    {/* Location */}
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-pink-400" />
                            <span className="text-white">{data.city}, {data.country}</span>
                        </div>
                        <div className="text-gray-500 text-sm">{data.organization}</div>
                    </div>

                    {/* Open ports */}
                    {data.ports?.length > 0 && (
                        <div>
                            <div className="text-gray-400 text-xs mb-2">OPEN PORTS ({data.ports.length})</div>
                            <div className="flex flex-wrap gap-2">
                                {data.ports.map((port: number) => (
                                    <span
                                        key={port}
                                        className={`px-2 py-1 text-xs rounded font-mono ${[21, 22, 23, 445, 3389].includes(port)
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-white/10 text-white'
                                            }`}
                                    >
                                        {port}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vulnerabilities */}
                    {data.vulns?.length > 0 && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <span className="text-red-400 font-bold">Vulnerabilities ({data.vulns.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.vulns.slice(0, 10).map((vuln: string) => (
                                    <a
                                        key={vuln}
                                        href={`https://nvd.nist.gov/vuln/detail/${vuln}`}
                                        target="_blank"
                                        rel="noopener"
                                        className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded hover:bg-red-500/30 transition-colors"
                                    >
                                        {vuln}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {data.services?.length > 0 && (
                        <div>
                            <div className="text-gray-400 text-xs mb-2">SERVICES</div>
                            <div className="space-y-2">
                                {data.services.slice(0, 5).map((svc: any, i: number) => (
                                    <div key={i} className="p-2 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-mono">Port {svc.port}/{svc.transport}</span>
                                            <span className="text-pink-400 text-sm">{svc.product || svc.module}</span>
                                        </div>
                                        {svc.version && (
                                            <div className="text-gray-500 text-xs mt-1">Version: {svc.version}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <DataRow label="IP" value={data.ip} copyable />
                        <DataRow label="ISP" value={data.isp} />
                        <DataRow label="ASN" value={data.asn} />
                        <DataRow label="OS" value={data.os} />
                        <DataRow label="Risk Score" value={`${data.riskScore}/100`} />
                    </div>
                </div>
            </CollapsibleSection>
        );
    }

    // Domain result
    return (
        <CollapsibleSection
            title="Shodan Domain Intelligence"
            icon={Radio}
            color="#ec4899"
            defaultOpen={true}
            badge={`${data.subdomains?.length || 0} subdomains`}
        >
            <div className="space-y-4">
                <DataRow label="Domain" value={data.domain} copyable />

                {data.subdomains?.length > 0 && (
                    <div>
                        <div className="text-gray-400 text-xs mb-2">SUBDOMAINS</div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {data.subdomains.map((sub: string) => (
                                <div key={sub} className="text-white text-sm font-mono p-1 bg-white/5 rounded">
                                    {sub}.{data.domain}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.ips?.length > 0 && (
                    <div>
                        <div className="text-gray-400 text-xs mb-2">ASSOCIATED IPs</div>
                        <div className="flex flex-wrap gap-2">
                            {data.ips.map((ip: string) => (
                                <span key={ip} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded font-mono">
                                    {ip}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}

export function SocialScanPanel({ data }: { data: any }) {
    if (!data?.profiles) return null;

    const foundProfiles = data.profiles.filter((p: any) => p.exists);
    const notFoundProfiles = data.profiles.filter((p: any) => !p.exists);

    return (
        <CollapsibleSection
            title="Social Profile Scanner"
            icon={Users}
            color="#3b82f6"
            defaultOpen={true}
            badge={`${data.totalFound}/${data.totalChecked}`}
        >
            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-green-400 font-bold text-xl">{data.totalFound}</div>
                        <div className="text-gray-500 text-xs">Found</div>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-red-400 font-bold text-xl">{data.totalChecked - data.totalFound}</div>
                        <div className="text-gray-500 text-xs">Not Found</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-blue-400 font-bold text-xl">{data.scanTime}ms</div>
                        <div className="text-gray-500 text-xs">Scan Time</div>
                    </div>
                </div>

                {/* Found profiles */}
                {foundProfiles.length > 0 && (
                    <div>
                        <div className="text-gray-400 text-xs mb-2">PROFILES FOUND</div>
                        <div className="space-y-2">
                            {foundProfiles.map((profile: any) => (
                                <a
                                    key={profile.platform}
                                    href={profile.url}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {profile.avatarUrl && (
                                            <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                        )}
                                        <div>
                                            <div className="text-white font-medium">{profile.platform}</div>
                                            <div className="text-gray-400 text-xs">@{profile.username}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 text-xs">{profile.responseTime}ms</span>
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Not found (collapsed) */}
                {notFoundProfiles.length > 0 && (
                    <details className="group">
                        <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-400">
                            Show {notFoundProfiles.length} platforms not found
                        </summary>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {notFoundProfiles.map((profile: any) => (
                                <span key={profile.platform} className="px-2 py-1 bg-white/5 text-gray-500 text-xs rounded">
                                    {profile.platform}
                                </span>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </CollapsibleSection>
    );
}

// Main Intel Panel
export function IntelPanel({ extendedIntel }: IntelPanelProps) {
    if (!extendedIntel) return null;

    const hasAnyData = Object.values(extendedIntel).some(v => v !== null && v !== undefined);

    if (!hasAnyData) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Extended Intelligence</h2>
                    <p className="text-gray-500 text-sm">Real-time OSINT data from multiple sources</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {extendedIntel.github && <GitHubIntelPanel data={extendedIntel.github} />}
                {extendedIntel.email && <EmailIntelPanel data={extendedIntel.email} />}
                {extendedIntel.ip && <IPIntelPanel data={extendedIntel.ip} />}
                {extendedIntel.domain && <DomainIntelPanel data={extendedIntel.domain} />}
                {extendedIntel.virusTotal && <VirusTotalPanel data={extendedIntel.virusTotal} />}
                {extendedIntel.shodan && <ShodanPanel data={extendedIntel.shodan} />}
                {extendedIntel.socialScan && <SocialScanPanel data={extendedIntel.socialScan} />}
            </div>
        </motion.div>
    );
}
