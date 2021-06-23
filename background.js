// @ts-check
// import * as example from './example.js';

console.log("Background Active");


// chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
    console.log('background js event fired');
    chrome.tabs.sendMessage(tab.id,{type: "toggle"});
}

window.addEventListener('message', event => {
    console.log("Background Event Received : " , event);
});

function scanBluetooth() {
    console.log("Inside Background JS");
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

function handleBluetoothEvent(data){
    console.log("Handling bluetooth event", {data});
    console.log({data});
}

chrome.browserAction.onClicked.addListener(buttonClicked);
chrome.runtime.onMessage.addListener(({type, payload}, sender)=>{
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
        const storageKey = 'history';
        chrome.storage.local.get([storageKey], (result)=>{
            const currentHistory = result && result[storageKey] ? JSON.parse(result[storageKey]) : {};
            currentHistory[payload.id] = payload;
            chrome.storage.local.set({[storageKey]: JSON.stringify(currentHistory)});
        });
    }
});
