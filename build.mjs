import { cp, mkdir, rm } from 'fs/promises'

// Clean dist
await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
await mkdir('dist/admin', { recursive: true })

// Frontend → dist/
await cp('frontend', 'dist', { recursive: true })

// Admin → dist/admin/
await cp('admin', 'dist/admin', { recursive: true })

// Admin assets fix: ensure /admin/assets path works
// (admin index.html already uses /admin/assets/* paths)

console.log('✓ dist/ built successfully')
