import { TimelineEvent, SocialProfile, BreachRecord } from '@root/types/investigation';
import { generateId } from './hashUtils';

export function buildTimeline(profiles: SocialProfile[], breaches: BreachRecord[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    breaches.forEach(b => {
        events.push({
            id: generateId(),
            timestamp: new Date(b.date).toISOString(),
            title: `Data Breach: ${b.domain}`,
            description: `Target data exposed in ${b.domain} breach. Exposed: ${(b.dataClasses || []).join(', ')}.`,
            source: 'Breach Database',
            significance: 'high'
        });
    });

    profiles.forEach(p => {
        if (p.lastActive) {
            events.push({
                id: generateId(),
                timestamp: p.lastActive,
                title: `Activity on ${p.platform}`,
                description: `User last seen on ${p.platform}.`,
                source: 'Social Media Scan',
                significance: 'medium'
            });
        }
    });

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
