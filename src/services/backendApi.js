// Simple backend API client for imposition endpoints
// Uses VITE_IMPOSITION_BASE_URL if provided, otherwise falls back to export server on 3001

const getBaseUrl = () => {
  const v = import.meta?.env?.VITE_IMPOSITION_BASE_URL
  if (v && typeof v === 'string' && v.trim()) return v.trim()
  return 'http://localhost:3001'
}

async function requestImposition(path, formData) {
  const base = getBaseUrl()
  const resp = await fetch(`${base}${path}`, {
    method: 'POST',
    body: formData
  })
  if (!resp.ok) {
    let msg = `HTTP ${resp.status}`
    try {
      const text = await resp.text()
      try {
        const j = JSON.parse(text)
        msg = j.error || msg
      } catch (_) {
        msg = text || msg
      }
    } catch (e) {
      // ignore parse errors and keep default message
    }
    throw new Error(msg)
  }
  return await resp.blob()
}

export const backendApi = {
  // formData should include: file, impositionType, pageSize, orientation, addBlankPages
  impose: async (formData) => requestImposition('/api/imposition/process', formData),
  // formData should include: files[] (multiple), impositionType, pageSize, orientation, addBlankPages
  merge: async (formData) => requestImposition('/api/imposition/merge', formData),
}
