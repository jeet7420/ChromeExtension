// import * as example from './example.js';

console.log("Background Active");

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
    console.log('background js event fired');
    chrome.tabs.sendMessage(tab.id,"toggle");
}

window.addEventListener('message', event => {
    console.log("Background Event Received : " , event);
});

function scanBluetooth() {
    console.log("Inside Background JS");
}