import * as example from './example.js';

( window.onload = function () {
    console.log("Extension JS Document : " , document);
     document.getElementById("btn-scan-bluetooth").addEventListener("click", function(event) {
        scanBluetooth();
     });
 });

async function scanBluetooth() {
    console.log("Extension JS");
    await example.scanBluetooth();
}