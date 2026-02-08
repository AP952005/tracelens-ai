import { createHash } from 'crypto';

export function generateHash(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(str).digest('hex');
}

export function generateId(): string {
    return createHash('sha1').update(Math.random().toString() + Date.now().toString()).digest('hex').substring(0, 12);
}
