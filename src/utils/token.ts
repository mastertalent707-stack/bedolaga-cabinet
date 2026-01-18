/**
 * Утилиты для безопасной работы с JWT токенами
 */

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'user',
  TELEGRAM_INIT: 'telegram_init_data',
} as const

interface JWTPayload {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: unknown
}

/**
 * Декодирует JWT токен без верификации подписи
 * Используется только для чтения payload на клиенте
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Проверяет, истёк ли срок действия токена
 * @param token JWT токен
 * @param bufferSeconds Буфер в секундах до истечения (по умолчанию 30 сек)
 */
export function isTokenExpired(token: string | null, bufferSeconds = 30): boolean {
  if (!token) return true

  const payload = decodeJWT(token)
  if (!payload?.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + bufferSeconds
}

/**
 * Проверяет, валиден ли токен (не истёк и корректный формат)
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false
  return !isTokenExpired(token)
}

/**
 * Безопасное хранилище токенов
 * Использует sessionStorage вместо localStorage для защиты от XSS
 * Токены не сохраняются между сессиями браузера
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEYS.ACCESS)
    } catch {
      return null
    }
  },

  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEYS.REFRESH)
    } catch {
      return null
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
      sessionStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)
    } catch {
      console.error('Failed to save tokens to sessionStorage')
    }
  },

  setAccessToken(accessToken: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
    } catch {
      console.error('Failed to save access token to sessionStorage')
    }
  },

  clearTokens(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEYS.ACCESS)
      sessionStorage.removeItem(TOKEN_KEYS.REFRESH)
      sessionStorage.removeItem(TOKEN_KEYS.USER)
      // Также очищаем localStorage для миграции со старой версии
      localStorage.removeItem(TOKEN_KEYS.ACCESS)
      localStorage.removeItem(TOKEN_KEYS.REFRESH)
      localStorage.removeItem(TOKEN_KEYS.USER)
    } catch {
      // ignore
    }
  },

  /**
   * Миграция токенов из localStorage в sessionStorage
   * Вызывается при инициализации для обратной совместимости
   */
  migrateFromLocalStorage(): void {
    try {
      const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS)
      const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH)

      if (accessToken && !sessionStorage.getItem(TOKEN_KEYS.ACCESS)) {
        sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
      }
      if (refreshToken && !sessionStorage.getItem(TOKEN_KEYS.REFRESH)) {
        sessionStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)
      }

      // Удаляем из localStorage после миграции
      localStorage.removeItem(TOKEN_KEYS.ACCESS)
      localStorage.removeItem(TOKEN_KEYS.REFRESH)
    } catch {
      // ignore
    }
  },

  getTelegramInitData(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEYS.TELEGRAM_INIT)
    } catch {
      return null
    }
  },

  setTelegramInitData(data: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEYS.TELEGRAM_INIT, data)
    } catch {
      // ignore
    }
  },
}
