import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function isGreenApiHost(url) {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && hostname.endsWith('green-api.com')
  } catch {
    return false
  }
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function greenApiProxy() {
  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/green-api/')) {
          next()
          return
        }

        try {
          const targetBase = String(
            req.headers['x-api-host'] || 'https://api.green-api.com',
          ).replace(/\/+$/, '')

          if (!isGreenApiHost(targetBase)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'Некорректный apiUrl' }))
            return
          }

          const targetUrl = `${targetBase}${req.url.replace(/^\/green-api/, '')}`
          const method = req.method || 'GET'
          const headers = {}
          if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type']
          }

          const init = { method, headers }
          if (method !== 'GET' && method !== 'HEAD') {
            init.body = await collectBody(req)
          }

          const response = await fetch(targetUrl, init)
          const buffer = Buffer.from(await response.arrayBuffer())
          res.statusCode = response.status
          const contentType = response.headers.get('content-type')
          if (contentType) res.setHeader('Content-Type', contentType)
          res.end(buffer)
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              message: error.message || 'Ошибка запроса к GREEN-API',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  base: '/green_api_test/',
  plugins: [react(), greenApiProxy()],
  server: {
    port: 5173,
  },
})
