/**
 * Forensics Module Index
 * Exports all OSINT and forensics intelligence modules
 */

// Core OSINT Engines
export * from './osintEngine';
export * from './breachEngine';
export * from './riskEngine';
export * from './timelineEngine';
export * from './reportBuilder';
export * from './queryClassifier';
export * from './custodyEngine';
export * from './hashUtils';

// Advanced Intelligence Modules
export * from './githubIntel';
export * from './ipIntel';
export * from './socialScanner';
export * from './virusTotalIntel';
export * from './shodanIntel';

// Email Intel - explicit exports to avoid conflicts with whoisIntel.getDomainIntel
export {
    verifyEmail,
    checkEmailBreach,
    type EmailVerification,
    type DomainIntel as EmailDomainIntel  // Renamed to avoid conflict
} from './emailIntel';

// WHOIS Intel - explicit exports (has the main getDomainIntel)
export {
    getDomainIntel,
    getWHOIS,
    getDNSRecords,
    type DomainIntelResult,
    type WHOISData,
    type DNSRecords
} from './whoisIntel';

// Unified OSINT Service
export * from './osintService';
