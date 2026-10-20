/** Builds the HTML of the PDF report from the project and its results, in the user's language. */
import type { ProjectResults } from '@/data/hooks/useProjectResults';
import type { Preferences, Project } from '@/data/store/projectTypes';
import { colors } from '@/shared/global.styles';
import { fill, numberFormatter, stringsFor } from '@/shared/i18n';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildReportHtml(
  project: Project,
  preferences: Preferences,
  results: ProjectResults,
  generatedOn: string,
) {
  const s = stringsFor(preferences.language);
  const n = numberFormatter(preferences.language);
  const { simulation, own, shared, verdict, quality, waterCut, recommendations } = results;
  const { typical } = simulation;
  const pct = (value: number) => fill(s.common.percent, { value: n(value * 100) });
  const eur = ([low, high]: [number, number]) =>
    fill(s.common.euroRange, { low: n(low), high: n(high) });
  const yrs = ([low, high]: [number, number]) =>
    Number.isFinite(low) && low < 100
      ? fill(s.common.yearRange, { low: n(low), high: n(Math.min(high, 999)) })
      : s.common.never;
  const address = escapeHtml(project.building?.address ?? '');
  const initials = s.common.monthInitials.split('');
  const verdictText = verdict.feasible
    ? s.results.verdict[verdict.bestOption]
    : s.results.verdict.weak;

  const monthRows = typical.months
    .map(
      (month, index) =>
        `<tr><td>${initials[index]}</td><td>${n(month.rainMm)}</td><td>${n(month.inflowM3, 1)}</td><td>${n(month.demandM3, 1)}</td><td>${n(month.usedM3, 1)}</td></tr>`,
    )
    .join('');

  const recommendationRows = recommendations
    .map((item) => `<li><b>${escapeHtml(s.recommendations.items[item.key].title)}</b></li>`)
    .join('');

  const riskRows = quality.risks
    .map(
      ({ contaminant, level }) =>
        `<tr><td>${s.waterQuality.contaminants[contaminant]}</td><td>${s.common[level]}</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: ${colors.primaryText}; margin: 32px; font-size: 12px; }
  h1 { font-size: 22px; margin: 4px 0 12px; }
  h2 { font-size: 15px; margin: 22px 0 8px; color: ${colors.buttons}; }
  .brand { color: ${colors.buttons}; font-weight: 700; font-size: 12px; }
  .verdict { background: ${colors.warningBackground}; border-radius: 10px; padding: 10px 12px; }
  .grid { display: flex; gap: 8px; }
  .tile { flex: 1; background: ${colors.inactiveTab}; border-radius: 8px; padding: 8px; }
  .tile b { display: block; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border-bottom: 1px solid ${colors.cardBorder}; padding: 5px 4px; text-align: left; }
  .muted { color: ${colors.secondaryText}; }
</style></head>
<body>
  <div class="brand">${s.report.header}</div>
  <h1>${fill(s.report.for, { address })}</h1>
  <div class="verdict">${escapeHtml(verdictText)}</div>

  <h2>${s.report.sections.inputs}</h2>
  <table>
    <tr><td>${s.review.roof}</td><td>${fill(s.review.roofValue, { area: n(project.roof.areaM2), material: s.roof.materials[project.roof.material] })}</td></tr>
    <tr><td>${s.review.household}</td><td>${fill(s.data.people, { value: project.household.people })}</td></tr>
    <tr><td>${s.data.rows.price}</td><td>${n(own.pricePerM3, 2)} €/m³</td></tr>
  </table>

  <h2>${s.report.sections.balance}</h2>
  <div class="grid">
    <div class="tile">${s.report.collected}<b>${fill(s.common.cubicMetres, { value: n(typical.inflowM3) })}</b></div>
    <div class="tile">${s.report.covered}<b>${pct(typical.coverage)}</b></div>
    <div class="tile">${s.report.tank}<b>${fill(s.common.litres, { value: n(project.tankLitres) })}</b></div>
  </div>
  <table>
    <tr><th></th><th>mm</th><th>${s.month.collected} (m³)</th><th>${s.month.needed} (m³)</th><th>${s.month.used} (m³)</th></tr>
    ${monthRows}
  </table>

  <h2>${s.report.sections.tank}</h2>
  <p>${s.performance.shortage}: ${n(typical.emptyDays)} · ${s.performance.overflow}: ${fill(s.common.days, { value: n(typical.fullDays) })} · ${s.performance.fill}: ${pct(typical.averageFill)}</p>

  <h2>${s.report.sections.money}</h2>
  <p>${s.cost.total}: ${eur(own.cost)} · ${s.compare.payback}: ${yrs(own.payback)} · ${s.compare.shared}: ${yrs(shared.payback)}</p>

  <h2>${s.report.sections.quality}</h2>
  <table>${riskRows}</table>
  <p class="muted">${s.waterQuality.rules}</p>

  <h2>${s.report.sections.resilience}</h2>
  <p>${s.waterCut.autonomy}: ${fill(s.waterCut.autonomyValue, { value: n(waterCut.autonomyDays, 1) })}. ${s.waterCut.noRain}</p>

  <h2>${s.report.sections.recommendation}</h2>
  <ol>${recommendationRows}</ol>

  <p class="muted">${fill(s.report.pages, { date: generatedOn })}</p>
</body></html>`;
}
