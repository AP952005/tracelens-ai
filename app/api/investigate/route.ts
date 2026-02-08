import { NextResponse } from 'next/server';
import { db } from '@root/lib/db/memoryStore';
import { classifyQuery } from '@root/lib/forensics/queryClassifier';
import { scanSocialMedia } from '@root/lib/forensics/osintEngine';
import { checkBreaches } from '@root/lib/forensics/breachEngine';
import { calculateThreatScore } from '@root/lib/forensics/riskEngine';
import { buildTimeline } from '@root/lib/forensics/timelineEngine';
import { generateReport } from '@root/lib/forensics/reportBuilder';
import { createCustodyLog } from '@root/lib/forensics/custodyEngine';
import { generateId, generateHash } from '@root/lib/forensics/hashUtils';
import { InvestigationCase, EvidenceNode, EvidenceEdge, SocialProfile } from '@root/types/investigation';

// New OSINT modules
import { getGitHubIntel } from '@root/lib/forensics/githubIntel';
import { verifyEmail, checkEmailBreach } from '@root/lib/forensics/emailIntel';
import { getIPGeolocation } from '@root/lib/forensics/ipIntel';
import { getDomainIntel } from '@root/lib/forensics/whoisIntel';
import { scanSocialProfiles } from '@root/lib/forensics/socialScanner';
import { analyzeWithVirusTotal } from '@root/lib/forensics/virusTotalIntel';
import { lookupIP as shodanLookupIP, lookupDomain as shodanLookupDomain } from '@root/lib/forensics/shodanIntel';

export async function POST(req: Request) {
  try {
    const { query, deepScan = false } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const queryType = classifyQuery(query);

    // Run original OSINT engines
    const socialProfiles = await scanSocialMedia(query);
    const breaches = await checkBreaches(query);

    // Extended intelligence data
    const extendedIntel: Record<string, any> = {
      github: null,
      email: null,
      ip: null,
      domain: null,
      socialScan: null,
      virusTotal: null,
      shodan: null
    };

    // Run new OSINT modules based on query type
    const osintPromises: Promise<void>[] = [];

    // Always run GitHub check for usernames
    if (queryType === 'username') {
      osintPromises.push(
        getGitHubIntel(query)
          .then(data => { extendedIntel.github = data; })
          .catch(e => console.error('GitHub Intel error:', e))
      );

      // Real social profile scanning
      osintPromises.push(
        scanSocialProfiles(query)
          .then(data => { extendedIntel.socialScan = data; })
          .catch(e => console.error('Social scan error:', e))
      );
    }

    // Email-specific checks
    if (queryType === 'email') {
      const [localPart, domain] = query.split('@');

      osintPromises.push(
        Promise.all([verifyEmail(query), checkEmailBreach(query)])
          .then(([verification, breachResult]) => {
            extendedIntel.email = { verification, breachCheck: breachResult };
          })
          .catch(e => console.error('Email Intel error:', e))
      );

      // Check domain for email
      osintPromises.push(
        getDomainIntel(domain)
          .then(data => { extendedIntel.domain = data; })
          .catch(e => console.error('Domain Intel error:', e))
      );

      // Check username from email
      osintPromises.push(
        getGitHubIntel(localPart)
          .then(data => { if (data.profile) extendedIntel.github = data; })
          .catch(e => console.error('GitHub (email username) error:', e))
      );
    }

    // IP-specific checks
    if (queryType === 'ip') {
      osintPromises.push(
        getIPGeolocation(query)
          .then(data => { extendedIntel.ip = data; })
          .catch(e => console.error('IP Intel error:', e))
      );

      // Deep scan: VirusTotal + Shodan
      if (deepScan) {
        osintPromises.push(
          analyzeWithVirusTotal(query)
            .then(data => { extendedIntel.virusTotal = data; })
            .catch(e => console.error('VirusTotal error:', e))
        );

        osintPromises.push(
          shodanLookupIP(query)
            .then(data => { extendedIntel.shodan = data; })
            .catch(e => console.error('Shodan error:', e))
        );
      }
    }

    // Domain-specific checks
    if (queryType === 'domain') {
      osintPromises.push(
        getDomainIntel(query)
          .then(data => { extendedIntel.domain = data; })
          .catch(e => console.error('Domain Intel error:', e))
      );

      // Deep scan: VirusTotal + Shodan
      if (deepScan) {
        osintPromises.push(
          analyzeWithVirusTotal(query)
            .then(data => { extendedIntel.virusTotal = data; })
            .catch(e => console.error('VirusTotal error:', e))
        );

        osintPromises.push(
          shodanLookupDomain(query)
            .then(data => { extendedIntel.shodan = data; })
            .catch(e => console.error('Shodan error:', e))
        );
      }
    }

    // Wait for all OSINT modules
    await Promise.all(osintPromises);

    // Merge real social scan results with existing profiles
    if (extendedIntel.socialScan?.profiles) {
      const existingPlatforms = new Set(socialProfiles.map(p => p.platform.toLowerCase()));

      for (const profile of extendedIntel.socialScan.profiles) {
        if (profile.exists && !existingPlatforms.has(profile.platform.toLowerCase())) {
          socialProfiles.push({
            platform: profile.platform,
            username: profile.username,
            url: profile.url,
            profileUrl: profile.url,
            confidence: 95, // High confidence for direct URL check
            notes: profile.bio || 'Profile verified via direct check',
            avatarUrl: profile.avatarUrl,
            lastActive: undefined
          });
        }
      }
    }

    // Add GitHub as a profile if found
    if (extendedIntel.github?.profile) {
      const gh = extendedIntel.github.profile;
      const existingGH = socialProfiles.find(p => p.platform.toLowerCase() === 'github');
      if (!existingGH) {
        socialProfiles.push({
          platform: 'GitHub',
          username: gh.username,
          url: gh.profileUrl,
          profileUrl: gh.profileUrl,
          confidence: 100,
          notes: gh.bio || `${gh.publicRepos} repos, ${gh.followers} followers`,
          avatarUrl: gh.avatarUrl,
          lastActive: gh.updatedAt
        });
      }
    }

    // Calculate threat score with extended intel
    let threatScore = calculateThreatScore(socialProfiles, breaches, queryType);

    // Adjust threat score based on extended intel
    if (extendedIntel.email?.breachCheck?.breached) {
      threatScore = Math.min(100, threatScore + 20);
    }
    if (extendedIntel.ip?.isVPN) {
      threatScore = Math.min(100, threatScore + 15);
    }
    if (extendedIntel.ip?.isTor) {
      threatScore = Math.min(100, threatScore + 30);
    }
    if (extendedIntel.virusTotal?.detected) {
      threatScore = Math.min(100, threatScore + 25 + extendedIntel.virusTotal.positives);
    }
    if (extendedIntel.domain?.whois?.isNewDomain) {
      threatScore = Math.min(100, threatScore + 15);
    }
    if (extendedIntel.shodan?.vulns?.length > 0) {
      threatScore = Math.min(100, threatScore + 20);
    }

    const timeline = buildTimeline(socialProfiles, breaches);

    // Build Graph (Basic Star Topology for V1)
    const nodes: EvidenceNode[] = [
      {
        id: 'root',
        type: 'person',
        label: query,
        data: { queryType },
        source: 'Input',
        timestamp: new Date().toISOString(),
        hash: generateHash(query)
      }
    ];

    const edges: EvidenceEdge[] = [];

    socialProfiles.forEach((p, idx) => {
      const nodeId = `soc-${idx}`;
      nodes.push({
        id: nodeId,
        type: 'account',
        label: `${p.platform}: ${p.username}`,
        data: p,
        source: 'OSINT',
        timestamp: new Date().toISOString(),
        hash: generateHash(p)
      });
      edges.push({
        id: `e-root-${nodeId}`,
        source: 'root',
        target: nodeId,
        label: 'owns',
        confidence: p.confidence
      });
    });

    breaches.forEach((b, idx) => {
      const nodeId = `br-${idx}`;
      nodes.push({
        id: nodeId,
        type: 'document',
        label: `Breach: ${b.domain}`,
        data: b,
        source: 'Breach DB',
        timestamp: b.date,
        hash: generateHash(b)
      });
      edges.push({
        id: `e-root-${nodeId}`,
        source: 'root',
        target: nodeId,
        label: 'exposed_in',
        confidence: 100
      });
    });

    // Add IP node if detected
    if (extendedIntel.ip) {
      const ipNode: EvidenceNode = {
        id: 'ip-1',
        type: 'ip',
        label: `IP: ${query}`,
        data: extendedIntel.ip,
        source: 'IP Intel',
        timestamp: new Date().toISOString(),
        hash: generateHash(extendedIntel.ip)
      };
      nodes.push(ipNode);
      edges.push({
        id: 'e-root-ip',
        source: 'root',
        target: 'ip-1',
        label: 'resolves_to',
        confidence: 100
      });
    }

    // Add GitHub commit emails as nodes
    if (extendedIntel.github?.commitEmails?.length > 0) {
      extendedIntel.github.commitEmails.forEach((email: any, idx: number) => {
        const nodeId = `email-${idx}`;
        nodes.push({
          id: nodeId,
          type: 'account',
          label: `Email: ${email.email}`,
          data: email,
          source: 'GitHub Commits',
          timestamp: new Date().toISOString(),
          hash: generateHash(email)
        });
        edges.push({
          id: `e-root-${nodeId}`,
          source: 'root',
          target: nodeId,
          label: 'leaked_email',
          confidence: 90
        });
      });
    }

    const newCase: InvestigationCase = {
      id: generateId(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: 'analyzing',
      query,
      queryType,
      threatScore,
      socialProfiles,
      breaches,
      evidenceGraph: { nodes, edges },
      timeline,
      chainOfCustody: [],
      tags: [queryType, threatScore > 50 ? 'high-risk' : 'low-risk']
    };

    // Add extended intel to case data
    (newCase as any).extendedIntel = extendedIntel;

    // Log Creation
    newCase.chainOfCustody.push(createCustodyLog('collected', 'System', 'Initial data collection complete', newCase));

    // Add logs for each intel module that returned data
    if (extendedIntel.github?.profile) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'GitHub Intel', `GitHub profile found: ${extendedIntel.github.profile.username}`, extendedIntel.github));
    }
    if (extendedIntel.email?.verification) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'Email Intel', `Email verified: ${extendedIntel.email.verification.valid ? 'Valid' : 'Invalid'}`, extendedIntel.email));
    }
    if (extendedIntel.ip) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'IP Intel', `IP location: ${extendedIntel.ip.city}, ${extendedIntel.ip.country}`, extendedIntel.ip));
    }
    if (extendedIntel.domain?.whois) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'WHOIS Intel', `Domain registered: ${extendedIntel.domain.whois.creationDate}`, extendedIntel.domain));
    }
    if (extendedIntel.virusTotal) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'VirusTotal', `Threat analysis: ${extendedIntel.virusTotal.riskLevel}`, extendedIntel.virusTotal));
    }
    if (extendedIntel.shodan) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'Shodan', `Device scan complete`, extendedIntel.shodan));
    }
    if (extendedIntel.socialScan) {
      newCase.chainOfCustody.push(createCustodyLog('analyzed', 'Social Scanner', `${extendedIntel.socialScan.totalFound}/${extendedIntel.socialScan.totalChecked} profiles found`, extendedIntel.socialScan));
    }

    // Generate Initial Report
    newCase.report = generateReport(newCase);
    newCase.chainOfCustody.push(createCustodyLog('analyzed', 'System', 'Automated report generated', newCase.report));

    await db.saveCase(newCase);

    return NextResponse.json(newCase);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Investigation failed' }, { status: 500 });
  }
}