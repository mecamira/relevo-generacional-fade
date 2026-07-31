const SESSION_KEY = 'fade_relevo_session'
const CREDENTIALS_KEY = 'fade_relevo_credentials'

// Default credentials — user can change password from Settings
const DEFAULT_USER = 'fade'
const DEFAULT_PASS = 'Relevo2024!'

function getCredentials() {
  const stored = localStorage.getItem(CREDENTIALS_KEY)
  if (stored) return JSON.parse(stored)
  return { username: DEFAULT_USER, password: DEFAULT_PASS }
}

export function login(username, password) {
  const creds = getCredentials()
  if (username === creds.username && password === creds.password) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, loginAt: Date.now() }))
    return true
  }
  return false
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated() {
  return !!sessionStorage.getItem(SESSION_KEY)
}

export function getSession() {
  const s = sessionStorage.getItem(SESSION_KEY)
  return s ? JSON.parse(s) : null
}

export function changePassword(currentPassword, newPassword) {
  const creds = getCredentials()
  if (currentPassword !== creds.password) return false
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ ...creds, password: newPassword }))
  return true
}

export function getUsername() {
  return getCredentials().username
}
