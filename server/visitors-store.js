import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Redis } from '@upstash/redis'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_PATH = join(DATA_DIR, 'visitors.json')

const SALT = process.env.VISITOR_SALT || 'gheofvens'
const REDIS_KEY = process.env.VISITOR_REDIS_KEY || 'visitors:v1'

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const useRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN)
const redis = useRedis ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const onVercel = process.env.VERCEL === '1'
const memoryOnly = onVercel && !useRedis

const unique = new Set()

function load() {
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf8'))
    if (parsed && Array.isArray(parsed.unique)) {
      parsed.unique.forEach((h) => unique.add(h))
    }
  } catch {
    // store does not exist yet — start empty
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

export function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (xff) {
    const first = String(xff).split(',')[0].trim()
    if (first) return first
  }
  return String(req.socket?.remoteAddress || '').replace(/^::ffff:/, '')
}

async function redisTotal() {
  return Number(await redis.scard(REDIS_KEY))
}

export async function getTotal() {
  if (redis) return redisTotal()
  return unique.size
}

export async function addVisitor(ip) {
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
