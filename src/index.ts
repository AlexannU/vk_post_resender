import { API, Upload, Updates, getRandomId, WallAttachment, MessageContext } from 'vk-io'
import { LocalStorage } from './models/LocalStorage.js';
import { config } from 'dotenv'
import { DistributeMode } from './utils/types.js'
import path from 'path'

let mode  = DistributeMode.PROD
const localStorage = new LocalStorage()

config({ path: ".env"})

let pathLableIndex = process.argv.indexOf("--path")
if (process.argv.indexOf("--path") >= 0) {
    let storagePath = process.argv.at(pathLableIndex + 1)
    if (storagePath) {
        config( {path: path.join(storagePath, ".env"), override: true} )
        localStorage.setPath(storagePath)
        console.log(`Set .env from ${storagePath}`);
    }

}

if (process.argv.indexOf("-d") >= 0) {
    mode = DistributeMode.DEBUG
}

const vkToken = mode == DistributeMode.DEBUG ? process.env.GROUP_TOKEN_DEBUG : process.env.GROUP_TOKEN_PROD
const ownerId = process.env.OWNER_ID ?? ""
const devId = process.env.DEV_ID ?? ""
console.log(vkToken);
console.log(ownerId);



if(vkToken == undefined) throw Error("You must specify the required parameters in the .env")



const api = new API({
	token: vkToken
});

const upload = new Upload({
	api
});

const updates = new Updates({
	api,
	upload
});



updates.on("message_new", async (messageContext) => {
    handleMessage(messageContext)
})

updates.on("wall_post_new",(wallContext) => {
    console.log(`${Date()} wall_post_new | post_type = ${wallContext.wall.postType} | with post_id = ${wallContext.wall.id}`)
    if (wallContext.wall.postType == 'post') {
        handleWallNewPost(wallContext.wall)
    }
})


updates.start()
    .then(() => {
        localStorage.createStorageFile()
        console.log(`${Date()} Bot started`)
    })
    .catch(console.error);



function handleMessage(message: MessageContext) {
    if (message.text) {
        const command = message.text?.match(/\/(?<command>.+)/)?.groups?.command
        if (ownerId.length > 0 && devId.length > 0) {
            if (message.peerId == Number(ownerId) || message.peerId == Number(devId)) {
                if(command) handleCommand(command, message.peerId)
            }
        } else {
            if(command) handleCommand(command, message.peerId)
        }
        
        
    }
}

function handleCommand(command: string, peerId: number) {
    switch (command) {
        case "activate":
            readAndWritePeerIds(peerId)
            break;
        case "deactivate":
            unSubcribePeerId(peerId)
            break;
        default:
            break;
    }
}

function handleWallNewPost(wall: WallAttachment) {
    onWallPostNew(wall)
}


function readAndWritePeerIds(peerId: number) {
    let localData = localStorage.readConfigFromLocalStorage()
    if (localData != null) {
        if (!localData.peerIds.includes(peerId)) {
            localData.peerIds.push(peerId)
            console.log(`${Date()} Peer id added: ${peerId}`)
        }
        if (localStorage.writeConfigInLocalStorage(localData)) {
            api.messages.send({
                peer_id: peerId,
                random_id: getRandomId(),
                message: "Чат подписан на новости группы"
                
            })
        }
    }
}

function unSubcribePeerId(peerId: number) {
    console.log(`${Date()} Unsubscribe peerId ${peerId}`)
    let localData = localStorage.readConfigFromLocalStorage()
    if (localData != null) {
        if (localData.peerIds.includes(peerId)) {
            let devetedId = localData.peerIds.indexOf(peerId)
            localData.peerIds.splice(devetedId, 1)
            if (localStorage.writeConfigInLocalStorage(localData)) {
                api.messages.send({
                    peer_id: peerId,
                    random_id: getRandomId(),
                    message: "Чат отписан от новостей группы"
                })
            }
        }   
    }
}

function onWallPostNew(wall: WallAttachment) {
    let localData = localStorage.readConfigFromLocalStorage()
    if (localData != null) {
        if (!localData.sendedPosts.includes(wall.id)) {
            api.messages.send({
                peer_ids: localData.peerIds,
                random_id: getRandomId(),
                attachment: `wall${wall.ownerId}_${wall.id}`
            })
        }
    }
    writeSendedPost(wall.id)
}

function writeSendedPost(postId:number) {
   
    let localData = localStorage.readConfigFromLocalStorage()
    if (localData != null) {
        if (localData.sendedPosts.length > 100) {
            localData.sendedPosts.shift()
        }
        if (!localData.sendedPosts.includes(postId)) {
            localData.sendedPosts.push(postId)
            console.log(`${Date()} Add post ${postId} to local storage`)
        }
        localStorage.writeConfigInLocalStorage(localData)
    }
  }


