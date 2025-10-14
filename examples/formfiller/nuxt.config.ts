// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Configure Vite to handle voice-kit package
  vite: {
    optimizeDeps: {
      include: ['@thinkata/voice-kit']
    }
  }
})
