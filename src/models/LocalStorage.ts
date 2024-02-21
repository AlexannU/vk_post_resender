import fs from 'fs'
import path from 'path'

export class LocalStorage {
    private storagePath: string
    private storageFileName: string = "storage.json"
    storageFilePath = (): string => { return path.join(this.storagePath, this.storageFileName) }
    
    constructor()
    constructor(storagePath: string)

    constructor(storagePath?: string) {
        this.storagePath = (storagePath) ? storagePath : "./storage"
    }

    setPath(path: string) {
        this.storagePath = path    
    } 

    readConfigFromLocalStorage(): Config | null {
        try {
            const data = fs.readFileSync(this.storageFilePath(), 'utf-8')
            if (data == "") {
                if (this.writeConfigInLocalStorage(emptyLocalData)) {
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
    
    writeConfigInLocalStorage(data: Config): boolean {
        try {
            fs.writeFileSync(this.storageFilePath(), JSON.stringify(data))
            return true
        } catch(err) {
            console.log(`${Date()} writeItemsInLocalStorage error: ${err}`);
            return false
        }
    }
    
    createStorageFile(): boolean {
        try {
            if (!fs.existsSync(this.storagePath)) {
                fs.mkdirSync(this.storagePath)
            }
            if (!fs.existsSync(this.storageFilePath())) {
                fs.writeFileSync(this.storageFilePath(), "");
            }
            return true
        } catch(err) {
            console.log(`${Date()} createStorageFile error: ${err}`);
            return false
        }
        
    }
}


type Config = {
    peerIds: number[],
    sendedPosts: number[]
}
const emptyLocalData = {
    peerIds: [],
    sendedPosts: []
} as Config



