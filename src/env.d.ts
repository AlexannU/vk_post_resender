declare global {
    namespace NodeJS {
        interface ProcessEnv {
            GROUP_TOKEN_PROD: string | undefined,
            GROUP_TOKEN_DEBUG: string | undefined,
            DEV_ID: string | undefined,
            OWNER_ID: string | undefined
        }
    }
}

export {}