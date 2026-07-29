export const splitEntries = (draft) => draft
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
