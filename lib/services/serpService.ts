export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export async function googleSearch(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        console.warn("SERPER_API_KEY is missing. Returning mock data.");
        return [];
    }

    try {
        const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 5 })
        });

        if (!res.ok) {
            console.error("Serper API error:", res.statusText);
            return [];
        }

        const data = await res.json();
        return data.organic || [];
    } catch (err) {
        console.error("Search failed:", err);
        return [];
    }
}
