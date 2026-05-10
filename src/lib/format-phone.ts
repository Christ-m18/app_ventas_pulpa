/**
 * Formats a raw digit string (or already-formatted phone) into +1 (XXX) XXX-XXXX
 */
export function formatPhone(digits: string): string {
  let d = digits.replace(/\D/g, "");

  if (d.startsWith("1") && d.length > 10) {
    d = d.slice(0, 11);
  } else {
    d = d.slice(0, 10);
  }

  const hasCountry = d.startsWith("1") && d.length > 10;
  const countryCode = "1";
  const local = hasCountry ? d.slice(1) : d;

  if (local.length === 0) return "";
  if (local.length <= 3) return `+${countryCode} (${local}`;
  if (local.length <= 6) return `+${countryCode} (${local.slice(0, 3)}) ${local.slice(3)}`;
  return `+${countryCode} (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
}
