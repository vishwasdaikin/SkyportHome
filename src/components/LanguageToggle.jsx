import { useCallback, useEffect, useRef, useState } from 'react'
import './LanguageToggle.css'

const STORAGE_KEY = 'skyport-site-lang'
/** Google Website Translator host — on `document.body` once (outside React) for Strict Mode safety. */
const WIDGET_HOST_ID = 'google_translate_element'

function isVitestOrTest() {
  return import.meta.env.MODE === 'test' || import.meta.env.VITEST === true
}

function getTranslateCombo() {
  return document.querySelector('.goog-te-combo')
}

function openGoogleTranslateNewTab() {
  if (typeof window === 'undefined') return
  const url = `https://translate.google.com/translate?sl=auto&tl=ja&u=${encodeURIComponent(window.location.href)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function setComboToJapanese() {
  const combo = getTranslateCombo()
  if (!combo) return false
  const ja = Array.from(combo.options).find((o) => o.value === 'ja')
  if (!ja) return false
  combo.value = 'ja'
  combo.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

function setComboToOriginal() {
  const combo = getTranslateCombo()
  if (!combo) return false
  const blank = Array.from(combo.options).find((o) => !o.value)
  if (blank) {
    combo.value = ''
  } else {
    combo.selectedIndex = 0
  }
  combo.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

/**
 * Inline Google Website Translator — EN / 日本語 toggles drive `.goog-te-combo`.
 * If the widget never injects (blockers, rare layout issues), 日本語 falls back to opening
 * Google Translate in a new tab so the control is never a dead end.
 */
export default function LanguageToggle() {
  const skipExternal = typeof window === 'undefined' || isVitestOrTest()
  /** Combo detected — auto-restore JP from localStorage; improves 日本語 tooltip once wired. */
  const [comboReady, setComboReady] = useState(skipExternal)
  const japanRetryRef = useRef(null)
  const [activeLang, setActiveLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ja' ? 'ja' : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    if (skipExternal) return undefined

    let pollId = null
    let cancelled = false

    function ensureHost() {
      let host = document.getElementById(WIDGET_HOST_ID)
      if (!host) {
        host = document.createElement('div')
        host.id = WIDGET_HOST_ID
        host.className = 'lang-toggle-widget-host'
        host.setAttribute('aria-hidden', 'true')
        document.body.appendChild(host)
      }
      return host
    }

    function pollForCombo() {
      let n = 0
      pollId = window.setInterval(() => {
        if (cancelled) return
        n += 1
        if (getTranslateCombo()) {
          window.clearInterval(pollId)
          pollId = null
          setComboReady(true)
          try {
            if (localStorage.getItem(STORAGE_KEY) === 'ja') {
              window.requestAnimationFrame(() => setComboToJapanese())
            }
          } catch {
            /* ignore */
          }
        } else if (n > 200) {
          window.clearInterval(pollId)
          pollId = null
        }
      }, 100)
    }

    function initWidget() {
      const host = ensureHost()
      if (!window.google?.translate?.TranslateElement) return
      if (host.dataset.skyportTranslateMounted === '1') {
        pollForCombo()
        return
      }
      host.innerHTML = ''
      try {
        // VERTICAL reliably injects `.goog-te-combo`; SIMPLE often does not.
        // eslint-disable-next-line no-new -- Google API is constructor-only
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'ja',
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
          },
          WIDGET_HOST_ID,
        )
        host.dataset.skyportTranslateMounted = '1'
      } catch (e) {
        console.warn('[LanguageToggle] TranslateElement failed', e)
        return
      }
      pollForCombo()
    }

    window.googleTranslateElementInit = () => {
      if (cancelled) return
      initWidget()
    }

    if (window.google?.translate?.TranslateElement) {
      initWidget()
    } else {
      let script = document.getElementById('google-translate-script')
      if (!script) {
        script = document.createElement('script')
        script.id = 'google-translate-script'
        script.async = true
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
        script.onerror = () => {
          console.warn('[LanguageToggle] Failed to load Google Translate script')
        }
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      if (pollId != null) window.clearInterval(pollId)
    }
  }, [skipExternal])

  useEffect(() => {
    return () => {
      if (japanRetryRef.current != null) {
        window.clearInterval(japanRetryRef.current)
        japanRetryRef.current = null
      }
    }
  }, [])

  const selectEnglish = useCallback(() => {
    setActiveLang('en')
    try {
      localStorage.setItem(STORAGE_KEY, 'en')
    } catch {
      /* ignore */
    }
    if (skipExternal) return
    setComboToOriginal()
  }, [skipExternal])

  const selectJapanese = useCallback(() => {
    setActiveLang('ja')
    try {
      localStorage.setItem(STORAGE_KEY, 'ja')
    } catch {
      /* ignore */
    }
    if (skipExternal) return
    if (setComboToJapanese()) return
    if (japanRetryRef.current != null) {
      window.clearInterval(japanRetryRef.current)
      japanRetryRef.current = null
    }
    let tries = 0
    japanRetryRef.current = window.setInterval(() => {
      tries += 1
      if (setComboToJapanese()) {
        if (japanRetryRef.current != null) window.clearInterval(japanRetryRef.current)
        japanRetryRef.current = null
        setComboReady(true)
      } else if (tries >= 25) {
        if (japanRetryRef.current != null) window.clearInterval(japanRetryRef.current)
        japanRetryRef.current = null
        openGoogleTranslateNewTab()
      }
    }, 120)
  }, [skipExternal])

  return (
    <div className="lang-toggle-wrap notranslate" role="group" aria-label="Site language">
      <button
        type="button"
        className={`lang-toggle-btn ${activeLang === 'en' ? 'lang-toggle-btn--active' : ''}`}
        onClick={selectEnglish}
        title="Show this page in English"
        lang="en"
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-toggle-btn ${activeLang === 'ja' ? 'lang-toggle-btn--active' : ''}`}
        onClick={selectJapanese}
        title={
          comboReady
            ? 'このページを日本語で表示'
            : 'このページを日本語で表示（読み込み後に反映。ブロックされている場合は別タブで開きます）'
        }
        lang="ja"
      >
        日本語
      </button>
    </div>
  )
}
