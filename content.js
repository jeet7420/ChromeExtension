import * as example from './example.js';


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, senderResponse){
    console.log('content script js event fired');
    console.log(request);
    //toggle();
}

// var iframe = document.createElement('iframe'); 
// iframe.id = "brain_band_frame";
// iframe.style.height = "88%";
// iframe.style.width = "0%";
// iframe.style.position = "absolute";
// iframe.style.top = "0px";
// iframe.style.right = "0px";
// iframe.style.marginLeft = "0px";
// iframe.style.marginRight = "0px";
// iframe.style.marginTop = "0px";
// iframe.style.marginBottom = "0px";
// iframe.style.paddingLeft = "0px";
// iframe.style.paddingRight = "0px";
// iframe.style.paddingTop = "0px";
// iframe.style.paddingBottom = "0px";
// iframe.style.zIndex = "9000000000000000000";
// iframe.frameBorder = "0px"; 
// //iframe.src = chrome.extension.getURL("FirstExt.html");
// iframe.src = "FirstExt.html";
// iframe.allowFullscreen = true;
// iframe.marginBottom = "0";
// iframe.marginLeft = "0";
// iframe.marginRight = "0";
// iframe.marginTop = "0";
// iframe.style.overflow = "hidden";
// iframe.style.paddingRight="0"
// iframe.style.margin="0";
// iframe.style.display = "block";
// iframe.style.overflowX = "hidden";
// iframe.style.overflowY = "auto";
// iframe.style.border = "none";
// iframe.overflow = "auto";
// iframe.overflowX = "hidden";
// iframe.overflowY = "auto";

// document.body.appendChild(iframe);

// function toggle(){
//     console.log('inside toggle');
//     if(iframe.style.width == "0%"){
//         console.log("Inside If");
//         iframe.style.width="23%";
//     }
//     else{
//         console.log("Inside Else");
//         iframe.style.width="0%";
//     }
// }

// var document1 = iframe.contentWindow.document;
// console.log('Frame : ', document);
// console.log('Frame 1 : ', document.getElementById("brain_band_frame"));
// console.log('Frame 2 : ', document1.getElementById("btn-scan-bluetooth"));
// document.getElementById("brain_band_frame").contentWindow.postMessage("");


function scanBluetooth() {
    console.log("Inside Content JS");
}