// @ts-check

import * as sdk from './src/cmsn_sdk.js';


chrome.runtime.onMessage.addListener(gotMessage);

/**
 * Helper function to handle incoming message from background script
 * @param {{type: string}} param0 
 */
function gotMessage({type}){
    if(type === 'toggle'){
        toggle();
    }
    if(type === 'connect-new'){
        connectNew();
    }
    if(type === 'disconnect'){
        disconnect();
    }
    if(type === 'pair'){
        console.log('Pair Request Content JS');
        device.pair(true);
    }
}
/**
 * Iframe definition
 */
var iframe = document.createElement('iframe'); 
iframe.id = "brain_band_frame";
iframe.style.height = "720px";
iframe.style.width = "320px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.margin = "0px";
iframe.style.padding = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px"; 
iframe.src = chrome.extension.getURL("iframe.html");
iframe.allowFullscreen = true;
iframe.style.overflow = "hidden";
iframe.style.display = "block";
iframe.style.overflowX = "hidden";
iframe.style.overflowY = "auto";
iframe.style.border = "none";
iframe.style.transform = "translate(100%)";
iframe.style.transition = "transform linear .3s";
iframe.style.borderRadius = '6px';

document.body.appendChild(iframe);

var sandboxFrame = document.createElement('iframe');
sandboxFrame.src = chrome.extension.getURL("sandbox.html");
sandboxFrame.style.visibility = "hidden";
sandboxFrame.style.display = "none";

document.body.appendChild(sandboxFrame);

let expanded = false;
/**
 * Helper function to toggle iframe
 */
function toggle(){
    if(expanded){
        iframe.style.transform = "translate(100%)";
    } else {
        iframe.style.transform = "translate(0%)";
    }
    expanded = !expanded;
}

/**
 * Helper function to broadcast bluetooth events to background script
 * @param {string} event 
 * @param {any} data 
 */
const broadcastBluetoothEvent = (event, data)=>{
    console.log('Event : ', event);
    console.log('Data : ', data);
    chrome.runtime.sendMessage({type: 'bluetooth-event', payload: {event, data}})
}

/**
 * Here we listen to all events from SDK and broadcast that event to background script
 */

const listeners = new sdk.CMSNDeviceListener({
    onConnectivityChanged:(device, connectivity)=>{ //Connectivity
        let deviceDetails = {name: device.name, uuid: device.uuid};
        console.log('Connectivity Changed');
        broadcastBluetoothEvent('onConnectivityChanged', deviceDetails);
    },
    onDeviceInfoReady:   (device, deviceInfo)=>{  //deviceInfo
        console.log('Device Info');
        let deviceInfoDetails = {batteryLevel: device.batteryLevel, deviceInfo: deviceInfo};
        broadcastBluetoothEvent('onDeviceInfoReady', deviceInfoDetails);
        //broadcastBluetoothEvent('onDeviceInfoReady123', "Test Device Info Data");
    },
    onContactStateChanged: (device, contactState) => { //ContactState
        console.log('Contact State Changed');
        broadcastBluetoothEvent('onContactStateChanged', {contactState});
    },
    onOrientationChanged: (device, orientation)=>{ //Orientation
        console.log('Orientation Changed');
        broadcastBluetoothEvent('onOrientationChanged', {orientation});
    },
    onEEGData:           (_, eegData)=> {   //EEGData
        console.log('EEG Data');
        broadcastBluetoothEvent('onEEGData', {eegData});
    },
    onBrainWave:           (_, stats)=> {   //BrainWave
        console.log('Brain Wave');
        broadcastBluetoothEvent('onBrainWave', {stats});
    },
    onIMUData:           (_, imuData)=> {   //IMUData
        console.log("IMU data received:");
        console.log(imuData); 
        broadcastBluetoothEvent('onIMUData', {imuData});
    },
    onAttention:         (device, attention)=>{   //Float
        console.log('Attention Changed');
        broadcastBluetoothEvent('onAttention', {attention, type: 'Attention'});
    },
    onMeditation:        (device, meditation)=>{  //Float
        console.log('Medidation Changed');
        broadcastBluetoothEvent('onAttention', {meditation, type: 'Meditation'});
    },
});

const window = sandboxFrame.contentWindow;
const device = new sdk.CMSNDevice(window);

/**
 * @type {BluetoothDevice}
 */
let connectedDevice;

const disconnect = async ()=>{
    if(connectedDevice){
        try{
            connectedDevice.gatt.disconnect();
        } catch(e){}
        connectedDevice = undefined;
    }
}

const connectNew = async ()=>{
    try{
        connectedDevice = await device.setup(listeners);
        if(connectedDevice && connectedDevice.id){
            /**
             * We can't pass the whole connectedDevice object due to browser limitation (native code/security)
             * So, we take the id and name only
             */
            const {id, name} = connectedDevice;
            console.log("Device setup done", connectedDevice);
            const msg = {type: 'device-connected', payload: {id, name}};
            chrome.runtime.sendMessage(msg);
            iframe.contentWindow.postMessage(msg, '*');
            //device.pair(true);
            //window.postMessage('test message', `*`);
        } else {
            throw new Error();
        }

    } catch(e){
        console.log("Device setup failed", {e});
    }    
}