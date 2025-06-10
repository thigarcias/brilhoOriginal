export interface User {
  idUnico: string
  company: string
  name?: string
  email?: string
  [key: string]: any
}

export interface AuthData {
  user: User
  timestamp: number
}

export class AuthManager {
  private static readonly USER_KEY = 'user'
  private static readonly TIMESTAMP_KEY = 'loginTimestamp'
  private static readonly ID_UNICO_KEY = 'brandplot_idUnico'
  private static readonly LOGIN_DURATION = 8 * 60 * 60 * 1000 // 8 horas em millisegundos

  /**
   * Salva dados do usuário logado com timestamp
   */
  static setUser(user: User): void {
    if (typeof window === 'undefined') return

    const timestamp = Date.now()
    
    localStorage.setItem(AuthManager.USER_KEY, JSON.stringify(user))
    localStorage.setItem(AuthManager.TIMESTAMP_KEY, timestamp.toString())
    
    if (user.idUnico) {
      localStorage.setItem(AuthManager.ID_UNICO_KEY, user.idUnico)
    }
  }

  /**
   * Recupera dados do usuário se ainda estão válidos
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null

    try {
      const userStr = localStorage.getItem(AuthManager.USER_KEY)
      const timestampStr = localStorage.getItem(AuthManager.TIMESTAMP_KEY)

      if (!userStr || !timestampStr) {
        return null
      }

      const user = JSON.parse(userStr)
      const timestamp = parseInt(timestampStr)
      const currentTime = Date.now()

      // Verifica se o login expirou
      if (currentTime - timestamp > AuthManager.LOGIN_DURATION) {
        console.log('Login expirado após 8 horas, fazendo logout automático')
        AuthManager.clearUser()
        return null
      }

      return user
    } catch (e) {
      console.error('Erro ao recuperar dados do usuário:', e)
      AuthManager.clearUser()
      return null
    }
  }

  /**
   * Verifica se o usuário está logado e o login ainda é válido
   */
  static isLoggedIn(): boolean {
    return AuthManager.getUser() !== null
  }

  /**
   * Limpa todos os dados de autenticação
   */
  static clearUser(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(AuthManager.USER_KEY)
    localStorage.removeItem(AuthManager.TIMESTAMP_KEY)
    localStorage.removeItem(AuthManager.ID_UNICO_KEY)
  }

  /**
   * Verifica se o login está próximo da expiração (última hora)
   */
  static isLoginNearExpiration(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const timestampStr = localStorage.getItem(AuthManager.TIMESTAMP_KEY)
      if (!timestampStr) return false

      const timestamp = parseInt(timestampStr)
      const currentTime = Date.now()
      const timeElapsed = currentTime - timestamp
      const timeRemaining = AuthManager.LOGIN_DURATION - timeElapsed

      // Retorna true se restam menos de 1 hora
      return timeRemaining > 0 && timeRemaining < 60 * 60 * 1000
    } catch (e) {
      return false
    }
  }

  /**
   * Renova o timestamp de login (útil para atividade do usuário)
   */
  static renewLogin(): boolean {
    if (typeof window === 'undefined') return false

    const user = AuthManager.getUser()
    if (!user) return false

    // Apenas renova o timestamp se o login ainda é válido
    localStorage.setItem(AuthManager.TIMESTAMP_KEY, Date.now().toString())
    return true
  }

  /**
   * Retorna o tempo restante de login em millisegundos
   */
  static getTimeRemaining(): number {
    if (typeof window === 'undefined') return 0

    try {
      const timestampStr = localStorage.getItem(AuthManager.TIMESTAMP_KEY)
      if (!timestampStr) return 0

      const timestamp = parseInt(timestampStr)
      const currentTime = Date.now()
      const timeElapsed = currentTime - timestamp
      const timeRemaining = AuthManager.LOGIN_DURATION - timeElapsed

      return Math.max(0, timeRemaining)
    } catch (e) {
      return 0
    }
  }
} 