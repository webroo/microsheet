export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

export const coerceStringToNumber = n => (isNumber(n) ? parseFloat(n) : n);
