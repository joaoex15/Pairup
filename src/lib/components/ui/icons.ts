// $lib/components/ui/icons.ts
// Ícones repetidos pelas telas. `fill: true` = preenchido; senão, só contorno.
export interface IconDef {
    viewBox: string;
    d:       string;
    fill?:   boolean;
}

export const ICONS = {
    x:           { viewBox: '0 0 24 24', d: 'M6 18L18 6M6 6l12 12' },
    chevronLeft: { viewBox: '0 0 24 24', d: 'M15 19l-7-7 7-7' },
    chevronRight:{ viewBox: '0 0 24 24', d: 'M9 5l7 7-7 7' },
    heart:       { viewBox: '0 0 24 24', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    star:        { viewBox: '0 0 24 24', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    user:        { viewBox: '0 0 24 24', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    filter:      { viewBox: '0 0 24 24', d: 'M3 4h18M7 12h10M11 20h2' },
    logout:      { viewBox: '0 0 24 24', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
    funnel:      { viewBox: '0 0 20 20', fill: true, d: 'M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4-2A1 1 0 018 15v-4.586L3.293 6.707A1 1 0 013 6V3z' },
    info:        { viewBox: '0 0 20 20', fill: true, d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' },
    alert:       { viewBox: '0 0 20 20', fill: true, d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z' },
    check:       { viewBox: '0 0 20 20', fill: true, d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
