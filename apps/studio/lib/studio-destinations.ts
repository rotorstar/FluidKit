export const studioDestinations = [
  { href: '/', title: 'homeTitle', group: 'explore', description: 'homeDescription' },
  { href: '/studio/flows', title: 'flowsTitle', group: 'explore', description: 'flowsDescription' },
  { href: '/studio/simulations/real-estate', title: 'casesTitle', group: 'explore', description: 'casesDescription' },
  { href: '/studio/authoring', title: 'authorTitle', group: 'design', description: 'authorDescription' },
  { href: '/studio/transitions', title: 'transitionsTitle', group: 'design', description: 'transitionsDescription' },
  { href: '/studio/rehearsal', title: 'rehearsalTitle', group: 'verify', description: 'rehearsalDescription' },
  { href: '/studio/behaviors', title: 'behaviorsTitle', group: 'verify', description: 'behaviorsDescription' },
  { href: '/studio/acceptance', title: 'acceptanceTitle', group: 'evidence', description: 'acceptanceDescription' },
  { href: '/studio/m7', title: 'm7Title', group: 'evidence', description: 'm7Description' },
  { href: '/studio/m8', title: 'm8Title', group: 'evidence', description: 'm8Description' },
] as const;
export const studioGroups = ['explore', 'design', 'verify', 'evidence'] as const;
