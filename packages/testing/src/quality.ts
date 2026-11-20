import { DESIGN_TOKENS, QualityCheckSchema, QualityReportSchema, type QualityCheck, type QualityContext, type QualityFinding, type QualityReport, type TextAudit } from '@fluidkit/contracts';

export function measuredCheck(id: string, source: QualityCheck['source'], title: string, checked: number, findings: QualityFinding[]): QualityCheck {
  return QualityCheckSchema.parse({ id, source, title, checked, findings,
    status: findings.some(finding => finding.severity === 'error') ? 'failed' : checked > 0 ? 'passed' : 'not-checked',
    ...(checked === 0 && !findings.some(finding => finding.severity === 'error') ? { reason: 'Keine prüfbaren Elemente in diesem Zustand.' } : {}),
  });
}
export function openCheck(id: string, source: QualityCheck['source'], title: string, reason: string, status: 'not-checked' | 'unsupported' = 'not-checked'): QualityCheck {
  return QualityCheckSchema.parse({ id, source, title, reason, status, checked: 0, findings: [] });
}
export function createQualityReport(context: QualityContext, checks: QualityCheck[], tools: QualityReport['tools'] = {}): QualityReport {
  return QualityReportSchema.parse({ schemaVersion: 1, generatedAt: new Date().toISOString(), context, tools, checks });
}
export function summarizeQuality(report: QualityReport) {
  const findings = report.checks.flatMap(check => check.findings);
  const errors = findings.filter(finding => finding.severity === 'error').length;
  const warnings = findings.filter(finding => finding.severity === 'warning').length;
  const open = report.checks.filter(check => check.status === 'not-checked' || check.status === 'unsupported').length;
  return { errors, warnings, open, status: errors > 0 ? 'failed' : open > 0 ? 'incomplete' : 'passed' } as const;
}
export function textAuditCheck(audit: TextAudit): QualityCheck {
  return measuredCheck('gpu-text-geometry', 'gpu', 'GPU-Text: Überlappung, Überlauf und Glyphen', audit.checkedNodes,
    audit.issues.map(issue => ({ rule: issue.kind, severity: issue.severity, message: issue.detail, target: { nodes: issue.nodes } })));
}
export function replayReadabilityCheck(audit: TextAudit): QualityCheck {
  return measuredCheck('gpu-replay-scale', 'gpu', 'Lesbarkeit bei Replay-Skalierung', 1, audit.scale < 0.8 ? [{
    rule: 'scaled-recording', severity: 'warning', target: { nodes: ['surface'] },
    message: `Die Aufzeichnung wird auf ${Math.round(audit.scale * 100)} % verkleinert. Für eine Lesbarkeitsabnahme Originalgröße oder Live-Layout verwenden.`,
  }] : []);
}
export function gpuReadabilityCheck(audit: TextAudit): QualityCheck {
  if (audit.textStyles.length === 0) return openCheck('gpu-readability', 'gpu', 'Sichtbare GPU-Schriftgrößen', 'Für diesen Frame liegen keine Schriftgrößen vor.');
  return measuredCheck('gpu-readability', 'gpu', 'Sichtbare GPU-Schriftgrößen', audit.textStyles.length,
    audit.textStyles.filter(style => style.fontSize < DESIGN_TOKENS.captionPx - 0.05).map(style => ({
      rule: 'minimum-caption-size', severity: 'warning',
      message: `${style.fontSize.toLocaleString('de-DE', { maximumFractionDigits: 1 })} CSS-px unterschreiten die gewählte Caption-Rolle von ${DESIGN_TOKENS.captionPx} px.`,
      target: { componentId: style.componentId, part: style.part, nodes: [style.id] },
    })));
}
