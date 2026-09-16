import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Redis } from '@upstash/redis'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_PATH = join(DATA_DIR, 'visitors.json')
const SALT_PATH = join(DATA_DIR, 'salt')

const REDIS_KEY = process.env.VISITOR_REDIS_KEY || 'visitors:v1'

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const useRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN)
const redis = useRedis ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const onVercel = process.env.VERCEL === '1'
const memoryOnly = onVercel && !useRedis

if (memoryOnly) {
  console.warn(
    '[visitors] no Redis configured on Vercel: the counter is per-instance and resets on cold starts'
  )
}

function resolveSalt() {
  if (process.env.VISITOR_SALT) return process.env.VISITOR_SALT

  if (onVercel) {
    console.warn(
      '[visitors] VISITOR_SALT is not set: a random per-instance salt is used, so unique counts may be inconsistent'
    )
    return randomBytes(32).toString('hex')
  }

  try {
    if (existsSync(SALT_PATH)) {
      const stored = readFileSync(SALT_PATH, 'utf8').trim()
      if (stored) return stored
    }
    const generated = randomBytes(32).toString('hex')
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(SALT_PATH, generated, { mode: 0o600 })
    return generated
  } catch (err) {
    console.warn('[visitors] failed to persist salt, falling back to a random value:', err)
    return randomBytes(32).toString('hex')
  }
}

const SALT = resolveSalt()

const trustProxy = process.env.TRUST_PROXY === '1' || onVercel

const unique = new Set()

function load() {
  let raw
  try {
    raw = readFileSync(DB_PATH, 'utf8')
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[visitors] failed to read store:', err)
    return
  }
  try {
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.unique)) {
      parsed.unique.forEach((h) => unique.add(h))
    } else {
      console.warn('[visitors] store has unexpected shape, starting empty')
    }
  } catch (err) {
    console.error('[visitors] failed to parse store, starting empty:', err)
  }
}

function save() {
  const payload = JSON.stringify({
    unique: Array.from(unique),
    updatedAt: new Date().toISOString(),
  })
  const tmp = `${DB_PATH}.tmp`
  writeFileSync(tmp, payload)
  renameSync(tmp, DB_PATH)
}

if (!useRedis && !memoryOnly) load()

export function ipHash(ip) {
  return createHash('sha256').update(`${SALT}:v1:${ip}`).digest('hex')
}

function normalizeIp(value) {
  const ip = String(value || '').trim()
  if (!ip) return ''
  return ip.replace(/^::ffff:/, '')
}

export function clientIp(req) {
  if (trustProxy) {
    const real = req.headers['x-real-ip']
    if (real) return normalizeIp(real)

    const xff = req.headers['x-forwarded-for']
    if (xff) {
      const hops = String(xff)
        .split(',')
        .map((hop) => hop.trim())
        .filter(Boolean)
      if (hops.length) return normalizeIp(hops[hops.length - 1])
    }
  }
  return normalizeIp(req.socket?.remoteAddress)
}

async function redisTotal() {
  return Number(await redis.scard(REDIS_KEY))
}

export async function getTotal() {
  if (redis) return redisTotal()
  return unique.size
}

export async function addVisitor(ip) {
  if (!ip) return getTotal()

  const hash = ipHash(ip)
  if (redis) {
    await redis.sadd(REDIS_KEY, hash)
    return redisTotal()
  }
  if (!unique.has(hash)) {
    unique.add(hash)
    if (!memoryOnly) {
      try {
        mkdirSync(DATA_DIR, { recursive: true })
        save()
      } catch (err) {
        console.error('[visitors] failed to persist store:', err)
      }
    }
  }
  return unique.size
}
