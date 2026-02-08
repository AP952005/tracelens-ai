import { InvestigationType } from '@root/types/investigation';

export function classifyQuery(query: string): InvestigationType {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    if (emailRegex.test(query)) return 'email';
    if (ipRegex.test(query)) return 'ip';
    if (phoneRegex.test(query)) return 'phone';
    if (domainRegex.test(query)) return 'domain';

    return 'username';
}
