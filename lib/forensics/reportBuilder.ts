import { InvestigationCase, InvestigationReport, ReportSection } from '@root/types/investigation';
import { generateId } from './hashUtils';

export function generateReport(c: InvestigationCase): InvestigationReport {

  const summarySection: ReportSection = {
    title: 'Executive Summary',
    content: `<p>TraceLens AI has completed a forensic analysis of the target <strong>${c.query}</strong>. The system identified <strong>${c.breaches.length}</strong> data breaches and <strong>${c.socialProfiles.length}</strong> associated social media profiles. The calculated threat score is <strong>${c.threatScore}/100</strong>.</p>`,
    type: 'summary'
  };

  const threatSection: ReportSection = {
    title: 'Threat Assessment',
    content: `
      <ul>
        <li><strong>Threat Score:</strong> ${c.threatScore} / 100</li>
        <li><strong>Risk Level:</strong> ${c.threatScore > 50 ? 'HIGH' : 'MEDIUM'}</li>
        <li><strong>Exposure:</strong> ${c.breaches.length} confirmed breaches.</li>
      </ul>
    `,
    type: 'details'
  };

  const recSection: ReportSection = {
    title: 'Recommendations',
    content: `
      <ol>
        <li>Immediately rotate passwords for exposed accounts.</li>
        <li>Enable 2FA on all identified social platforms.</li>
        <li>Monitor accounts for suspicious activity linked to ${c.query}.</li>
      </ol>
    `,
    type: 'recommendation'
  };

  return {
    id: c.id,
    caseId: c.id,
    generatedAt: new Date().toISOString(),
    title: `Forensic Report: ${c.query}`,
    summary: `Analysis of ${c.query} completed with Threat Score ${c.threatScore}.`,
    sections: [summarySection, threatSection, recSection],
    classificationLevel: 'CONFIDENTIAL'
  };
}
