import { onBeforeUnmount, ref, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

/** 与 config.ts head 中的 pre-paint 脚本必须一致。 */
export const STORAGE_KEY = 'tuningluna-blog-theme'

const DEFAULT_MODE: ThemeMode = 'dark'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_MODE
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage 不可用（隐私模式等）——使用默认值。
  }
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return DEFAULT_MODE
}

/** 把当前模式写到 <html data-theme> 与 <meta name="theme-color">。 */
function applyMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }
  // background token 解析为当前生效主题的值，浏览器 chrome 色直接读取。
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) {
    const bg = getComputedStyle(root)
      .getPropertyValue('--md-sys-color-background')
      .trim()
    meta.setAttribute('content', bg || '#ffffff')
  }
}

/**
 * 三态主题（system → light → dark），design-system 的 data-theme 机制。
 * SSR 期间 window/document 不存在：初始模式取默认 dark，首帧主题由 config head
 * 中的内联 pre-paint 脚本处理，组件只负责挂载后接管。
 */
export function useTheme() {
  const mode = ref<ThemeMode>(getInitialMode())

  watch(
    mode,
    (m) => {
      applyMode(m)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, m)
        } catch {
          // 存储不可用——本次选择不持久化即可。
        }
      }
    },
    { immediate: true },
  )

  // system 模式下 OS 主题切换时同步 theme-color。
  let mql: MediaQueryList | null = null
  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (mode.value === 'system') applyMode('system')
    }
    mql.addEventListener('change', onChange)
    onBeforeUnmount(() => mql?.removeEventListener('change', onChange))
  }

  const cycle = () => {
    mode.value =
      mode.value === 'system' ? 'light' : mode.value === 'light' ? 'dark' : 'system'
  }

  return { mode, cycle }
}
