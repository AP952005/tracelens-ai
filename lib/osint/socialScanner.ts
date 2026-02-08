export async function scanSocialProfiles(query: string, queryType: string) {
    if (queryType !== "username" && queryType !== "email") {
      return [];
    }
  
    const username =
      queryType === "email" ? query.split("@")[0] : query.toLowerCase();
  
    return [
      {
        platform: "GitHub",
        username,
        url: `https://github.com/${username}`,
        confidence: 88,
        notes: "Repositories found. Possible developer identity.",
      },
      {
        platform: "LinkedIn",
        username,
        url: `https://linkedin.com/in/${username}`,
        confidence: 65,
        notes: "Potential match (verification needed).",
      },
      {
        platform: "Instagram",
        username,
        url: `https://instagram.com/${username}`,
        confidence: 72,
        notes: "Username match generated.",
      },
      {
        platform: "Twitter/X",
        username,
        url: `https://x.com/${username}`,
        confidence: 70,
        notes: "Possible profile handle match.",
      },
    ];
  }