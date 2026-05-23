import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import zh from './zh'
import en from './en'
import es from './es'

export type Language = 'zh' | 'en' | 'es'

// 递归将所有叶子节点类型放宽为 string，避免字面量冲突
type DeepString<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: DeepString<T[K]> }
  : T

// 翻译字典类型
type Translations = DeepString<typeof zh>

// Context 类型
interface LanguageContextType {
  lang: Language
  t: Translations
  setLang: (lang: Language) => void
  cycleLang: () => void   // 三语循环切换 en→zh→es→en
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: en as unknown as Translations,
  setLang: () => {},
  cycleLang: () => {},
})

const STORAGE_KEY = 'qingli_lang'

// 翻译字典映射
const translations: Record<Language, Translations> = {
  zh: zh as unknown as Translations,
  en: en as unknown as Translations,
  es: es as unknown as Translations,
}

// 三语循环顺序
const LANG_CYCLE: Language[] = ['en', 'zh', 'es']

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en' || stored === 'es') return stored as Language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('zh')) return 'zh'
    if (browserLang.startsWith('es')) return 'es'
    return 'en'
  })

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }

  // 三语循环切换：en → zh → es → en
  const cycleLang = () => {
    const idx = LANG_CYCLE.indexOf(lang)
    const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]
    setLang(next)
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, cycleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

/** 在任意组件中使用：const { t, lang, setLang, cycleLang } = useLang() */
export function useLang() {
  return useContext(LanguageContext)
}
