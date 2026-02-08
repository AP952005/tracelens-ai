export function buildInvestigationReport(data: any) {
    return {
      title: "TraceLens AI Investigation Report",
      subject: data.query,
      queryType: data.queryType,
      timestamp: new Date().toISOString(),
      summary: `Target "${data.query}" analyzed. Threat Score: ${data.threatScore}/100.`,
      findings: [
        `Query identified as: ${data.queryType}`,
        `Social profiles discovered: ${data.socialProfiles?.length || 0}`,
        data.emailIntel
          ? `Breach Exposure Flag: ${data.emailIntel.possibleBreachExposure}`
          : "No email intelligence collected.",
      ],
      recommendation:
        data.threatScore > 70
          ? "High-risk target. Immediate manual investigation recommended."
          : "Moderate risk. Further verification recommended.",
    };
  }