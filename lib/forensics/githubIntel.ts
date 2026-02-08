/**
 * GitHub Intelligence Module
 * Fetches real data from GitHub API for user reconnaissance
 */

export interface GitHubProfile {
    exists: boolean;
    username: string;
    name: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;
    email: string | null;
    blog: string | null;
    avatarUrl: string;
    profileUrl: string;
    publicRepos: number;
    publicGists: number;
    followers: number;
    following: number;
    createdAt: string;
    updatedAt: string;
    hireable: boolean | null;
    twitterUsername: string | null;
}

export interface GitHubRepo {
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    topics: string[];
    createdAt: string;
    updatedAt: string;
    isForked: boolean;
}

export interface GitHubCommitEmail {
    email: string;
    name: string;
    repo: string;
    commitUrl: string;
}

export interface GitHubIntelResult {
    profile: GitHubProfile | null;
    repos: GitHubRepo[];
    pinnedTopics: string[];
    commitEmails: GitHubCommitEmail[];
    riskIndicators: string[];
    confidenceScore: number;
}

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchGitHub(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TraceLens-OSINT/1.0'
    };

    // Use GitHub token if available for higher rate limits
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('GitHub API fetch error:', error);
        return null;
    }
}

export async function getGitHubIntel(username: string): Promise<GitHubIntelResult> {
    const result: GitHubIntelResult = {
        profile: null,
        repos: [],
        pinnedTopics: [],
        commitEmails: [],
        riskIndicators: [],
        confidenceScore: 0
    };

    // Fetch user profile
    const userData = await fetchGitHub(`/users/${encodeURIComponent(username)}`);

    if (!userData) {
        return result;
    }

    result.profile = {
        exists: true,
        username: userData.login,
        name: userData.name,
        bio: userData.bio,
        company: userData.company,
        location: userData.location,
        email: userData.email,
        blog: userData.blog,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
        publicRepos: userData.public_repos,
        publicGists: userData.public_gists,
        followers: userData.followers,
        following: userData.following,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        hireable: userData.hireable,
        twitterUsername: userData.twitter_username
    };

    result.confidenceScore = 85;

    // Fetch repos to analyze topics and find email leaks
    const reposData = await fetchGitHub(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`);

    if (reposData && Array.isArray(reposData)) {
        const allTopics: string[] = [];

        for (const repo of reposData) {
            result.repos.push({
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                topics: repo.topics || [],
                createdAt: repo.created_at,
                updatedAt: repo.updated_at,
                isForked: repo.fork
            });

            if (repo.topics) {
                allTopics.push(...repo.topics);
            }
        }

        // Get unique topics
        result.pinnedTopics = [...new Set(allTopics)].slice(0, 15);

        // Try to find email leaks in commits (check first repo)
        if (reposData.length > 0 && !reposData[0].fork) {
            const commitsData = await fetchGitHub(`/repos/${username}/${reposData[0].name}/commits?per_page=5`);

            if (commitsData && Array.isArray(commitsData)) {
                const seenEmails = new Set<string>();

                for (const commit of commitsData) {
                    if (commit.commit?.author?.email) {
                        const email = commit.commit.author.email;
                        // Filter out noreply emails
                        if (!email.includes('noreply') && !seenEmails.has(email)) {
                            seenEmails.add(email);
                            result.commitEmails.push({
                                email,
                                name: commit.commit.author.name || '',
                                repo: reposData[0].name,
                                commitUrl: commit.html_url
                            });
                        }
                    }
                }
            }
        }
    }

    // Analyze risk indicators
    if (result.profile) {
        if (result.commitEmails.length > 0) {
            result.riskIndicators.push('Email exposed in commit history');
        }
        if (result.profile.email) {
            result.riskIndicators.push('Public email in profile');
        }
        if (!result.profile.name) {
            result.riskIndicators.push('Anonymous profile (no real name)');
        }
        if (result.profile.followers > 100) {
            result.riskIndicators.push('High visibility account');
        }
        if (result.profile.publicRepos > 50) {
            result.riskIndicators.push('Extensive code exposure');
        }

        // Check account age
        const accountAge = Date.now() - new Date(result.profile.createdAt).getTime();
        const daysOld = accountAge / (1000 * 60 * 60 * 24);
        if (daysOld < 30) {
            result.riskIndicators.push('New account (< 30 days)');
        }
    }

    return result;
}
