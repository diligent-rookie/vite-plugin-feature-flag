import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { readdirSync, statSync } from 'node:fs'
import { ICONS } from './constant'

function findNodeModulesDirs(dir: string): string[] {
  let results: string[] = []
  const files = readdirSync(dir)
  for (const file of files) {
    const fullPath = join(dir, file)
    if (file === 'node_modules' && statSync(fullPath).isDirectory()) {
      results.push(fullPath)
    } else if (statSync(fullPath).isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
      results = results.concat(findNodeModulesDirs(fullPath))
    }
  }
  return results
}

const root = process.cwd()
const nodeModulesDirs = findNodeModulesDirs(root)

if (nodeModulesDirs.length === 0) {
  console.log(`${ICONS.INFO} No node_modules directories found.`)
} else {
  for (const dir of nodeModulesDirs) {
    try {
      console.log(`${ICONS.LOADING} Removing ${dir}`)
      execSync(`rm -rf "${dir}"`)
    } catch (e) {
      console.error(`${ICONS.ERROR} Failed to remove ${dir}:`, e)
    }
  }
  console.log(`${ICONS.SUCCESS} All node_modules directories have been removed.`)
}
