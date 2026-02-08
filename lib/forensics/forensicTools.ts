import { scanSocialMedia } from './osintEngine';
import { checkBreaches } from './breachEngine';
import { calculateThreatScore } from './riskEngine';
import { classifyQuery } from './queryClassifier';
import { InvestigationCase } from '@root/types/investigation';
import { db } from '@root/lib/db/memoryStore';

// Tool 1: Scan Target
export const scanTargetTool = async ({ query }: { query: string }) => {
    console.log(`[Tambo Tool] Scanning target: ${query}`);

    // Reuse the logic from the API route, but callable as a function
    const queryType = classifyQuery(query);
    const socialProfiles = await scanSocialMedia(query);
    const breaches = await checkBreaches(query);
    const threatScore = calculateThreatScore(socialProfiles, breaches, queryType);

    return {
        target: query,
        type: queryType,
        threatScore,
        profilesFound: socialProfiles.length,
        breachesFound: breaches.length,
        profiles: socialProfiles.map(p => ({ platform: p.platform, username: p.username, confidence: p.confidence })),
        breaches: breaches.map(b => ({ domain: b.domain, date: b.date }))
    };
};

// Tool 2: Get Case Details
export const getCaseDetailsTool = async ({ caseId }: { caseId: string }) => {
    const c = await db.getCase(caseId);
    if (!c) return { error: "Case not found" };
    return {
        id: c.id,
        query: c.query,
        status: c.status,
        threatScore: c.threatScore,
        socialProfiles: c.socialProfiles,
        breaches: c.breaches,
        reportSummary: c.report?.summary
    };
};

// Tool 3: Get Evidence Graph Data
export const getEvidenceGraphDataTool = async ({ caseId }: { caseId: string }) => {
    const c = await db.getCase(caseId);
    if (!c) return { error: "Case not found" };

    return {
        nodes: c.evidenceGraph.nodes,
        edges: c.evidenceGraph.edges
    };
};
