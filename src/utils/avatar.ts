/**
 * Avatars matched to the person's recorded gender. The seed is the person's
 * name, so the same person gets the same face on every screen (doctor list,
 * staff directory, header). No Male/Female on record → initials, not a guess.
 */

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

// ponytail: randomuser.me demo portraits (100 per gender), so two people can
// share a face. Real staff and patient photos replace this with uploads.
export function avatarFor(name: string, gender?: string): string {
  if (gender === 'Male' || gender === 'Female') {
    const n = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 100;
    return `https://randomuser.me/api/portraits/${gender === 'Male' ? 'men' : 'women'}/${n}.jpg`;
  }
  return initialsAvatar(name);
}

/** Initials on a coloured tile — drawn locally, so no third-party service sees the name. */
export function initialsAvatar(name: string): string {
  const initials = name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#6366f1"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="38" font-weight="600" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
