export async function scanEmailIntel(query: string, queryType: string) {
    if (queryType !== "email") {
      return null;
    }
  
    const domain = query.split("@")[1];
    const username = query.split("@")[0];
  
    return {
      email: query,
      username,
      domain,
      domainReputation: domain.includes("gmail") ? "trusted" : "unknown",
      disposableEmail: false,
      possibleBreachExposure: domain.includes("gmail"),
      breachSources: domain.includes("gmail")
        ? ["LinkedIn Leak 2021", "Collection #1"]
        : [],
      notes: domain.includes("gmail")
        ? "Email appears in common breach collections."
        : "No breach record found in mock scan.",
    };
  }