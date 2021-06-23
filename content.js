// @ts-check

import * as sdk from './src/cmsn_sdk.js';


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage({type, payload}, sender, senderResponse){
    if(type === 'toggle'){
        toggle();
    }
    if(type === 'connect-new'){
        connectNew();
    }

}

var iframe = document.createElement('iframe'); 
iframe.id = "brain_band_frame";
iframe.style.height = "100vh";
iframe.style.width = "23vw";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.marginLeft = "0px";
iframe.style.marginRight = "0px";
iframe.style.marginTop = "0px";
iframe.style.marginBottom = "0px";
iframe.style.paddingLeft = "0px";
iframe.style.paddingRight = "0px";
iframe.style.paddingTop = "0px";
iframe.style.paddingBottom = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px"; 
iframe.src = chrome.extension.getURL("FirstExt.html");
iframe.allowFullscreen = true;
iframe.style.overflow = "hidden";
iframe.style.paddingRight="0"
iframe.style.margin="0";
iframe.style.display = "block";
iframe.style.overflowX = "hidden";
iframe.style.overflowY = "auto";
iframe.style.border = "none";
iframe.style.transform = "translate(100%)";
iframe.style.transition = "transform linear .3s";

document.body.appendChild(iframe);

let expanded = false;

function toggle(){
    if(expanded){
        iframe.style.transform = "translate(100%)";
    } else {
        iframe.style.transform = "translate(0%)";
    }
    expanded = !expanded;
}

const broadcastBluetoothEvent = (event, data)=>{
    chrome.runtime.sendMessage({type: 'bluetooth-event', payload: {event, data}})
}

const listeners = new sdk.CMSNDeviceListener({
    onConnectivityChanged:(device, connectivity)=>{ //Connectivity
        broadcastBluetoothEvent('onConnectivityChanged', {device, connectivity});
    },
    onDeviceInfoReady:   (device, deviceInfo)=>{  //deviceInfo
        broadcastBluetoothEvent('onDeviceInfoReady', {device, deviceInfo});
    },
    onContactStateChanged: (device, contactState) => { //ContactState
        broadcastBluetoothEvent('onContactStateChanged', {device, contactState});
    },
    onOrientationChanged: (device, orientation)=>{ //Orientation
        broadcastBluetoothEvent('onOrientationChanged', {device, orientation});
    },
    onEEGData:           (_, eegData)=> {   //EEGData
        broadcastBluetoothEvent('onEEGData', {eegData});
    },
    onBrainWave:           (_, stats)=> {   //BrainWave
        broadcastBluetoothEvent('onBrainWave', {stats});
    },
    onIMUData:           (_, imuData)=> {   //IMUData
        console.log("IMU data received:");
        console.log(imuData); 
        broadcastBluetoothEvent('onIMUData', {imuData});
    },
    onAttention:         (device, attention)=>{   //Float
        broadcastBluetoothEvent('onAttention', {device, attention, type: 'Attention'});
    },
    onMeditation:        (device, meditation)=>{  //Float
        broadcastBluetoothEvent('onAttention', {device, meditation, type: 'Meditation'});
    },
});

const device = new sdk.CMSNDevice(window);

const connectNew = async ()=>{
    try{
        const connectedDevice = await device.setup(listeners);
        if(connectedDevice && connectedDevice.id){
            const {id, name} = connectedDevice;
            console.log("Device setup done", connectedDevice);
            const msg = {type: 'device-connected', payload: {id, name}};
            chrome.runtime.sendMessage(msg);
            iframe.contentWindow.postMessage(msg, '*')
        } else {
            throw new Error();
        }

    } catch(e){
        console.log("Device setup failed", {e});
    }    
}