/**
 * Unified OSINT Service
 * Orchestrates all intelligence modules for comprehensive investigations
 */

import { getGitHubIntel, GitHubIntelResult } from './githubIntel';
import { verifyEmail, getDomainIntel as getEmailDomainIntel, checkEmailBreach, EmailVerification } from './emailIntel';
import { analyzeWithVirusTotal, VirusTotalResult } from './virusTotalIntel';
import { getIPGeolocation, IPGeolocation } from './ipIntel';
import { getDomainIntel, DomainIntelResult } from './whoisIntel';
import { scanSocialProfiles, quickSocialCheck, SocialScanResult, SocialProfileCheck } from './socialScanner';
import { lookupIP as shodanLookup, lookupDomain as shodanDomain, ShodanHostResult, ShodanDomainResult } from './shodanIntel';

export interface OSINTResult {
    query: string;
    queryType: 'email' | 'username' | 'domain' | 'ip' | 'url' | 'hash' | 'unknown';
    timestamp: string;

    // GitHub Intelligence
    github?: GitHubIntelResult;

    // Email Intelligence
    email?: {
        verification: EmailVerification;
        breachCheck: {
            breached: boolean;
            sources: string[];
            exposedData: string[];
        };
    };

    // Social Profiles
    socialProfiles?: SocialScanResult;

    // Domain/WHOIS
    domain?: DomainIntelResult;

    // IP Intelligence
    ip?: IPGeolocation;

    // VirusTotal
    virusTotal?: VirusTotalResult;

    // Shodan
    shodan?: ShodanHostResult | ShodanDomainResult;

    // Aggregated risk analysis
    riskAnalysis: {
        score: number;
        level: 'low' | 'medium' | 'high' | 'critical';
        factors: string[];
        recommendations: string[];
    };

    // Metadata
    modulesRun: string[];
    errors: string[];
    executionTimeMs: number;
}

// Detect query type
function detectQueryType(query: string): OSINTResult['queryType'] {
    const trimmed = query.trim().toLowerCase();

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'email';
    }

    // IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
        return 'ip';
    }
    if (/^([a-f0-9:]+:+)+[a-f0-9]+$/.test(trimmed)) {
        return 'ip'; // IPv6
    }

    // URL
    if (/^https?:\/\//.test(trimmed)) {
        return 'url';
    }

    // Hash (MD5, SHA1, SHA256)
    if (/^[a-f0-9]{32}$/.test(trimmed) ||
        /^[a-f0-9]{40}$/.test(trimmed) ||
        /^[a-f0-9]{64}$/.test(trimmed)) {
        return 'hash';
    }

    // Domain
    if (/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(trimmed)) {
        return 'domain';
    }

    // Default to username
    return 'username';
}

// Calculate aggregated risk score
function calculateAggregatedRisk(result: Partial<OSINTResult>): OSINTResult['riskAnalysis'] {
    let baseScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // GitHub risks
    if (result.github?.profile) {
        if (result.github.commitEmails.length > 0) {
            baseScore += 15;
            factors.push('Email exposed in GitHub commits');
            recommendations.push('Review GitHub commit history and use private email');
        }
        if (result.github.profile.email) {
            baseScore += 10;
            factors.push('Public email on GitHub profile');
            recommendations.push('Consider hiding email from GitHub profile');
        }
        if (result.github.riskIndicators.length > 0) {
            baseScore += result.github.riskIndicators.length * 5;
            factors.push(...result.github.riskIndicators);
        }
    }

    // Email risks
    if (result.email) {
        if (result.email.breachCheck.breached) {
            baseScore += 30;
            factors.push(`Found in ${result.email.breachCheck.sources.length} data breach(es)`);
            recommendations.push('Change passwords for all accounts using this email');
            recommendations.push('Enable 2FA on all accounts');
        }
        if (result.email.verification.disposable) {
            baseScore += 20;
            factors.push('Disposable/temporary email detected');
        }
    }

    // Social profile risks
    if (result.socialProfiles) {
        if (result.socialProfiles.totalFound > 10) {
            baseScore += 10;
            factors.push(`Large digital footprint: ${result.socialProfiles.totalFound} profiles found`);
            recommendations.push('Review privacy settings on all social accounts');
        }
    }

    // Domain risks
    if (result.domain) {
        if (result.domain.whois?.isNewDomain) {
            baseScore += 25;
            factors.push('Newly registered domain (<30 days)');
        }
        baseScore += Math.min(30, result.domain.riskScore);
        factors.push(...result.domain.riskIndicators);
    }

    // IP risks
    if (result.ip) {
        if (result.ip.isVPN) {
            baseScore += 20;
            factors.push('VPN/Privacy service detected');
        }
        if (result.ip.isTor) {
            baseScore += 40;
            factors.push('Tor exit node detected');
            recommendations.push('Exercise caution - IP obfuscation in use');
        }
        if (result.ip.isProxy) {
            baseScore += 15;
            factors.push('Proxy detected');
        }
    }

    // VirusTotal risks
    if (result.virusTotal) {
        if (result.virusTotal.detected) {
            baseScore += 35 + result.virusTotal.positives;
            factors.push(`Detected as malicious by ${result.virusTotal.positives}/${result.virusTotal.total} engines`);
            recommendations.push('Avoid interacting with this resource');
        }
    }

    // Shodan risks
    if (result.shodan && 'ports' in result.shodan) {
        const shodanHost = result.shodan as ShodanHostResult;
        if (shodanHost.vulns && shodanHost.vulns.length > 0) {
            baseScore += 30;
            factors.push(`${shodanHost.vulns.length} known vulnerabilities`);
        }
        if (shodanHost.ports && shodanHost.ports.length > 10) {
            baseScore += 10;
            factors.push(`${shodanHost.ports.length} open ports`);
        }
    }

    const finalScore = Math.min(100, baseScore);

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (finalScore >= 75) level = 'critical';
    else if (finalScore >= 50) level = 'high';
    else if (finalScore >= 25) level = 'medium';

    // Add general recommendations if needed
    if (recommendations.length === 0 && finalScore > 25) {
        recommendations.push('Monitor for suspicious activity');
        recommendations.push('Review security settings regularly');
    }

    return {
        score: finalScore,
        level,
        factors: [...new Set(factors)], // Dedupe
        recommendations: [...new Set(recommendations)].slice(0, 10)
    };
}

// Main OSINT investigation function
export async function runOSINTInvestigation(query: string, options?: {
    skipModules?: string[];
    priorityModules?: string[];
}): Promise<OSINTResult> {
    const startTime = Date.now();
    const queryType = detectQueryType(query);

    const result: OSINTResult = {
        query,
        queryType,
        timestamp: new Date().toISOString(),
        riskAnalysis: { score: 0, level: 'low', factors: [], recommendations: [] },
        modulesRun: [],
        errors: [],
        executionTimeMs: 0
    };

    const skip = new Set(options?.skipModules || []);

    // Run appropriate modules based on query type
    const promises: Promise<void>[] = [];

    // Username investigation
    if (queryType === 'username') {
        // GitHub
        if (!skip.has('github')) {
            promises.push(
                getGitHubIntel(query)
                    .then(data => { result.github = data; result.modulesRun.push('github'); })
                    .catch(e => { result.errors.push(`GitHub: ${e.message}`); })
            );
        }

        // Social scan
        if (!skip.has('social')) {
            promises.push(
                scanSocialProfiles(query)
                    .then(data => { result.socialProfiles = data; result.modulesRun.push('social'); })
                    .catch(e => { result.errors.push(`Social: ${e.message}`); })
            );
        }
    }

    // Email investigation
    if (queryType === 'email') {
        const [localPart, domain] = query.split('@');

        // Email verification
        if (!skip.has('email')) {
            promises.push(
                Promise.all([verifyEmail(query), checkEmailBreach(query)])
                    .then(([verification, breachCheck]) => {
                        result.email = { verification, breachCheck };
                        result.modulesRun.push('email');
                    })
                    .catch(e => { result.errors.push(`Email: ${e.message}`); })
            );
        }

        // Domain intelligence
        if (!skip.has('domain')) {
            promises.push(
                getDomainIntel(domain)
                    .then(data => { result.domain = data; result.modulesRun.push('domain'); })
                    .catch(e => { result.errors.push(`Domain: ${e.message}`); })
            );
        }

        // Check username from email
        if (!skip.has('github')) {
            promises.push(
                getGitHubIntel(localPart)
                    .then(data => {
                        if (data.profile) {
                            result.github = data;
                            result.modulesRun.push('github');
                        }
                    })
                    .catch(e => { result.errors.push(`GitHub: ${e.message}`); })
            );
        }

        // Social scan for username
        if (!skip.has('social')) {
            promises.push(
                quickSocialCheck(localPart)
                    .then(profiles => {
                        result.socialProfiles = {
                            query: localPart,
                            profiles,
                            totalFound: profiles.filter(p => p.exists).length,
                            totalChecked: profiles.length,
                            scanTime: 0
                        };
                        result.modulesRun.push('social');
                    })
                    .catch(e => { result.errors.push(`Social: ${e.message}`); })
            );
        }
    }

    // Domain investigation
    if (queryType === 'domain') {
        // WHOIS/DNS
        if (!skip.has('domain')) {
            promises.push(
                getDomainIntel(query)
                    .then(data => { result.domain = data; result.modulesRun.push('domain'); })
                    .catch(e => { result.errors.push(`Domain: ${e.message}`); })
            );
        }

        // VirusTotal
        if (!skip.has('virustotal')) {
            promises.push(
                analyzeWithVirusTotal(query)
                    .then(data => {
                        if (data) {
                            result.virusTotal = data;
                            result.modulesRun.push('virustotal');
                        }
                    })
                    .catch(e => { result.errors.push(`VirusTotal: ${e.message}`); })
            );
        }

        // Shodan domain lookup
        if (!skip.has('shodan')) {
            promises.push(
                shodanDomain(query)
                    .then(data => {
                        if (data) {
                            result.shodan = data;
                            result.modulesRun.push('shodan');
                        }
                    })
                    .catch(e => { result.errors.push(`Shodan: ${e.message}`); })
            );
        }
    }

    // IP investigation
    if (queryType === 'ip') {
        // IP Geolocation
        if (!skip.has('ip')) {
            promises.push(
                getIPGeolocation(query)
                    .then(data => {
                        if (data) {
                            result.ip = data;
                            result.modulesRun.push('ip');
                        }
                    })
                    .catch(e => { result.errors.push(`IP: ${e.message}`); })
            );
        }

        // VirusTotal
        if (!skip.has('virustotal')) {
            promises.push(
                analyzeWithVirusTotal(query)
                    .then(data => {
                        if (data) {
                            result.virusTotal = data;
                            result.modulesRun.push('virustotal');
                        }
                    })
                    .catch(e => { result.errors.push(`VirusTotal: ${e.message}`); })
            );
        }

        // Shodan
        if (!skip.has('shodan')) {
            promises.push(
                shodanLookup(query)
                    .then(data => {
                        if (data) {
                            result.shodan = data;
                            result.modulesRun.push('shodan');
                        }
                    })
                    .catch(e => { result.errors.push(`Shodan: ${e.message}`); })
            );
        }
    }

    // URL investigation
    if (queryType === 'url') {
        // VirusTotal
        if (!skip.has('virustotal')) {
            promises.push(
                analyzeWithVirusTotal(query)
                    .then(data => {
                        if (data) {
                            result.virusTotal = data;
                            result.modulesRun.push('virustotal');
                        }
                    })
                    .catch(e => { result.errors.push(`VirusTotal: ${e.message}`); })
            );
        }

        // Extract domain and run domain intel
        const urlDomain = new URL(query).hostname;
        if (!skip.has('domain')) {
            promises.push(
                getDomainIntel(urlDomain)
                    .then(data => { result.domain = data; result.modulesRun.push('domain'); })
                    .catch(e => { result.errors.push(`Domain: ${e.message}`); })
            );
        }
    }

    // Hash investigation
    if (queryType === 'hash') {
        // VirusTotal
        if (!skip.has('virustotal')) {
            promises.push(
                analyzeWithVirusTotal(query)
                    .then(data => {
                        if (data) {
                            result.virusTotal = data;
                            result.modulesRun.push('virustotal');
                        }
                    })
                    .catch(e => { result.errors.push(`VirusTotal: ${e.message}`); })
            );
        }
    }

    // Wait for all modules to complete
    await Promise.all(promises);

    // Calculate aggregated risk
    result.riskAnalysis = calculateAggregatedRisk(result);
    result.executionTimeMs = Date.now() - startTime;

    return result;
}

// Quick investigation (fewer modules, faster)
export async function runQuickInvestigation(query: string): Promise<OSINTResult> {
    return runOSINTInvestigation(query, {
        skipModules: ['shodan', 'virustotal'] // Skip slower/premium APIs
    });
}
