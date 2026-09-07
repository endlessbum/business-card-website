import { createServer } from 'node:http'
import { handleVisitors } from './visitors-handler.js'
import { getTotal } from './visitors-store.js'

const PORT = Number(process.env.PORT || 8787)
const HOST = process.env.HOST || '127.0.0.1'

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url || '/', 'http://localhost')

  if (pathname !== '/api/visitors') {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  try {
    await handleVisitors(req, res)
  } catch (err) {
    console.error('[visitors] handler failed:', err)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    }
    res.end(JSON.stringify({ error: 'internal error' }))
  }
})

function shutdown() {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 1000).unref()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.listen(PORT, HOST, async () => {
  let total = 0
  try {
    total = await getTotal()
  } catch {}
  console.log(`[visitors] api listening on http://${HOST}:${PORT}`)
  console.log(`[visitors] ${total} unique so far`)
})
