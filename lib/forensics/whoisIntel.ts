/**
 * WHOIS + Domain Intelligence Module
 * Domain registration data, DNS records, and ownership information
 */

export interface WHOISData {
    domain: string;
    registrar: string | null;
    registrarUrl: string | null;
    creationDate: string | null;
    expirationDate: string | null;
    updatedDate: string | null;
    nameServers: string[];
    status: string[];
    registrantCountry: string | null;
    registrantOrg: string | null;
    registrantEmail: string | null;
    dnssec: boolean;
    ageInDays: number;
    isNewDomain: boolean; // Less than 30 days
    isExpiringSoon: boolean; // Expires in < 30 days
}

export interface DNSRecords {
    domain: string;
    a: string[]; // IPv4 addresses
    aaaa: string[]; // IPv6 addresses
    mx: { priority: number; host: string }[];
    txt: string[];
    ns: string[];
    cname: string[];
    soa: {
        primaryNs: string;
        hostmaster: string;
        serial: number;
    } | null;
}

export interface DomainIntelResult {
    whois: WHOISData | null;
    dns: DNSRecords | null;
    sslCertificate: {
        valid: boolean;
        issuer: string;
        expiresAt: string;
        commonName: string;
    } | null;
    technologies: string[];
    riskIndicators: string[];
    riskScore: number;
}

// Use RDAP for WHOIS lookups (free, no API key needed)
export async function getWHOIS(domain: string): Promise<WHOISData | null> {
    // Get TLD and find appropriate RDAP server
    const tld = domain.split('.').pop()?.toLowerCase();

    const rdapServers: Record<string, string> = {
        'com': 'https://rdap.verisign.com/com/v1',
        'net': 'https://rdap.verisign.com/net/v1',
        'org': 'https://rdap.publicinterestregistry.org/rdap',
        'io': 'https://rdap.nic.io',
        'co': 'https://rdap.nic.co',
        'me': 'https://rdap.nic.me',
        'dev': 'https://rdap.nic.google',
        'app': 'https://rdap.nic.google',
    };

    const rdapBase = rdapServers[tld || ''] || 'https://rdap.verisign.com/com/v1';

    try {
        const response = await fetch(`${rdapBase}/domain/${domain}`, {
            headers: { 'Accept': 'application/rdap+json' }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return parseRDAPResponse(data, domain);
    } catch (error) {
        console.error('RDAP lookup error:', error);
    }

    // Fallback to WhoisXML API if configured
    const whoisXmlKey = process.env.WHOISXML_API_KEY;
    if (whoisXmlKey) {
        try {
            const response = await fetch(
                `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${whoisXmlKey}&domainName=${domain}&outputFormat=JSON`
            );
            if (response.ok) {
                const data = await response.json();
                return parseWhoisXMLResponse(data, domain);
            }
        } catch (error) {
            console.error('WhoisXML API error:', error);
        }
    }

    return null;
}

function parseRDAPResponse(data: any, domain: string): WHOISData {
    const events = data.events || [];
    const getEventDate = (type: string) => {
        const event = events.find((e: any) => e.eventAction === type);
        return event?.eventDate || null;
    };

    const creationDate = getEventDate('registration');
    const ageInDays = creationDate
        ? Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const expirationDate = getEventDate('expiration');
    const daysUntilExpiry = expirationDate
        ? Math.floor((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 365;

    // Find registrant info
    const registrantEntity = data.entities?.find((e: any) =>
        e.roles?.includes('registrant')
    );

    return {
        domain,
        registrar: data.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || null,
        registrarUrl: data.links?.find((l: any) => l.rel === 'related')?.href || null,
        creationDate,
        expirationDate,
        updatedDate: getEventDate('last changed'),
        nameServers: data.nameservers?.map((ns: any) => ns.ldhName) || [],
        status: data.status || [],
        registrantCountry: registrantEntity?.vcardArray?.[1]?.find((v: any) => v[0] === 'adr')?.[3]?.[6] || null,
        registrantOrg: registrantEntity?.vcardArray?.[1]?.find((v: any) => v[0] === 'org')?.[3] || null,
        registrantEmail: null, // Usually redacted in RDAP
        dnssec: data.secureDNS?.delegationSigned || false,
        ageInDays,
        isNewDomain: ageInDays < 30,
        isExpiringSoon: daysUntilExpiry < 30
    };
}

function parseWhoisXMLResponse(data: any, domain: string): WHOISData {
    const record = data.WhoisRecord || {};
    const creationDate = record.createdDate || record.registryData?.createdDate;
    const ageInDays = creationDate
        ? Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const expirationDate = record.expiresDate || record.registryData?.expiresDate;
    const daysUntilExpiry = expirationDate
        ? Math.floor((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 365;

    return {
        domain,
        registrar: record.registrarName,
        registrarUrl: null,
        creationDate,
        expirationDate,
        updatedDate: record.updatedDate,
        nameServers: record.nameServers?.hostNames || [],
        status: record.status ? [record.status] : [],
        registrantCountry: record.registrant?.country,
        registrantOrg: record.registrant?.organization,
        registrantEmail: record.contactEmail,
        dnssec: record.dnssec === 'signed',
        ageInDays,
        isNewDomain: ageInDays < 30,
        isExpiringSoon: daysUntilExpiry < 30
    };
}

// DNS lookup using DoH (DNS over HTTPS)
export async function getDNSRecords(domain: string): Promise<DNSRecords | null> {
    const records: DNSRecords = {
        domain,
        a: [],
        aaaa: [],
        mx: [],
        txt: [],
        ns: [],
        cname: [],
        soa: null
    };

    const dohUrl = 'https://cloudflare-dns.com/dns-query';

    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

    for (const type of recordTypes) {
        try {
            const response = await fetch(`${dohUrl}?name=${domain}&type=${type}`, {
                headers: { 'Accept': 'application/dns-json' }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.Answer) {
                    for (const answer of data.Answer) {
                        switch (type) {
                            case 'A':
                                records.a.push(answer.data);
                                break;
                            case 'AAAA':
                                records.aaaa.push(answer.data);
                                break;
                            case 'MX':
                                const [priority, host] = answer.data.split(' ');
                                records.mx.push({ priority: parseInt(priority), host: host.replace(/\.$/, '') });
                                break;
                            case 'TXT':
                                records.txt.push(answer.data.replace(/"/g, ''));
                                break;
                            case 'NS':
                                records.ns.push(answer.data.replace(/\.$/, ''));
                                break;
                            case 'CNAME':
                                records.cname.push(answer.data.replace(/\.$/, ''));
                                break;
                            case 'SOA':
                                const parts = answer.data.split(' ');
                                records.soa = {
                                    primaryNs: parts[0]?.replace(/\.$/, '') || '',
                                    hostmaster: parts[1]?.replace(/\.$/, '') || '',
                                    serial: parseInt(parts[2]) || 0
                                };
                                break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`DNS lookup error for ${type}:`, error);
        }
    }

    return records;
}

// Full domain intelligence
export async function getDomainIntel(domain: string): Promise<DomainIntelResult> {
    const [whois, dns] = await Promise.all([
        getWHOIS(domain),
        getDNSRecords(domain)
    ]);

    const riskIndicators: string[] = [];
    let riskScore = 0;

    // Analyze WHOIS data
    if (whois) {
        if (whois.isNewDomain) {
            riskIndicators.push('Newly registered domain (< 30 days)');
            riskScore += 25;
        }
        if (whois.isExpiringSoon) {
            riskIndicators.push('Domain expiring soon');
            riskScore += 10;
        }
        if (!whois.dnssec) {
            riskIndicators.push('DNSSEC not enabled');
            riskScore += 5;
        }
        if (!whois.registrantOrg) {
            riskIndicators.push('Hidden registrant information');
            riskScore += 10;
        }
    }

    // Analyze DNS
    if (dns) {
        if (dns.a.length === 0 && dns.cname.length === 0) {
            riskIndicators.push('No A or CNAME records');
            riskScore += 20;
        }
        if (dns.mx.length === 0) {
            riskIndicators.push('No MX records (no email)');
            riskScore += 5;
        }
        // Check for parked domain indicators
        const txtContent = dns.txt.join(' ').toLowerCase();
        if (txtContent.includes('parked') || txtContent.includes('for sale')) {
            riskIndicators.push('Possibly parked domain');
            riskScore += 15;
        }
    }

    // Detect technologies from DNS
    const technologies: string[] = [];
    if (dns) {
        const allRecords = [...dns.txt, ...dns.cname.map(c => c.toLowerCase())].join(' ').toLowerCase();
        if (allRecords.includes('google')) technologies.push('Google Services');
        if (allRecords.includes('cloudflare')) technologies.push('Cloudflare');
        if (allRecords.includes('aws') || allRecords.includes('amazon')) technologies.push('AWS');
        if (allRecords.includes('microsoft') || allRecords.includes('outlook')) technologies.push('Microsoft 365');
        if (allRecords.includes('spf') || dns.txt.some(t => t.includes('v=spf1'))) technologies.push('SPF');
        if (dns.txt.some(t => t.includes('v=DMARC'))) technologies.push('DMARC');
        if (dns.txt.some(t => t.includes('v=DKIM'))) technologies.push('DKIM');
    }

    return {
        whois,
        dns,
        sslCertificate: null, // Would need additional check
        technologies,
        riskIndicators,
        riskScore: Math.min(100, riskScore)
    };
}
