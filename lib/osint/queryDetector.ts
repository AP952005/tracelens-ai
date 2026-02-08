export function detectQueryType(query: string) {
    const q = query.trim();
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  
    if (emailRegex.test(q)) return "email";
    if (phoneRegex.test(q)) return "phone";
    if (domainRegex.test(q)) return "domain";
  
    return "username";
  }