import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

export const PROJECT_ID = '2jd536j2'
export const DATASET = 'production'
export const API_VERSION = '2026-08-24'

const currentFile = fileURLToPath(import.meta.url)
export const STUDIO_ROOT = path.resolve(path.dirname(currentFile), '..', '..')
export const REPO_ROOT = path.resolve(STUDIO_ROOT, '..')

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        const name = line.slice(0, separator).trim()
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2')
        return [name, value]
      }),
  )
}

export function loadToken() {
  const localEnv = parseEnvFile(path.join(REPO_ROOT, 'web', '.env.local'))
  const token =
    process.env.SANITY_API_KEY ||
    process.env.SANITY_API_TOKEN ||
    process.env.SANITY_AUTH_TOKEN ||
    localEnv.SANITY_API_KEY ||
    localEnv.SANITY_API_TOKEN ||
    localEnv.SANITY_AUTH_TOKEN

  if (!token) {
    throw new Error(
      'Mangler Sanity-token. Sett SANITY_API_KEY, SANITY_API_TOKEN eller SANITY_AUTH_TOKEN.',
    )
  }

  return token
}

export function getSanityClient() {
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token: loadToken(),
  })
}
