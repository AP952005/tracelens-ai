import { detectQueryType } from "./queryDetector";
import { scanSocialProfiles } from "./socialScanner";
import { scanEmailIntel } from "./emailIntel";
import { calculateThreatScore } from "./riskEngine";
import { buildInvestigationReport } from "./reportBuilder";

export async function runInvestigation(query: string) {
  const queryType = detectQueryType(query);

  const socialProfiles = await scanSocialProfiles(query, queryType);
  const emailIntel = await scanEmailIntel(query, queryType);

  const threatScore = calculateThreatScore({
    query,
    queryType,
    socialProfiles,
    emailIntel,
  });

  const report = buildInvestigationReport({
    query,
    queryType,
    socialProfiles,
    emailIntel,
    threatScore,
  });

  return {
    query,
    queryType,
    threatScore,
    socialProfiles,
    emailIntel,
    report,
  };
}