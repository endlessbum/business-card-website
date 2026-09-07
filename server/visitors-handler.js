import { addVisitor, clientIp, getTotal } from './visitors-store.js'

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  })
  res.end(body === undefined ? undefined : JSON.stringify(body))
}

export async function handleVisitors(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, undefined)
    return
  }

  if (req.method === 'GET') {
    const total = await getTotal()
    sendJson(res, 200, { total })
    return
  }

  if (req.method === 'POST') {
    const total = await addVisitor(clientIp(req))
    sendJson(res, 200, { total })
    return
  }

  sendJson(res, 405, { error: 'method not allowed' })
}
