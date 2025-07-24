import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import featureFlagPlugin from 'vite-plugin-feature-flag'

console.log(featureFlagPlugin)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), featureFlagPlugin() as PluginOption],
})
