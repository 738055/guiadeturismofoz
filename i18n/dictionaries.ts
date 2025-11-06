import 'server-only';

// FORMATO CORRIGIDO
export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

export type Dictionary = typeof import('./locales/pt-BR.json');

const dictionaries = {
  // FORMATO CORRIGIDO NOS IMPORTS
  'pt-BR': () => import('./locales/pt-BR.json').then((module) => module.default),
  'en-US': () => import('./locales/en-US.json').then((module) => module.default),
  'es-ES': () => import('./locales/es-ES.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Retorna o dicionário correspondente ou o padrão (pt-BR)
  const loadDictionary = dictionaries[locale] ?? dictionaries['pt-BR'];
  return loadDictionary();
};
