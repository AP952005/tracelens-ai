/**
 * Social Profile Scanner Module
 * Direct platform URL checking for profile existence
 */

export interface SocialProfileCheck {
    platform: string;
    username: string;
    url: string;
    exists: boolean;
    httpStatus: number;
    responseTime: number;
    avatarUrl?: string;
    displayName?: string;
    bio?: string;
    followers?: number;
    following?: number;
    posts?: number;
    verified?: boolean;
    private?: boolean;
}

export interface SocialScanResult {
    query: string;
    profiles: SocialProfileCheck[];
    totalFound: number;
    totalChecked: number;
    scanTime: number;
}

// Platform configurations
const PLATFORM_CONFIGS = [
    {
        name: 'GitHub',
        urlTemplate: 'https://github.com/{username}',
        apiUrl: 'https://api.github.com/users/{username}',
        useApi: true
    },
    {
        name: 'Twitter/X',
        urlTemplate: 'https://x.com/{username}',
        altUrl: 'https://twitter.com/{username}',
        useApi: false
    },
    {
        name: 'Instagram',
        urlTemplate: 'https://www.instagram.com/{username}/',
        useApi: false
    },
    {
        name: 'LinkedIn',
        urlTemplate: 'https://www.linkedin.com/in/{username}',
        useApi: false
    },
    {
        name: 'TikTok',
        urlTemplate: 'https://www.tiktok.com/@{username}',
        useApi: false
    },
    {
        name: 'Reddit',
        urlTemplate: 'https://www.reddit.com/user/{username}',
        apiUrl: 'https://www.reddit.com/user/{username}/about.json',
        useApi: true
    },
    {
        name: 'YouTube',
        urlTemplate: 'https://www.youtube.com/@{username}',
        useApi: false
    },
    {
        name: 'Pinterest',
        urlTemplate: 'https://www.pinterest.com/{username}/',
        useApi: false
    },
    {
        name: 'Twitch',
        urlTemplate: 'https://www.twitch.tv/{username}',
        useApi: false
    },
    {
        name: 'Medium',
        urlTemplate: 'https://medium.com/@{username}',
        useApi: false
    },
    {
        name: 'Tumblr',
        urlTemplate: 'https://{username}.tumblr.com',
        useApi: false
    },
    {
        name: 'Flickr',
        urlTemplate: 'https://www.flickr.com/people/{username}',
        useApi: false
    },
    {
        name: 'SoundCloud',
        urlTemplate: 'https://soundcloud.com/{username}',
        useApi: false
    },
    {
        name: 'Spotify',
        urlTemplate: 'https://open.spotify.com/user/{username}',
        useApi: false
    },
    {
        name: 'Steam',
        urlTemplate: 'https://steamcommunity.com/id/{username}',
        useApi: false
    },
    {
        name: 'DeviantArt',
        urlTemplate: 'https://www.deviantart.com/{username}',
        useApi: false
    },
    {
        name: 'Behance',
        urlTemplate: 'https://www.behance.net/{username}',
        useApi: false
    },
    {
        name: 'Dribbble',
        urlTemplate: 'https://dribbble.com/{username}',
        useApi: false
    },
    {
        name: 'HackerNews',
        urlTemplate: 'https://news.ycombinator.com/user?id={username}',
        useApi: false
    },
    {
        name: 'ProductHunt',
        urlTemplate: 'https://www.producthunt.com/@{username}',
        useApi: false
    },
    {
        name: 'Keybase',
        urlTemplate: 'https://keybase.io/{username}',
        apiUrl: 'https://keybase.io/_/api/1.0/user/lookup.json?username={username}',
        useApi: true
    },
    {
        name: 'GitLab',
        urlTemplate: 'https://gitlab.com/{username}',
        apiUrl: 'https://gitlab.com/api/v4/users?username={username}',
        useApi: true
    },
    {
        name: 'Bitbucket',
        urlTemplate: 'https://bitbucket.org/{username}/',
        useApi: false
    },
    {
        name: 'DockerHub',
        urlTemplate: 'https://hub.docker.com/u/{username}',
        apiUrl: 'https://hub.docker.com/v2/users/{username}/',
        useApi: true
    },
    {
        name: 'StackOverflow',
        urlTemplate: 'https://stackoverflow.com/users/{username}',
        useApi: false
    },
    {
        name: 'About.me',
        urlTemplate: 'https://about.me/{username}',
        useApi: false
    },
    {
        name: 'Gravatar',
        urlTemplate: 'https://en.gravatar.com/{username}',
        useApi: false
    },
    {
        name: 'Telegram',
        urlTemplate: 'https://t.me/{username}',
        useApi: false
    }
];

async function checkProfileUrl(url: string, timeout: number = 5000): Promise<{ exists: boolean; status: number; time: number }> {
    const start = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            redirect: 'follow'
        });

        clearTimeout(timeoutId);

        const exists = response.ok && response.status !== 404;

        return {
            exists,
            status: response.status,
            time: Date.now() - start
        };
    } catch (error) {
        // Try GET if HEAD fails
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                redirect: 'follow'
            });

            clearTimeout(timeoutId);

            // Check if it's a real profile page (not a 404 soft redirect)
            const exists = response.ok && response.status !== 404;

            return {
                exists,
                status: response.status,
                time: Date.now() - start
            };
        } catch {
            return {
                exists: false,
                status: 0,
                time: Date.now() - start
            };
        }
    }
}

async function checkGitHubProfile(username: string): Promise<SocialProfileCheck> {
    const url = `https://github.com/${username}`;
    const apiUrl = `https://api.github.com/users/${username}`;
    const start = Date.now();

    try {
        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'TraceLens-OSINT/1.0'
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(apiUrl, { headers });
        const time = Date.now() - start;

        if (response.ok) {
            const data = await response.json();
            return {
                platform: 'GitHub',
                username,
                url,
                exists: true,
                httpStatus: 200,
                responseTime: time,
                avatarUrl: data.avatar_url,
                displayName: data.name,
                bio: data.bio,
                followers: data.followers,
                following: data.following,
                posts: data.public_repos
            };
        }

        return {
            platform: 'GitHub',
            username,
            url,
            exists: false,
            httpStatus: response.status,
            responseTime: time
        };
    } catch (error) {
        return {
            platform: 'GitHub',
            username,
            url,
            exists: false,
            httpStatus: 0,
            responseTime: Date.now() - start
        };
    }
}

async function checkRedditProfile(username: string): Promise<SocialProfileCheck> {
    const url = `https://www.reddit.com/user/${username}`;
    const apiUrl = `https://www.reddit.com/user/${username}/about.json`;
    const start = Date.now();

    try {
        const response = await fetch(apiUrl, {
            headers: { 'User-Agent': 'TraceLens-OSINT/1.0' }
        });
        const time = Date.now() - start;

        if (response.ok) {
            const data = await response.json();
            const user = data.data;
            return {
                platform: 'Reddit',
                username,
                url,
                exists: true,
                httpStatus: 200,
                responseTime: time,
                avatarUrl: user.icon_img?.split('?')[0],
                displayName: user.subreddit?.title || username,
                bio: user.subreddit?.public_description,
                followers: user.subreddit?.subscribers,
                verified: user.verified,
                posts: user.total_karma
            };
        }

        return {
            platform: 'Reddit',
            username,
            url,
            exists: false,
            httpStatus: response.status,
            responseTime: time
        };
    } catch (error) {
        return {
            platform: 'Reddit',
            username,
            url,
            exists: false,
            httpStatus: 0,
            responseTime: Date.now() - start
        };
    }
}

export async function scanSocialProfiles(username: string, platforms?: string[]): Promise<SocialScanResult> {
    const start = Date.now();
    const results: SocialProfileCheck[] = [];

    const platformsToCheck = platforms
        ? PLATFORM_CONFIGS.filter(p => platforms.includes(p.name))
        : PLATFORM_CONFIGS;

    // Check profiles in parallel (with concurrency limit)
    const concurrency = 5;
    for (let i = 0; i < platformsToCheck.length; i += concurrency) {
        const batch = platformsToCheck.slice(i, i + concurrency);

        const batchResults = await Promise.all(
            batch.map(async (config): Promise<SocialProfileCheck> => {
                const url = config.urlTemplate.replace('{username}', username);

                // Use platform-specific API checks where available
                if (config.name === 'GitHub') {
                    return checkGitHubProfile(username);
                }
                if (config.name === 'Reddit') {
                    return checkRedditProfile(username);
                }

                // Generic HTTP check for other platforms
                const { exists, status, time } = await checkProfileUrl(url);

                return {
                    platform: config.name,
                    username,
                    url,
                    exists,
                    httpStatus: status,
                    responseTime: time
                };
            })
        );

        results.push(...batchResults);
    }

    return {
        query: username,
        profiles: results,
        totalFound: results.filter(r => r.exists).length,
        totalChecked: results.length,
        scanTime: Date.now() - start
    };
}

// Quick check for specific platforms
export async function quickSocialCheck(username: string): Promise<SocialProfileCheck[]> {
    const priorityPlatforms = ['GitHub', 'Twitter/X', 'Instagram', 'LinkedIn', 'Reddit'];
    const result = await scanSocialProfiles(username, priorityPlatforms);
    return result.profiles;
}
