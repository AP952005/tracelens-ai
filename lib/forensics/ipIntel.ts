/**
 * IP Geolocation + VPN Detection Module
 * Real IP intelligence with VPN/proxy detection
 */

export interface IPGeolocation {
    ip: string;
    city: string | null;
    region: string | null;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    timezone: string | null;
    isp: string | null;
    organization: string | null;
    asn: string | null;
    asnName: string | null;
    isVPN: boolean;
    isProxy: boolean;
    isTor: boolean;
    isDatacenter: boolean;
    isHosting: boolean;
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Known VPN/Proxy ASNs
const VPN_ASNS = new Set([
    'AS9009',   // M247
    'AS16276', // OVH
    'AS14061', // DigitalOcean
    'AS63949', // Linode
    'AS16509', // Amazon AWS
    'AS15169', // Google Cloud
    'AS8075',  // Microsoft Azure
    'AS13335', // Cloudflare
    'AS20473', // Vultr
    'AS46562', // Performive
]);

// Known Tor exit node ASNs
const TOR_ASNS = new Set([
    'AS24940', 'AS51167', 'AS60729'
]);

export async function getIPGeolocation(ip: string): Promise<IPGeolocation | null> {
    // Try ipinfo.io first
    const ipinfoToken = process.env.IPINFO_TOKEN;

    if (ipinfoToken) {
        try {
            const response = await fetch(`https://ipinfo.io/${ip}?token=${ipinfoToken}`);
            if (response.ok) {
                const data = await response.json();
                return parseIPInfoResponse(data, ip);
            }
        } catch (error) {
            console.error('ipinfo.io error:', error);
        }
    }

    // Fallback to ipapi.co (free, no key needed)
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (response.ok) {
            const data = await response.json();
            if (!data.error) {
                return parseIPAPIResponse(data, ip);
            }
        }
    } catch (error) {
        console.error('ipapi.co error:', error);
    }

    // Fallback to ip-api.com (free)
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=66846719`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                return parseIPAPIComResponse(data, ip);
            }
        }
    } catch (error) {
        console.error('ip-api.com error:', error);
    }

    return null;
}

function parseIPInfoResponse(data: any, ip: string): IPGeolocation {
    const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
    const org = data.org || '';
    const asn = org.split(' ')[0] || '';

    const isVPN = VPN_ASNS.has(asn) || (data.privacy?.vpn === true);
    const isProxy = data.privacy?.proxy === true;
    const isTor = TOR_ASNS.has(asn) || (data.privacy?.tor === true);
    const isHosting = data.privacy?.hosting === true;

    const riskScore = calculateRiskScore(isVPN, isProxy, isTor, isHosting);

    return {
        ip,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.country,
        latitude: lat,
        longitude: lon,
        timezone: data.timezone,
        isp: org.split(' ').slice(1).join(' ') || null,
        organization: data.company?.name || null,
        asn,
        asnName: org.split(' ').slice(1).join(' ') || null,
        isVPN,
        isProxy,
        isTor,
        isDatacenter: isHosting,
        isHosting,
        riskScore,
        riskLevel: getRiskLevel(riskScore)
    };
}

function parseIPAPIResponse(data: any, ip: string): IPGeolocation {
    const asn = data.asn ? `AS${data.asn}` : '';
    const isVPN = VPN_ASNS.has(asn);
    const isTor = TOR_ASNS.has(asn);
    const isHosting = isVPN || isTor;

    const riskScore = calculateRiskScore(isVPN, false, isTor, isHosting);

    return {
        ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        organization: data.org,
        asn,
        asnName: data.org,
        isVPN,
        isProxy: false,
        isTor,
        isDatacenter: isHosting,
        isHosting,
        riskScore,
        riskLevel: getRiskLevel(riskScore)
    };
}

function parseIPAPIComResponse(data: any, ip: string): IPGeolocation {
    const asn = data.as ? data.as.split(' ')[0] : '';
    const isVPN = VPN_ASNS.has(asn) || data.hosting;
    const isTor = TOR_ASNS.has(asn);
    const isProxy = data.proxy;

    const riskScore = calculateRiskScore(isVPN, isProxy, isTor, data.hosting);

    return {
        ip,
        city: data.city,
        region: data.regionName,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        organization: data.org,
        asn,
        asnName: data.as ? data.as.split(' ').slice(1).join(' ') : null,
        isVPN,
        isProxy,
        isTor,
        isDatacenter: data.hosting,
        isHosting: data.hosting,
        riskScore,
        riskLevel: getRiskLevel(riskScore)
    };
}

function calculateRiskScore(isVPN: boolean, isProxy: boolean, isTor: boolean, isHosting: boolean): number {
    let score = 0;
    if (isTor) score += 50;
    if (isVPN) score += 30;
    if (isProxy) score += 25;
    if (isHosting) score += 15;
    return Math.min(100, score);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
}

// Get current public IP (useful for self-check)
export async function getPublicIP(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const data = await response.json();
            return data.ip;
        }
    } catch (error) {
        console.error('ipify error:', error);
    }
    return null;
}
