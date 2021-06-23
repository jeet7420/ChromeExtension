// import * as sdk from '../dist/cmsn_sdk.min.js';
// console.log(sdk);
 
import * as Enum from './src/cmsn_enum.js';
import * as sdk from './src/cmsn_sdk.js';

// const ws = new WebSocket("ws://localhost:8080");

// ws.addEventListener("open", () => {
//     console.log("Client Side Connection Established");
// })

// ws.addEventListener("message", ({data}) => {
//     //console.log(data);
// })
 
function eventRaised(value, type) { 
    console.log("Event Raised");

    var text = '{ "time"  : "' + new Date() + '",'
             + '  "value" : "' + value + '",'
             + '  "type"  : "' + type + '",'
             + '  "userName" : "AUTOI"' 
             + '}';
             
    //ws.send(text);
}

const exampleListener = new sdk.CMSNDeviceListener({
    onConnectivityChanged:(device, connectivity)=>{ //Connectivity
        console.log({ message: `[${device.name}] Connectivity changed to: ${Enum.CONNECTIVITY(connectivity)}` });
        document.getElementById('connectivity').innerText = 'connectivity: ' + Enum.CONNECTIVITY(connectivity);
    },
    onDeviceInfoReady:   (device, deviceInfo)=>{  //deviceInfo
        console.log(`[${device.name}] Device info is ready:`);
        console.log(deviceInfo);
        document.getElementById('deviceInfo').innerText = JSON.stringify(deviceInfo);
    },
    onContactStateChanged: (device, contactState) => { //ContactState
        console.log({ message: `[${device.name}] Contact state changed to:${Enum.CONTACT_STATE(contactState)}` });
        document.getElementById('contactState').innerText = 'contactState: ' + Enum.CONTACT_STATE(contactState);
    },
    onOrientationChanged: (device, orientation)=>{ //Orientation
        console.log(`[${device.name}] Orientation changed to:${Enum.ORIENTATION(orientation)}`);
    },
    onEEGData:           (_, eegData)=> {   //EEGData
        console.log("EEG data received:");
        console.log(eegData); 
    },
    onBrainWave:           (_, stats)=> {   //BrainWave
        console.log("BrainWave data received:");
        console.log(stats); 
    },
    onIMUData:           (_, imuData)=> {   //IMUData
        console.log("IMU data received:");
        console.log(imuData); 
    },
    onAttention:         (device, attention)=>{   //Float
        console.log({ message: `[${device.name}] Attention:${attention}` });
        var label = document.getElementById('attention');
        label.innerText = 'attention=' + attention.toFixed(1);
        eventRaised(attention, 'Attention');
    },
    onMeditation:        (device, meditation)=>{  //Float
        console.log(`[${device.name}] Meditation:${meditation}`);
        var label = document.getElementById('meditation');
        label.innerText = 'meditation=' + meditation.toFixed(1);
        eventRaised(meditation, 'Meditation');
    },
});

function addExampleButtons() {
    let btnBTH = document.getElementById("btn-scan-bluetooth");
    btnBTH.onclick = async function() {
        console.log("************ Setup ************");
        await device.setup(exampleListener);
    };
  
    // let page = document.getElementById('page');
    // let steupBtn = document.getElementById('setup');
    // steupBtn.onclick = async function() {
    //     console.log("************ Setup ************");
    //     await device.setup(exampleListener);
    // };

    // let eventBtn = document.getElementById('btn-event');
    // eventBtn.onclick = async function() {
    //     eventRaised();
    // };

    // for (var i = 1; i <= 2; i++) {
    //     let btn = document.createElement('div');
    //     btn.setAttribute("class", 'btn');
    //     btn.innerText = Enum.CMD(i);
    //     btn.onclick = onClick(btn, i);
    //     page.appendChild(btn);
    // }
}

function onClick(btn, i) {
    function f() {
        switch (i) {
            // case Enum.CMD.enum('imuConfig'):
            //     const sampleRate = Enum.IMU.SAMPLE_RATE.enum('sr416');
            //     device.startIMU(sampleRate);
            //     break;
            
            case Enum.CMD.enum('pair'):
                // LED flash fast
                device.pair(true);
                break;
            case Enum.CMD.enum('checkPairStatus'):
                // LED flash normal
                device.pair(false);
                break;
            
            // case Enum.CMD.enum('setLEDColor'):
            //     // device.setLEDColor([255, 255, 0]);
            //     device.setLEDColor([255, 0, 0]);
            //     break;
            // case Enum.CMD.enum('setDeviceName'):
            //     device.setDeviceName('cmsn_OK');
            //     break;
            // case Enum.CMD.enum('setSleepIdleTime'):
            //     device.setSleepIdleTime(120); //0~1000
            //     break;
            // case Enum.CMD.enum('setVibrationIntensity'):
            //     device.setVibrationIntensity(1); //1~100
            //     break;
            default:
                break;
        }
    }
    return f;
}

export async function scanBluetooth() {
    console.log("************ Setup ************");
    await device.setup(exampleListener);
}

const window = document.getElementById('sandboxFrame').contentWindow;
const device = new sdk.CMSNDevice(window);

// ( window.onload = function () {
//     console.log("Extension JS Document : " , document);
//      document.getElementById("btn-scan-bluetooth").addEventListener("click", 
//         async function() {
//             console.log("************ Setup ************");
//             await device.setup(exampleListener);    
//      });
//  });

addExampleButtons();

/** Close btn */

document.getElementById('close-btn').addEventListener('click', ()=>{
    chrome.runtime.sendMessage('toggle');
});