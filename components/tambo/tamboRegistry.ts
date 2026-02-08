import { z } from 'zod';
import { TamboComponent } from '@tambo-ai/react';
import { EvidenceGraph } from '@root/components/forensics/EvidenceGraph';
import { TimelineView } from '@root/components/forensics/TimelineView';

// Schema for EvidenceGraph
const evidenceGraphSchema = z.object({
    initialNodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        source: z.string(),
        timestamp: z.string(),
        hash: z.string().optional()
    })).optional(),
    initialEdges: z.array(z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string(),
        confidence: z.number().optional()
    })).optional()
});

// Schema for TimelineView
const timelineViewSchema = z.object({
    events: z.array(z.object({
        id: z.string(),
        timestamp: z.string(),
        title: z.string(),
        description: z.string(),
        source: z.string(),
        significance: z.enum(['low', 'medium', 'high', 'critical'])
    }))
});

export const tamboRegistry: TamboComponent[] = [
    {
        name: 'EvidenceGraph',
        description: 'Displays a node-link diagram of forensic evidence, connecting people, accounts, IPs, and breaches. Use this when the user asks to see connections, the network, or the evidence board.',
        component: EvidenceGraph,
        propsSchema: evidenceGraphSchema
    },
    {
        name: 'TimelineView',
        description: 'Displays a chronological timeline of events, breaches, and user activities. Use this when the user asks for a timeline, history of events, or chronological analysis.',
        component: TimelineView,
        propsSchema: timelineViewSchema
    }
];
