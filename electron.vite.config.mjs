import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const load = loadEnv(mode, process.cwd())
  let env = {}
  for (let loadKey in load) {
    env[loadKey] = load[loadKey]
  }
  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@': resolve('src/renderer/src')
        }
      },
      plugins: [vue()],
      define: {
        'process.env': {
          ...env
        }
      },
      server: {
        proxy: {
          // 代理 /api 路径到目标服务器
          '/api': {
            target: 'https://' + load.VITE_APP_URL + ':' + load.VITE_APP_PORT, // 目标服务器的地址
            changeOrigin: true, // 是否修改源头
            secure: false,
            rewrite: (path) => path.replace(new RegExp(`^${load.VITE_APP_API}`), '') // 重写路径
          },
          [load.VITE_APP_SOCKET]: {
            target: `wss://${load.VITE_APP_URL}:${load.VITE_APP_PORT}`, // WebSocket 的目标地址
            changeOrigin: true,
            secure: false, // 如果目标服务器使用自签名证书
            ws: true, // 支持 WebSocket
            rewrite: (path) => path.replace(new RegExp(`^${load.VITE_APP_SOCKET}`), '') // 重写路径
          }
        }
      }
    }
  }
})
