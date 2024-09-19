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
    runtimeConfig: {
        public: {
            dbName: process.env.DB_NAME,
            dbUser: process.env.DB_USER,
            dbHost: process.env.DB_HOST,
            dbPassword: process.env.DB_PASS,
            dbMode: process.env.DB_MODE,
            isSSL: process.env.IS_SSL,
        }
    },
});
