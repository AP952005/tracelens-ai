export function calculateThreatScore(data: any) {
    let score = 10;
  
    if (data.queryType === "email") score += 20;
    if (data.queryType === "phone") score += 15;
    if (data.queryType === "domain") score += 10;
  
    if (data.socialProfiles && data.socialProfiles.length > 2) score += 15;
  
    if (data.emailIntel?.possibleBreachExposure) score += 30;
  
    const q = data.query.toLowerCase();
    if (q.includes("dark")) score += 10;
    if (q.includes("hack")) score += 20;
  
    if (score > 100) score = 100;
    return score;
  }