// $lib/utils/uid.ts

/** Id único para ligar <label for> ao campo. */
export const uid = (prefixo = 'campo'): string => `${prefixo}-${Math.random().toString(36).slice(2, 9)}`;
