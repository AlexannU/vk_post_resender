import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = "./src/storage"
const config = './src/storage/config.json'

type Config = {
    peerIds: number[],
    sendedPosts: number[]
}
const emptyLocalData = {
    peerIds: [],
    sendedPosts: []
} as Config

export function readConfigFromLocalStorage(): Config | null {
    try {

        const data = fs.readFileSync(config, 'utf-8')
        if (data == "") {
            if (writeConfigInLocalStorage(emptyLocalData)) {
                return emptyLocalData
            } else {
                return null
            }
        } else {
            return  JSON.parse(data) as Config
        }
    } catch(err) {
        console.log(`${Date()} readLocalConfig error: ${err}`);
        return null
    }
}

export function writeConfigInLocalStorage(data: Config): boolean {
    try {
        fs.writeFileSync(config, JSON.stringify(data))
        return true
    } catch(err) {
        console.log(`${Date()} writeItemsInLocalStorage error: ${err}`);
        return false
    }
}

export function createStorageFile(): boolean {
    try {
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath)
        }
        if (!fs.existsSync(config)) {
            fs.writeFileSync(config, "");
        }
        return true
    } catch(err) {
        console.log(`${Date()} createStorageFile error: ${err}`);
        return false
    }
    
}


