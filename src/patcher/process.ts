// import { patch } from './patcher'

import { exec as originalExec } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { patch } from './edit'
const exec = promisify(originalExec)

export async function getPatched() {
  console.log('Cleaning up...')
  try {
    await rm('extension', { recursive: true })
  } catch {}

  console.log('Downloading extension...')
  const res = await fetch(
    'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3Dkgmfphgflhecbmihdpgamkkgienkllif%26installsource%3Dondemand%26uc',
  )
  const arrayBuffer = await res.arrayBuffer()
  await mkdir('extension', { recursive: true })
  const buffer = Buffer.from(arrayBuffer)
  await mkdir('extension', { recursive: true })
  await writeFile('extension/original.zip', buffer)

  console.log('Unzipping extension...')
  await exec('unzip extension/original.zip -d extension').catch(() => {})

  console.log('Patching extension...')
  const originalCode = await readFile('extension/js/simplifyGmail.js', 'utf-8')
  const patchedCode = patch(originalCode)
  await writeFile('extension/js/simplifyGmail.js', patchedCode)

  console.log('Zipping extension...')
  await rm('extension/original.zip', { force: true })
  await exec('zip -r ../_patched.zip *', { cwd: 'extension' })

  console.log('Cleaning up...')
  await rm('extension', { recursive: true })

  return readFile('_patched.zip')
}
