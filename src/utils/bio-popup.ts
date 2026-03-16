import type { BioFarm } from '../types';

export function renderBioPopupHTML(farm: BioFarm): string {
  const prods = farm.productions.slice(0, 6).join(', ');
  const more = farm.productions.length > 6
    ? ` (+${farm.productions.length - 6})`
    : '';

  const statusLabel = farm.status === 'AB'
    ? 'Certifie AB'
    : farm.status === 'C1'
      ? 'En conversion 1ere annee'
      : farm.status === 'C2'
        ? 'En conversion 2e annee'
        : farm.status === 'C3'
          ? 'En conversion 3e annee'
          : farm.status;

  const statusColor = farm.status === 'AB' ? '#059669' : '#d97706';

  return `
    <div style="min-width:180px;max-width:260px;font-family:Inter,system-ui,sans-serif;">
      <div style="font-weight:600;font-size:13px;color:#1f2937;margin-bottom:4px;">${farm.nom}</div>
      <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">${farm.ville} (${farm.dept})</div>
      <div style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;color:white;background:${statusColor};margin-bottom:6px;">${statusLabel}</div>
      <div style="font-size:11px;color:#374151;line-height:1.4;">
        <span style="font-weight:500;">Productions :</span> ${prods}${more}
      </div>
    </div>
  `;
}
