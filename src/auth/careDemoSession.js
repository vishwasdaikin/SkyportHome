/** Demo-only: sessionStorage gate so logout returns to the SkyportCare login flow. */
const KEY = 'skyport-care-demo-auth'

export function isCareDemoAuthenticated() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setCareDemoAuthenticated(value) {
  try {
    if (value) sessionStorage.setItem(KEY, '1')
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ignore quota / private mode */
  }
}
