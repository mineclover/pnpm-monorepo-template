#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { register } from 'tsx/esm/api'

const __dirname = dirname(fileURLToPath(import.meta.url))

const unregister = register()

try {
  await import(pathToFileURL(join(__dirname, 'index.ts')).href)
} finally {
  unregister()
}
