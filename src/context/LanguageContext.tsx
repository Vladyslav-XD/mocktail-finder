import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocales } from 'expo-localization';
import {
  Language,
  LanguageSetting,
  Pluralize,
  Translate,
  isLanguageSetting,
  pluralize,
  resolveLanguage,
  translate,
} from '../i18n';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';

/**
 * Reads the saved choice. App.tsx awaits it with the other hydration calls, so the
 * first frame is already in the right language.
 */
export async function loadLanguageSetting(): Promise<LanguageSetting> {
  const saved = await loadJson<LanguageSetting>(STORAGE_KEYS.language, 'system');
  return isLanguageSetting(saved) ? saved : 'system';
}

interface LanguageContextType {
  /** The language actually in use, after 'system' is resolved. */
  lang: Language;
  setting: LanguageSetting;
  setSetting: (next: LanguageSetting) => void;
  t: Translate;
  plural: Pluralize;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setting: 'system',
  setSetting: () => {},
  t: (key, params) => translate('en', key, params),
  plural: (key, n, params) => pluralize('en', key, n, params),
});

export const LanguageProvider = ({
  children,
  initialSetting = 'system',
}: {
  children: React.ReactNode;
  initialSetting?: LanguageSetting;
}) => {
  const locales = useLocales();
  const [setting, setSettingState] = useState<LanguageSetting>(initialSetting);
  const lang = resolveLanguage(setting, locales[0]?.languageCode);

  // Fire-and-forget like the theme: a failed write must not block the switch.
  const setSetting = useCallback((next: LanguageSetting) => {
    setSettingState(next);
    saveJson(STORAGE_KEYS.language, next);
  }, []);

  const t = useCallback<Translate>((key, params) => translate(lang, key, params), [lang]);
  const plural = useCallback<Pluralize>((key, n, params) => pluralize(lang, key, n, params), [lang]);

  const value = useMemo(() => ({ lang, setting, setSetting, t, plural }), [lang, setting, setSetting, t, plural]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
