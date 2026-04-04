import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const config = {
    plugins: [react(), mkcert()],
  }

  if (command !== 'serve') {
    return config
  }

  const parsedPort = Number(env.PORT)

  if (!env.PORT || Number.isNaN(parsedPort)) {
    throw new Error('Missing or invalid PORT in environment configuration.')
  }

  return {
    ...config,
    server: {
      port: parsedPort,
      strictPort: true,
    },
  }
})
