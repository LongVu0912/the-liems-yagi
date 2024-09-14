// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    ssr: false,
    modules: ["@nuxt/ui", "@nuxt/icon", "@nuxtjs/color-mode", "@vueuse/nuxt"],
    components: [
        {
            path: "~/components",
            pathPrefix: false,
        },
    ],
});
