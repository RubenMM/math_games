const AVATARS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐯', '🐵', '🐙', '🦄', '🐢', '🐳', '🦉', '🐨', '🐰', '🐧'];

/** Same name -> same emoji, so a player is recognisable on every screen. */
export function avatarFor(name: string) {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}
