/**
 * VirusTotal Intelligence Module
 * Check URLs, domains, IPs, and file hashes for malicious indicators
 */

export interface VirusTotalResult {
    resource: string;
    resourceType: 'url' | 'domain' | 'ip' | 'hash';
    detected: boolean;
    positives: number;
    total: number;
    scanDate: string;
    permalink: string;
    threatNames: string[];
    categories: string[];
    reputation: number;
    riskLevel: 'clean' | 'suspicious' | 'malicious';
}

const VT_API_BASE = 'https://www.virustotal.com/api/v3';

async function fetchVirusTotal(endpoint: string): Promise<any> {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) {
        console.log('VirusTotal API key not configured');
        return null;
    }

    try {
        const response = await fetch(`${VT_API_BASE}${endpoint}`, {
            headers: {
                'x-apikey': apiKey,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`VirusTotal API error: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('VirusTotal API fetch error:', error);
        return null;
    }
}

export async function checkDomain(domain: string): Promise<VirusTotalResult | null> {
    const data = await fetchVirusTotal(`/domains/${encodeURIComponent(domain)}`);

    if (!data?.data) return null;

    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || {};
    const positives = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;

    return {
        resource: domain,
        resourceType: 'domain',
        detected: positives > 0,
        positives,
        total,
        scanDate: new Date(attributes.last_analysis_date * 1000).toISOString(),
        permalink: `https://www.virustotal.com/gui/domain/${domain}`,
        threatNames: [],
        categories: Object.values(attributes.categories || {}) as string[],
        reputation: attributes.reputation || 0,
        riskLevel: positives > 5 ? 'malicious' : positives > 0 ? 'suspicious' : 'clean'
    };
}

export async function checkIP(ip: string): Promise<VirusTotalResult | null> {
    const data = await fetchVirusTotal(`/ip_addresses/${encodeURIComponent(ip)}`);

    if (!data?.data) return null;

    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || {};
    const positives = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;

    return {
        resource: ip,
        resourceType: 'ip',
        detected: positives > 0,
        positives,
        total,
        scanDate: new Date(attributes.last_analysis_date * 1000).toISOString(),
        permalink: `https://www.virustotal.com/gui/ip-address/${ip}`,
        threatNames: [],
        categories: [],
        reputation: attributes.reputation || 0,
        riskLevel: positives > 5 ? 'malicious' : positives > 0 ? 'suspicious' : 'clean'
    };
}

export async function checkURL(url: string): Promise<VirusTotalResult | null> {
    // URL ID is base64(url) without padding
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
    const data = await fetchVirusTotal(`/urls/${urlId}`);

    if (!data?.data) {
        // URL not in database, need to submit for scanning
        return null;
    }

    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || {};
    const positives = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;

    return {
        resource: url,
        resourceType: 'url',
        detected: positives > 0,
        positives,
        total,
        scanDate: attributes.last_analysis_date ? new Date(attributes.last_analysis_date * 1000).toISOString() : new Date().toISOString(),
        permalink: `https://www.virustotal.com/gui/url/${urlId}`,
        threatNames: Object.keys(attributes.last_analysis_results || {}).filter(
            (engine: string) => attributes.last_analysis_results[engine].category === 'malicious'
        ),
        categories: Object.values(attributes.categories || {}) as string[],
        reputation: attributes.reputation || 0,
        riskLevel: positives > 5 ? 'malicious' : positives > 0 ? 'suspicious' : 'clean'
    };
}

export async function checkHash(hash: string): Promise<VirusTotalResult | null> {
    const data = await fetchVirusTotal(`/files/${encodeURIComponent(hash)}`);

    if (!data?.data) return null;

    const attributes = data.data.attributes;
    const stats = attributes.last_analysis_stats || {};
    const positives = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;

    return {
        resource: hash,
        resourceType: 'hash',
        detected: positives > 0,
        positives,
        total,
        scanDate: new Date(attributes.last_analysis_date * 1000).toISOString(),
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
        threatNames: attributes.popular_threat_classification?.suggested_threat_label ?
            [attributes.popular_threat_classification.suggested_threat_label] : [],
        categories: attributes.type_tags || [],
        reputation: attributes.reputation || 0,
        riskLevel: positives > 10 ? 'malicious' : positives > 0 ? 'suspicious' : 'clean'
    };
}

// Combined check based on input type detection
export async function analyzeWithVirusTotal(input: string): Promise<VirusTotalResult | null> {
    // Detect input type
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    const urlRegex = /^https?:\/\//;
    const hashRegex = /^[a-fA-F0-9]{32,64}$/;

    if (ipRegex.test(input)) {
        return checkIP(input);
    } else if (urlRegex.test(input)) {
        return checkURL(input);
    } else if (hashRegex.test(input)) {
        return checkHash(input);
    } else if (domainRegex.test(input)) {
        return checkDomain(input);
    }

    return null;
}
