import { collection, getDocs, limit, query, where } from '@/config/firebase'
import { db } from '@/config/firebase'

export type BackgroundRef = string

type CachedPayload = {
  ts: number
  refs: BackgroundRef[]
}

function cacheKey(category: string) {
  return `backgroundCatalogCache:v1:${category}`
}

function safeReadCache(category: string): CachedPayload | null {
  try {
    const raw = localStorage.getItem(cacheKey(category))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedPayload
    if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.refs)) return null
    return parsed
  } catch {
    return null
  }
}

function safeWriteCache(category: string, refs: BackgroundRef[]) {
  try {
    const payload: CachedPayload = { ts: Date.now(), refs }
    localStorage.setItem(cacheKey(category), JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function clearBackgroundCatalogCache(category: string) {
  try {
    localStorage.removeItem(cacheKey(category))
  } catch {
    // ignore
  }
}

/**
 * Loads a small pool of background references from Firestore and caches it.
 *
 * Cost control:
 * - returns cached values until TTL expires
 * - fetches only a limited page (default 50)
 *
 * Expected Firestore doc shape (collection: `backgrounds`):
 * - category: string
 * - active: boolean
 * - fullUrl or url: string (public https URL)
 */
export async function getBackgroundRefsCached(
  category: string,
  options?: {
    ttlMs?: number
    limit?: number
  }
): Promise<BackgroundRef[]> {
  const ttlMs = options?.ttlMs ?? 12 * 60 * 60 * 1000 // 12 hours
  const maxDocs = options?.limit ?? 50

  const cached = safeReadCache(category)
  if (cached && Date.now() - cached.ts < ttlMs && cached.refs.length > 0) {
    return cached.refs
  }

  try {
    const q = query(
      collection(db, 'backgrounds'),
      where('category', '==', category),
      where('active', '==', true),
      limit(maxDocs)
    )

    const snap = await getDocs(q)
    const refs: BackgroundRef[] = []

    snap.forEach((docSnap) => {
      const data = docSnap.data() as any
      const url = (data?.fullUrl || data?.url) as unknown
      if (typeof url === 'string' && url.length > 0) refs.push(url)
    })

    if (refs.length > 0) safeWriteCache(category, refs)
    return refs
  } catch {
    // If Firestore fails/offline, fall back to whatever cache we had
    return cached?.refs ?? []
  }
}
