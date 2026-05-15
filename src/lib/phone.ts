/**
 * phone.ts  ─  Frontend phone utilities (Egypt only)
 * Egypt mobile operators: Vodafone (010), WE (011), Orange (012), Etisalat (015)
 */

export const EGYPT_COUNTRY = {
  name: 'مصر',
  code: '+20',
  flag: '🇪🇬',
  placeholder: '01XXXXXXXXX',
  digits: 11,           // local number length including leading 0
  pattern: /^01[0125]\d{8}$/,
} as const;

/** Build full E.164 from local Egyptian number */
export function buildPhone(local: string): string {
  // Strip leading 0 if present, then prepend +20
  const stripped = local.startsWith('0') ? local.slice(1) : local;
  return `+20${stripped}`;
}

/** Display-friendly format: "🇪🇬 +20 010 1234 5678" */
export function formatPhoneDisplay(e164: string): string {
  if (!e164.startsWith('+20')) return e164;
  const local = e164.slice(3); // strip "+20"
  return `🇪🇬 +20 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
}
