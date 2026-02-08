import { z } from "zod";
import { TamboTool, TamboComponent } from "@tambo-ai/react";
import { tamboRegistry } from "@root/components/tambo/tamboRegistry";
import { scanTargetTool, getCaseDetailsTool, getEvidenceGraphDataTool } from "@root/lib/forensics/forensicTools";

/**
 * tools
 * Registered Tambo tools for the forensic assistant.
 */
export const tools: TamboTool[] = [
    {
        name: "scanTarget",
        description: "Scans a target (email, username, IP) for social media footprints and data breaches. Returns a threat score and summary of findings. Use this when the user asks to 'scan', 'investigate', or 'check' a target.",
        tool: scanTargetTool,
        inputSchema: z.object({
            query: z.string().describe("The target identifier to scan (e.g., username, email, IP)")
        }),
        outputSchema: z.object({
            target: z.string(),
            type: z.string(),
            threatScore: z.number(),
            profilesFound: z.number(),
            breachesFound: z.number(),
            profiles: z.array(z.object({
                platform: z.string(),
                username: z.string(),
                confidence: z.number()
            })),
            breaches: z.array(z.object({
                domain: z.string(),
                date: z.string()
            }))
        })
    },
    {
        name: "getCaseDetails",
        description: "Retrieves full details of an existing investigation case by ID. Use this when you need deep context about a specific case.",
        tool: getCaseDetailsTool,
        inputSchema: z.object({
            caseId: z.string().describe("The unique ID of the investigation case")
        }),
        outputSchema: z.object({
            id: z.string().optional(),
            query: z.string().optional(),
            status: z.string().optional(),
            threatScore: z.number().optional(),
            socialProfiles: z.array(z.any()).optional(),
            breaches: z.array(z.any()).optional(),
            reportSummary: z.string().optional(),
            error: z.string().optional()
        })
    },
    {
        name: "getEvidenceGraph",
        description: "Fetches the node-link evidence graph data for a case. Use this BEFORE rendering the EvidenceGraph component to get the nodes and edges.",
        tool: getEvidenceGraphDataTool,
        inputSchema: z.object({
            caseId: z.string().describe("The unique ID of the investigation case")
        }),
        outputSchema: z.object({
            nodes: z.array(z.any()).optional(),
            edges: z.array(z.any()).optional(),
            error: z.string().optional()
        })
    }
];

/**
 * components
 * Registered Tambo components (GenUI).
 * We import the registry we created earlier.
 */
export const components: TamboComponent[] = tamboRegistry;
