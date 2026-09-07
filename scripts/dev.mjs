import { spawn } from 'node:child_process'

const children = []

const start = (cmd, args) => {
  const child = spawn(cmd, args, { stdio: 'inherit' })
  children.push(child)
  return child
}

const backend = start(process.execPath, ['server/index.js'])
const vite = start(process.execPath, ['node_modules/vite/bin/vite.js'])

let shuttingDown = false
const stopAll = (sig) => {
  if (shuttingDown) return
  shuttingDown = true
  children.forEach((c) => {
    if (c.exitCode === null) c.kill(sig)
  })
}

process.on('SIGINT', () => stopAll('SIGINT'))
process.on('SIGTERM', () => stopAll('SIGTERM'))

let finished = false
const onExit = (child, code) => {
  if (finished) return
  finished = true
  children.forEach((c) => {
    if (c !== child && c.exitCode === null) c.kill('SIGTERM')
  })
  process.exitCode = typeof code === 'number' ? code : 1
}

backend.on('exit', (code) => onExit(backend, code))
vite.on('exit', (code) => onExit(vite, code))
