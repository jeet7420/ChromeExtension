// @ts-check

function buttonClicked(tab) {
    console.log('background js event fired');
    chrome.tabs.sendMessage(tab.id,{type: "toggle"});
}

 
function eventRaised(value, type) { 
    console.log("Event Raised");

    var text = '{ "time"  : "' + new Date() + '",'
             + '  "value" : "' + value + '",'
             + '  "type"  : "' + type + '",'
             + '  "userName" : "AUTOI"' 
             + '}';
    console.log(text);
    //ws.send(text);
}

/**
 * This handleBluetoothEvent method should receive all bluetooth related events from content.js
 * Check listener object in content.js for list of events it may receive 
 * @param {{type: string, payload?: any}} data
 */
function handleBluetoothEvent(data){
    console.log("Handling bluetooth event", {data});
    console.log({data});
}

chrome.browserAction.onClicked.addListener(buttonClicked);
const storageKey = 'history';

/**
 * Helper function to notify all tabs
 * @param {string} type 
 * @param {any} payload 
 * @returns 
 */
const notifyAll = (type, payload) => chrome.tabs.query({}, list=>list.forEach(({id})=>chrome.tabs.sendMessage(id, {type, payload})));

chrome.runtime.onMessage.addListener(({type, payload}, sender, response)=>{
    console.log("Message received",{type, payload});
    if(type === 'toggle'){
        buttonClicked(sender.tab);
    }
    if(type === 'bluetooth-event'){
        handleBluetoothEvent(payload);
    }
    if(type === 'connect-new'){
        chrome.tabs.sendMessage(sender.tab.id,{type});
    }
    if(type === 'device-connected'){
        chrome.storage.local.get([storageKey], (result)=>{
            const currentHistory = result && result[storageKey] ? JSON.parse(result[storageKey]) : {};
            currentHistory[payload.id] = {
                ...payload,
                at: +new Date()
            };
            chrome.storage.local.set({[storageKey]: JSON.stringify(currentHistory)});
        });
        // notifying all tabs so that the extension screens are synced
        notifyAll(type, payload);
    }
    if(type === 'remove-previous-device'){
        chrome.storage.local.get([storageKey], (result)=>{
            const currentHistory = result && result[storageKey] ? JSON.parse(result[storageKey]) : {};
            if(currentHistory[payload]){
                delete currentHistory[payload];
            }
            chrome.storage.local.set({[storageKey]: JSON.stringify(currentHistory)});
        });
    }
    if(type === 'get-previous-devices'){
        chrome.storage.local.get([storageKey], (result)=>{
            const currentHistory = result && result[storageKey] ? JSON.parse(result[storageKey]) : {};
            response(Object.values(currentHistory))
        });
        return true; // return true indicates the response is async
    }
});

chrome.storage.onChanged.addListener(({history})=>{
    console.log('History changed', history.newValue);
    const newData = JSON.parse(history.newValue || '{}');
    notifyAll('update-device-list', Object.values(newData));
});