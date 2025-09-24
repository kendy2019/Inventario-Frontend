// Utilidades para manejo de autenticación

export interface User {
  id: string
  username: string
  email?: string
  roles?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Función para obtener el token del localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Función para guardar el token
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token)
  }
}

// Función para eliminar el token (logout)
export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
  }
}

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return token !== null && token !== ""
}

// Función para hacer peticiones autenticadas a la API
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Función para logout
export const logout = (): void => {
  removeAuthToken()
  window.location.href = "/"
}
