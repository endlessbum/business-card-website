import { handleVisitors } from '../server/visitors-handler.js'

export default async function visitors(req, res) {
  try {
    await handleVisitors(req, res)
  } catch (err) {
    console.error('[visitors] handler failed:', err)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    }
    res.end(JSON.stringify({ error: 'internal error' }))
  }
}
