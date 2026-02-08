import { InvestigationCase, SocialProfile, BreachRecord } from '@root/types/investigation';

// Risk factors with weights for accurate threat assessment
interface RiskFactors {
    breachSeverity: number;      // 0-30 points
    breachRecency: number;       // 0-15 points
    dataExposure: number;        // 0-20 points
    digitalFootprint: number;    // 0-15 points
    patternAnalysis: number;     // 0-10 points
    queryTypeRisk: number;       // 0-10 points
}

// Breach severity weights based on data type
const BREACH_DATA_WEIGHTS: Record<string, number> = {
    'passwords': 25,
    'financial': 22,
    'ssn': 20,
    'medical': 18,
    'phone': 12,
    'email': 8,
    'username': 5,
    'address': 10,
    'dob': 8
};

// Platform risk scores
const PLATFORM_RISK: Record<string, number> = {
    'darkweb': 15,
    'hacker forum': 12,
    'pastebin': 8,
    'github': 5,
    'twitter': 3,
    'linkedin': 2,
    'facebook': 3,
    'instagram': 2
};

export interface ThreatAnalysis {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: RiskFactors;
    breakdown: {
        category: string;
        points: number;
        maxPoints: number;
        description: string;
    }[];
    recommendations: string[];
}

export function calculateThreatScore(
    profiles: SocialProfile[],
    breaches: BreachRecord[],
    queryType: string
): number {
    const analysis = analyzeThreat(profiles, breaches, queryType);
    return analysis.score;
}

export function analyzeThreat(
    profiles: SocialProfile[],
    breaches: BreachRecord[],
    queryType: string
): ThreatAnalysis {
    const factors: RiskFactors = {
        breachSeverity: 0,
        breachRecency: 0,
        dataExposure: 0,
        digitalFootprint: 0,
        patternAnalysis: 0,
        queryTypeRisk: 0
    };

    const breakdown: ThreatAnalysis['breakdown'] = [];
    const recommendations: string[] = [];

    // 1. BREACH SEVERITY (0-30 points)
    // Calculate based on number and severity of breaches
    let breachSeverityScore = 0;
    breaches.forEach(breach => {
        // Base score from breach
        breachSeverityScore += Math.min(breach.riskScore * 0.5, 10);

        // Check for high-risk data types
        const dataTypesStr = breach.dataTypes?.join(' ').toLowerCase() || breach.domain.toLowerCase();
        Object.entries(BREACH_DATA_WEIGHTS).forEach(([dataType, weight]) => {
            if (dataTypesStr.includes(dataType)) {
                breachSeverityScore += weight * 0.3;
            }
        });
    });
    factors.breachSeverity = Math.min(Math.round(breachSeverityScore), 30);
    breakdown.push({
        category: 'Breach Severity',
        points: factors.breachSeverity,
        maxPoints: 30,
        description: `${breaches.length} breach(es) detected with varying severity levels`
    });

    if (breaches.length > 3) {
        recommendations.push('Multiple breaches detected - Consider identity monitoring service');
    }

    // 2. BREACH RECENCY (0-15 points)
    // More recent breaches = higher risk
    const now = new Date();
    let recencyScore = 0;
    breaches.forEach(breach => {
        const breachDate = new Date(breach.date);
        const monthsAgo = (now.getTime() - breachDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsAgo < 3) recencyScore += 5;       // Very recent
        else if (monthsAgo < 12) recencyScore += 3; // Within a year
        else if (monthsAgo < 24) recencyScore += 2; // Within 2 years
        else recencyScore += 1;                      // Older
    });
    factors.breachRecency = Math.min(Math.round(recencyScore), 15);
    breakdown.push({
        category: 'Breach Recency',
        points: factors.breachRecency,
        maxPoints: 15,
        description: 'Recent breaches indicate higher active risk'
    });

    if (factors.breachRecency > 10) {
        recommendations.push('Recent breaches detected - Immediate password changes recommended');
    }

    // 3. DATA EXPOSURE (0-20 points)
    // What type of data was exposed
    let exposureScore = 0;
    const exposedDataTypes = new Set<string>();
    breaches.forEach(breach => {
        breach.dataTypes?.forEach(type => exposedDataTypes.add(type.toLowerCase()));
    });

    if (exposedDataTypes.has('password') || exposedDataTypes.has('passwords')) exposureScore += 8;
    if (exposedDataTypes.has('financial') || exposedDataTypes.has('credit card')) exposureScore += 7;
    if (exposedDataTypes.has('ssn') || exposedDataTypes.has('social security')) exposureScore += 8;
    if (exposedDataTypes.has('email')) exposureScore += 3;
    if (exposedDataTypes.has('phone')) exposureScore += 2;

    // Infer from domain names
    breaches.forEach(breach => {
        const domain = breach.domain.toLowerCase();
        if (domain.includes('bank') || domain.includes('financial')) exposureScore += 4;
        if (domain.includes('health') || domain.includes('medical')) exposureScore += 3;
    });

    factors.dataExposure = Math.min(Math.round(exposureScore), 20);
    breakdown.push({
        category: 'Data Exposure',
        points: factors.dataExposure,
        maxPoints: 20,
        description: `Sensitive data types: ${Array.from(exposedDataTypes).slice(0, 3).join(', ') || 'Unknown'}`
    });

    if (exposedDataTypes.has('password')) {
        recommendations.push('Passwords exposed - Enable 2FA on all accounts immediately');
    }

    // 4. DIGITAL FOOTPRINT (0-15 points)
    // Social media presence analysis
    let footprintScore = 0;
    profiles.forEach(profile => {
        // High confidence matches
        if (profile.confidence > 90) footprintScore += 2;
        else if (profile.confidence > 70) footprintScore += 1.5;
        else if (profile.confidence > 50) footprintScore += 1;

        // Check for risky platforms
        const platform = profile.platform.toLowerCase();
        Object.entries(PLATFORM_RISK).forEach(([plat, risk]) => {
            if (platform.includes(plat)) footprintScore += risk * 0.2;
        });

        // Analyze notes for suspicious content
        const notes = profile.notes.toLowerCase();
        if (notes.includes('hacker') || notes.includes('breach')) footprintScore += 3;
        if (notes.includes('leak') || notes.includes('dump')) footprintScore += 3;
        if (notes.includes('crypto') || notes.includes('wallet')) footprintScore += 2;
        if (notes.includes('anonymous') || notes.includes('tor')) footprintScore += 2;
    });

    factors.digitalFootprint = Math.min(Math.round(footprintScore), 15);
    breakdown.push({
        category: 'Digital Footprint',
        points: factors.digitalFootprint,
        maxPoints: 15,
        description: `${profiles.length} social profile(s) identified across platforms`
    });

    // 5. PATTERN ANALYSIS (0-10 points)
    // Cross-reference patterns
    let patternScore = 0;

    // Username reuse across platforms
    const usernames = profiles.map(p => p.username.toLowerCase());
    const uniqueUsernames = new Set(usernames);
    if (usernames.length > 0 && uniqueUsernames.size < usernames.length * 0.7) {
        patternScore += 4; // High username reuse
        recommendations.push('Username reuse detected - Consider using unique usernames per platform');
    }

    // Email in multiple breaches
    const breachEmails = breaches.filter(b => b.domain.includes('@') || b.dataTypes?.includes('email'));
    if (breachEmails.length > 2) {
        patternScore += 3;
    }

    // Cross-platform exposure
    if (profiles.length > 5 && breaches.length > 3) {
        patternScore += 3;
    }

    factors.patternAnalysis = Math.min(Math.round(patternScore), 10);
    breakdown.push({
        category: 'Pattern Analysis',
        points: factors.patternAnalysis,
        maxPoints: 10,
        description: 'Cross-reference analysis of digital behavior patterns'
    });

    // 6. QUERY TYPE RISK (0-10 points)
    let queryRisk = 0;
    switch (queryType) {
        case 'ip':
            queryRisk = 8; // IPs often indicate technical investigation
            break;
        case 'email':
            queryRisk = 5; // Email is common identifier
            break;
        case 'phone':
            queryRisk = 6; // Phone can reveal personal info
            break;
        case 'domain':
            queryRisk = 4;
            break;
        case 'username':
            queryRisk = 3;
            break;
        default:
            queryRisk = 2;
    }
    factors.queryTypeRisk = queryRisk;
    breakdown.push({
        category: 'Investigation Type',
        points: factors.queryTypeRisk,
        maxPoints: 10,
        description: `Query type "${queryType}" risk assessment`
    });

    // Calculate total score
    const totalScore = Math.min(
        factors.breachSeverity +
        factors.breachRecency +
        factors.dataExposure +
        factors.digitalFootprint +
        factors.patternAnalysis +
        factors.queryTypeRisk,
        100
    );

    // Determine threat level
    let level: ThreatAnalysis['level'];
    if (totalScore < 20) level = 'LOW';
    else if (totalScore < 45) level = 'MEDIUM';
    else if (totalScore < 70) level = 'HIGH';
    else level = 'CRITICAL';

    // Add general recommendations based on score
    if (level === 'CRITICAL') {
        recommendations.push('CRITICAL: Immediate action required - Consider credit freeze and identity protection');
    } else if (level === 'HIGH') {
        recommendations.push('HIGH RISK: Review all accounts for unauthorized access');
    }

    return {
        score: totalScore,
        level,
        factors,
        breakdown,
        recommendations
    };
}

export function assessRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 20) return 'LOW';
    if (score < 45) return 'MEDIUM';
    if (score < 70) return 'HIGH';
    return 'CRITICAL';
}

// Color utilities for UI
export function getRiskColor(level: string): string {
    switch (level) {
        case 'LOW': return '#22c55e';      // Green
        case 'MEDIUM': return '#eab308';   // Yellow
        case 'HIGH': return '#f97316';     // Orange
        case 'CRITICAL': return '#ef4444'; // Red
        default: return '#6b7280';
    }
}

export function getRiskGradient(level: string): string {
    switch (level) {
        case 'LOW': return 'from-green-500 to-emerald-600';
        case 'MEDIUM': return 'from-yellow-500 to-amber-600';
        case 'HIGH': return 'from-orange-500 to-red-600';
        case 'CRITICAL': return 'from-red-500 to-rose-700';
        default: return 'from-gray-500 to-gray-600';
    }
}
