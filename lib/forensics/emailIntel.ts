/**
 * Email Intelligence Module
 * Email verification, domain intelligence, and disposable email detection
 */

export interface EmailVerification {
    email: string;
    valid: boolean;
    disposable: boolean;
    role: boolean; // Is it a role-based email like info@, admin@
    freeProvider: boolean;
    domain: string;
    domainAge?: string;
    mxRecords: string[];
    smtpCheck?: boolean;
    score: number; // 0-100 quality score
}

export interface DomainIntel {
    domain: string;
    exists: boolean;
    mxRecords: string[];
    hasWebsite: boolean;
    organizationType: string;
    riskLevel: 'low' | 'medium' | 'high';
}

// Known disposable email domains
const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'temp-mail.org', 'fakeinbox.com', 'getnada.com',
    'mohmal.com', 'discard.email', 'tempail.com', 'emailondeck.com',
    'mintemail.com', 'trashmail.com', 'yopmail.com', 'maildrop.cc',
    'sharklasers.com', 'grr.la', 'spam4.me', 'spamevader.com'
]);

// Free email providers
const FREE_PROVIDERS = new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'mail.com', 'protonmail.com', 'icloud.com', 'zoho.com', 'gmx.com',
    'yandex.com', 'tutanota.com', 'live.com', 'msn.com', 'qq.com',
    '163.com', '126.com', 'sina.com', 'mail.ru', 'rambler.ru'
]);

// Role-based email prefixes
const ROLE_PREFIXES = new Set([
    'admin', 'info', 'support', 'sales', 'contact', 'help', 'service',
    'noreply', 'no-reply', 'webmaster', 'postmaster', 'hostmaster',
    'billing', 'abuse', 'security', 'privacy', 'team', 'office',
    'marketing', 'hr', 'jobs', 'careers', 'press', 'media'
]);

export async function verifyEmail(email: string): Promise<EmailVerification> {
    const [localPart, domain] = email.toLowerCase().split('@');

    const result: EmailVerification = {
        email: email.toLowerCase(),
        valid: false,
        disposable: false,
        role: false,
        freeProvider: false,
        domain,
        mxRecords: [],
        score: 0
    };

    if (!localPart || !domain) {
        return result;
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    result.valid = emailRegex.test(email);

    if (!result.valid) {
        return result;
    }

    // Check if disposable
    result.disposable = DISPOSABLE_DOMAINS.has(domain) ||
        domain.includes('temp') ||
        domain.includes('throw');

    // Check if free provider
    result.freeProvider = FREE_PROVIDERS.has(domain);

    // Check if role-based
    result.role = ROLE_PREFIXES.has(localPart.split('.')[0]);

    // Try to fetch MX records via DNS lookup API (use Hunter.io or similar if available)
    const hunterApiKey = process.env.HUNTER_API_KEY;

    if (hunterApiKey) {
        try {
            const response = await fetch(
                `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    result.smtpCheck = data.data.smtp_check;
                    result.mxRecords = data.data.mx_records ? [data.data.mx_records] : [];
                    result.score = data.data.score || 0;
                }
            }
        } catch (error) {
            console.error('Hunter.io API error:', error);
        }
    }

    // Calculate score if not from API
    if (result.score === 0) {
        let score = 50;
        if (result.valid) score += 20;
        if (!result.disposable) score += 15;
        if (!result.role) score += 5;
        if (result.freeProvider) score -= 5;
        result.score = Math.min(100, Math.max(0, score));
    }

    return result;
}

export async function getDomainIntel(domain: string): Promise<DomainIntel> {
    const result: DomainIntel = {
        domain: domain.toLowerCase(),
        exists: false,
        mxRecords: [],
        hasWebsite: false,
        organizationType: 'unknown',
        riskLevel: 'medium'
    };

    // Try to check if website exists
    try {
        const response = await fetch(`https://${domain}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });
        result.exists = true;
        result.hasWebsite = response.ok;
    } catch {
        // Try HTTP
        try {
            const response = await fetch(`http://${domain}`, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            result.exists = true;
            result.hasWebsite = response.ok;
        } catch {
            result.exists = false;
        }
    }

    // Determine organization type
    const tld = domain.split('.').pop()?.toLowerCase();
    if (tld === 'edu') {
        result.organizationType = 'Educational Institution';
        result.riskLevel = 'low';
    } else if (tld === 'gov' || tld === 'mil') {
        result.organizationType = 'Government/Military';
        result.riskLevel = 'low';
    } else if (tld === 'org') {
        result.organizationType = 'Organization';
        result.riskLevel = 'low';
    } else if (['io', 'dev', 'tech', 'app'].includes(tld || '')) {
        result.organizationType = 'Tech Company';
        result.riskLevel = 'low';
    } else if (DISPOSABLE_DOMAINS.has(domain)) {
        result.organizationType = 'Disposable Email Service';
        result.riskLevel = 'high';
    }

    return result;
}

export async function checkEmailBreach(email: string): Promise<{
    breached: boolean;
    sources: string[];
    exposedData: string[];
}> {
    const result = {
        breached: false,
        sources: [] as string[],
        exposedData: [] as string[]
    };

    // Try HIBP API if available
    const hibpApiKey = process.env.HIBP_API_KEY;

    if (hibpApiKey) {
        try {
            const response = await fetch(
                `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
                {
                    headers: {
                        'hibp-api-key': hibpApiKey,
                        'User-Agent': 'TraceLens-OSINT'
                    }
                }
            );

            if (response.ok) {
                const breaches = await response.json();
                result.breached = true;
                result.sources = breaches.map((b: any) => b.Name);
                const allDataClasses = new Set<string>();
                breaches.forEach((b: any) => {
                    b.DataClasses?.forEach((dc: string) => allDataClasses.add(dc));
                });
                result.exposedData = [...allDataClasses];
            }
        } catch (error) {
            console.error('HIBP API error:', error);
        }
    }

    return result;
}
