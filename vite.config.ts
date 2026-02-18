import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'

// Function to copy directory recursively
function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  const entries = readdirSync(src)
  for (const entry of entries) {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-data',
      writeBundle() {
        const srcDir = path.resolve(__dirname, 'public/data')
        const destDir = path.resolve(__dirname, 'dist/data')
        if (existsSync(srcDir)) {
          copyDir(srcDir, destDir)
          console.log('✅ Data folder copied to dist/')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5000,
    strictPort: false,
  },
  // Use '/' for absolute paths (required for Vercel)
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsInlineLimit: 0,
    copyPublicDir: true,
  },
  publicDir: 'public',
})
