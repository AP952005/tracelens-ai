/**
 * Shodan Intelligence Module
 * Exposed devices, open ports, and vulnerability scanning
 */

export interface ShodanHostResult {
    ip: string;
    hostname: string[];
    organization: string;
    isp: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    asn: string;
    os: string | null;
    ports: number[];
    vulns: string[];
    services: ShodanService[];
    lastUpdate: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ShodanService {
    port: number;
    transport: 'tcp' | 'udp';
    product: string | null;
    version: string | null;
    banner: string;
    module: string;
    cpe: string[];
}

export interface ShodanSearchResult {
    total: number;
    results: ShodanHostResult[];
    query: string;
}

export interface ShodanDomainResult {
    domain: string;
    subdomains: string[];
    records: {
        type: string;
        value: string;
        subdomain: string;
    }[];
    ips: string[];
}

const SHODAN_API_BASE = 'https://api.shodan.io';

async function fetchShodan(endpoint: string): Promise<any> {
    const apiKey = process.env.SHODAN_API_KEY;

    if (!apiKey) {
        console.log('Shodan API key not configured');
        return null;
    }

    try {
        const url = `${SHODAN_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Shodan API error: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Shodan API fetch error:', error);
        return null;
    }
}

// Known critical vulnerabilities
const CRITICAL_VULNS = new Set([
    'CVE-2021-44228', // Log4Shell
    'CVE-2021-26855', // ProxyLogon
    'CVE-2020-1472',  // Zerologon
    'CVE-2019-0708',  // BlueKeep
    'CVE-2017-0144',  // EternalBlue
    'CVE-2014-0160',  // Heartbleed
    'CVE-2021-34527', // PrintNightmare
    'CVE-2022-30190', // Follina
    'CVE-2021-21972', // vCenter RCE
    'CVE-2021-22005', // vCenter File Upload
]);

// Critical open ports
const CRITICAL_PORTS = new Set([
    21,    // FTP
    22,    // SSH
    23,    // Telnet
    25,    // SMTP
    53,    // DNS
    110,   // POP3
    135,   // RPC
    139,   // NetBIOS
    143,   // IMAP
    445,   // SMB
    1433,  // MSSQL
    1521,  // Oracle
    3306,  // MySQL
    3389,  // RDP
    5432,  // PostgreSQL
    5900,  // VNC
    6379,  // Redis
    8080,  // HTTP Alt
    9200,  // Elasticsearch
    27017, // MongoDB
]);

function calculateRiskScore(host: any): number {
    let score = 0;

    // Vulnerabilities
    if (host.vulns && Array.isArray(host.vulns)) {
        score += host.vulns.length * 10;
        // Critical vulns add more
        for (const vuln of host.vulns) {
            if (CRITICAL_VULNS.has(vuln)) {
                score += 25;
            }
        }
    }

    // Open ports
    if (host.ports && Array.isArray(host.ports)) {
        for (const port of host.ports) {
            if (CRITICAL_PORTS.has(port)) {
                score += 5;
            }
        }
        // Many open ports = higher risk
        if (host.ports.length > 10) score += 10;
        if (host.ports.length > 20) score += 10;
    }

    // Exposed services
    if (host.data && Array.isArray(host.data)) {
        for (const service of host.data) {
            // Check for default credentials indicators
            const banner = (service.data || '').toLowerCase();
            if (banner.includes('default') || banner.includes('test') || banner.includes('admin')) {
                score += 10;
            }
            // Outdated software
            if (service.product && service.version) {
                // Generic check for old versions
                const version = parseFloat(service.version);
                if (!isNaN(version) && version < 2) {
                    score += 5;
                }
            }
        }
    }

    return Math.min(100, score);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
}

export async function lookupIP(ip: string): Promise<ShodanHostResult | null> {
    const data = await fetchShodan(`/shodan/host/${ip}`);

    if (!data) return null;

    const riskScore = calculateRiskScore(data);

    const services: ShodanService[] = (data.data || []).map((s: any) => ({
        port: s.port,
        transport: s.transport || 'tcp',
        product: s.product,
        version: s.version,
        banner: (s.data || '').substring(0, 500),
        module: s._shodan?.module || 'unknown',
        cpe: s.cpe || []
    }));

    return {
        ip: data.ip_str,
        hostname: data.hostnames || [],
        organization: data.org || '',
        isp: data.isp || '',
        country: data.country_name || '',
        city: data.city || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        asn: data.asn || '',
        os: data.os,
        ports: data.ports || [],
        vulns: data.vulns || [],
        services,
        lastUpdate: data.last_update || '',
        riskScore,
        riskLevel: getRiskLevel(riskScore)
    };
}

export async function searchShodan(query: string): Promise<ShodanSearchResult | null> {
    const data = await fetchShodan(`/shodan/host/search?query=${encodeURIComponent(query)}`);

    if (!data) return null;

    const results: ShodanHostResult[] = (data.matches || []).slice(0, 10).map((match: any) => {
        const host = {
            ...match,
            data: [match], // Wrap single match as data array for risk calc
            ports: [match.port]
        };
        const riskScore = calculateRiskScore(host);

        return {
            ip: match.ip_str,
            hostname: [match.hostnames?.[0] || ''].filter(Boolean),
            organization: match.org || '',
            isp: match.isp || '',
            country: match.location?.country_name || '',
            city: match.location?.city || '',
            latitude: match.location?.latitude || 0,
            longitude: match.location?.longitude || 0,
            asn: match.asn || '',
            os: match.os,
            ports: [match.port],
            vulns: match.vulns || [],
            services: [{
                port: match.port,
                transport: match.transport || 'tcp',
                product: match.product,
                version: match.version,
                banner: (match.data || '').substring(0, 200),
                module: match._shodan?.module || 'unknown',
                cpe: match.cpe || []
            }],
            lastUpdate: match.timestamp || '',
            riskScore,
            riskLevel: getRiskLevel(riskScore)
        };
    });

    return {
        total: data.total || 0,
        results,
        query
    };
}

export async function lookupDomain(domain: string): Promise<ShodanDomainResult | null> {
    const data = await fetchShodan(`/dns/domain/${domain}`);

    if (!data) return null;

    const records = (data.data || []).map((r: any) => ({
        type: r.type,
        value: r.value,
        subdomain: r.subdomain || ''
    }));

    const ips = new Set<string>();
    records.forEach((r: any) => {
        if (r.type === 'A' || r.type === 'AAAA') {
            ips.add(r.value);
        }
    });

    return {
        domain,
        subdomains: data.subdomains || [],
        records,
        ips: [...ips]
    };
}

// Honeypot check - estimates if an IP is a honeypot
export async function isHoneypot(ip: string): Promise<{ isHoneypot: boolean; score: number }> {
    const data = await fetchShodan(`/labs/honeyscore/${ip}`);

    if (data === null) {
        return { isHoneypot: false, score: 0 };
    }

    const score = typeof data === 'number' ? data : 0;
    return {
        isHoneypot: score > 0.5,
        score
    };
}

// Check account info/credits
export async function getAccountInfo(): Promise<{ credits: number; plan: string } | null> {
    const data = await fetchShodan('/api-info');

    if (!data) return null;

    return {
        credits: data.query_credits || 0,
        plan: data.plan || 'unknown'
    };
}
