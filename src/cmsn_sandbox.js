// 'use strict';

//import * as Enum from './cmsn_enum.js';

// Global Variable
const DevicePtrMap = new Map(); // (uuid: string, devicePtr)
const resCallbacks = new Map();
let shared_event;

let cmsn_get_string_len;
let cmsn_get_float_value;
let cmsn_gen_msg_id;
// let cmsn_create_device;
// let cmsn_cmsn_get_contact_state;
// let cmsn_did_receive_data;

let cmsn_sys_config_pack;
// let cmsn_sys_config_pair_pack;
// let cmsn_sys_config_validate_pair_info_pack;

(async function main() {
    CrimsonSDK = await CrimsonSDK();
    console.log('------------- Please Click Setup Button to continue. -------------');
    // console.log(CrimsonSDK);

    cmsn_get_float_value = CrimsonSDK.cwrap('js_get_float_value', 'number', ['number', 'number']);
    cmsn_gen_msg_id = CrimsonSDK.cwrap('js_gen_msg_id', 'number', []);
    cmsn_get_string_len = CrimsonSDK.cwrap('js_get_string_len', 'number', ['number']);

    // test
    // const cmsn_hello = CrimsonSDK.cwrap('js_hello', 'number', ['number']);
    // console.log(cmsn_hello(666));

    const cmsn_create_device = CrimsonSDK.cwrap('js_create_device', 'number', ['string']);
    // const cmsn_release_device = CrimsonSDK.cwrap('js_release_device', 'number', ['number']);
    // cmsn_cmsn_get_contact_state = CrimsonSDK.cwrap('js_cmsn_get_contact_state', 'number', ['number']);
    const cmsn_did_receive_data = CrimsonSDK.cwrap('js_did_receive_data', 'number',
        ['number', 'array', 'number']);
    const cmsn_sys_config_validate_pair_info_pack = CrimsonSDK.cwrap('js_sys_config_validate_pair_info_pack',
        'number',
        ['string']);
    const cmsn_sys_config_pair_pack = CrimsonSDK.cwrap('js_sys_config_pair_pack',
        'number',
        ['string']);
    cmsn_sys_config_pack = CrimsonSDK.cwrap('js_sys_config_pack',
        'number',
        ['number']);
    const cmsn_set_config_resp_callback = CrimsonSDK.cwrap('js_set_config_resp_callback',
        'number',
        ['number']);

    const cmsn_set_device_name_pack = CrimsonSDK.cwrap('js_set_device_name_pack', 'number', ['number', 'string']);
    const cmsn_set_led_color_pack = CrimsonSDK.cwrap('js_set_led_color_pack', 'number', ['number', 'number', 'number', 'number']);
    const cmsn_set_sleep_pack = CrimsonSDK.cwrap('js_set_sleep_pack', 'number', ['number', 'number']);
    const cmsn_set_vibration_pack = CrimsonSDK.cwrap('js_set_vibration_pack', 'number', ['number', 'number']);
    // const cmsn_config_afe_pack = CrimsonSDK.cwrap('js_config_afe_pack', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
    const cmsn_config_imu_pack = CrimsonSDK.cwrap('js_config_imu_pack', 'number', ['number', 'number']);

    // Set up message event handler:
    window.addEventListener('message', function (event) {
        shared_event = event;

        var context = event.data;
        // console.log(`context=${JSON.stringify(context)}`);

        var uuid = context.uuid;
        var devicePtr = DevicePtrMap.get(uuid);

        var params = context.params;
        var command = context.command;
        if (command == 'didReceiveData') {
            const data = params.data;
            // console.log(data);
            if (devicePtr) cmsn_did_receive_data(devicePtr, data, data.length);
            return;
        } else if (command != 'sendMessage') {
            console.log(`invalid command=${command}`);
            return;
        }

        const cmd = params.cmd;
        const cb = undefined;
        switch (cmd) {
            // case Enum.CMD.enum('pair'):
            case 1:    
                if (devicePtr == null) {
                    devicePtr = cmsn_create_device(uuid);
                    if (devicePtr == null) { console.log('devicePtr == null'); return; }
                    console.debug('devicePtr=' + devicePtr);
                    DevicePtrMap.set(uuid, devicePtr);
                    cmsn_set_config_resp_callback(devicePtr);
                }
                var msgId = cmsn_gen_msg_id();
                var data = params.isInPairingMode == true ?
                    cmsn_sys_config_pair_pack(uuid, msgId) :
                    cmsn_sys_config_validate_pair_info_pack(uuid, msgId);
                writeValue(event, uuid, msgId, data, function (uuid, success, message) {
                    if (success) {
                        console.log(`----onPair Success`);
                        sendCmd(3, event, uuid);//Enum.CMD.enum('startDataStream')
                        setTimeout(() => {
                            sendCmd(14, event, uuid);//Enum.CMD.enum('getLeadOff')
                        }, 1000);
                    } else {
                        console.error(`----onPair Failed`);
                    }
                });
                break;
            case -2:
            // case Enum.CMD.enum('imuConfig'):
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                var msgId = cmsn_gen_msg_id();
                var data = cmsn_config_imu_pack(msgId, params.sampleRate);
                writeValue(event, uuid, msgId, data, cb);
                break;

            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 13:
            case 14:
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                sendCmd(cmd, event, uuid);
                break;
            
            case 9:
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                var color = params.color;
                var r = color[0];
                var g = color[1];
                var b = color[2];
                console.log('set_led_color, r=' + r + ', g=' + g + ', b=' + b);
                var msgId = cmsn_gen_msg_id();
                var data = cmsn_set_led_color_pack(msgId, r, g, b);
                writeValue(event, uuid, msgId, data, cb);
                break;

            case 10:
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                var name = params.name;
                var msgId = cmsn_gen_msg_id();
                var data = cmsn_set_device_name_pack(msgId, name);
                writeValue(event, uuid, msgId, data, cb);
                break;
            
            case 11:
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                var msgId = cmsn_gen_msg_id();
                var data = cmsn_set_sleep_pack(msgId, params.value);
                writeValue(event, uuid, msgId, data, cb);
                break;
            
            case 12:
                if (devicePtr == null) { console.log('devicePtr == null'); return; }
                var msgId = cmsn_gen_msg_id();
                var data = cmsn_set_vibration_pack(msgId, params.value);
                writeValue(event, uuid, msgId, data, cb);
                break;
            default:
                break
        }
    });
})();

function toHex(num) {//将一个数字转化成16进制字符串形式
    var ret = num < 16 ? "0" + num.toString(16).toUpperCase() : num.toString(16).toUpperCase();
    return ret;
}

function toUint8Array(ptr) {
    var view = new Uint8Array(CrimsonSDK.HEAPU8.subarray(ptr, ptr + 6)); // read body_size
    var body_size = view[4] * 256 + view[5]; //(buffer[0] << 8) + buffer[1];
    var len = body_size + 10; //body_size + PKT_WRAPPER_LEN
    var arr = new Uint8Array(CrimsonSDK.HEAPU8.subarray(ptr, ptr + len));
    return arr;
}

function getFloatArray(ptr, size) {
    return new Float32Array(CrimsonSDK.HEAPF32.subarray(ptr, ptr + size));
}

function sendCmd(cmd, event, uuid) {
    var msgId = cmsn_gen_msg_id();
    var data = cmsn_sys_config_pack(cmd, msgId);
    writeValue(event, uuid, msgId, data)
}

function writeValue(event, uuid, msgId, data, cb) {
    if (cb) resCallbacks[msgId] = function (success, message) {
        cb(uuid, success, message);
    };
    const arr = toUint8Array(data);
    postMessage(event, 'writeValue', { deviceId: uuid, data: arr });

    // DEBUG
    // var str = '';
    // arr.forEach(item => { str = str.concat(toHex(item)); });
    // console.debug('----write value---');
	// console.debug(str);
}

function postMessage(event, command, params) {
    // console.log(event.source);
    event.source.postMessage({
        command: command,
        params: params
    }, '*'); //event.origin
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- - Callback Function-- -- -- -- -- -- --- -- -- -- -- -- -- -- --
function onConfigResp(deviceId, msgId, success, error, cmd) {
    console.log(`onConfigResp, msgId=${msgId}`);
    var cb = resCallbacks[msgId];
    var success = success == 0;
    var message = "";//todo
    console.log(`success=${success}, message=${message}`);
    if (cb != undefined) cb(success, message);
}

function onSignalQualityWarning(deviceId, quality) {
    console.log('onSignalQualityWarning, ' + quality);

    //getLeadOffStatus
    sendCmd(14, shared_event, deviceId);
}

function onLeadOff(deviceId, center, side) {
    // console.log('onLeadOff, center=' + center + ", side=" + side);
}

function onContactStateChanged(deviceId, contactState) {
    // console.log('onContactStateChanged, ' + contactState);
    postMessage(shared_event, 'onContactStateChanged', { deviceId: deviceId, contactState: contactState });
}

function onOrientationChanged(deviceId, orientation) {
    // console.log('onOrientationChanged, ' + orientation);
    postMessage(shared_event, 'onOrientationChanged', { deviceId: deviceId, orientation: orientation });
}

function onEEGData(deviceId, eeg) {
    // console.log('onEEGData');
    postMessage(shared_event, 'onEEGData', { deviceId: deviceId, eeg: eeg });
}

function onBrainWave(deviceId, stats) {
    // console.log('onBrainWave');
    postMessage(shared_event, 'onBrainWave', { deviceId: deviceId, stats: stats });
}

function onIMUData(deviceId, imu) { //TODO
    // console.debug('onIMUData');
    postMessage(shared_event, 'onIMUData', { deviceId: deviceId, imu: imu });
}

function onAttention(deviceId, value) {
    // console.log('onAttention, ' + value);
    postMessage(shared_event, 'onAttention', { deviceId: deviceId, value: value });
}

function onMeditation(deviceId, value) {
    // console.log('onMeditation, ' + value);
    postMessage(shared_event, 'onMeditation', { deviceId: deviceId, value: value });
}

function testJSFunc(msg) {
    console.log('testJSFunc: ' + msg);
}

function toJsString(val) {
    const len = cmsn_get_string_len(val);
    // console.log(`toJsString, len=${len}`);
    const uint8array = new Uint8Array(CrimsonSDK.HEAPU8.subarray(val, val + len));
    return new TextDecoder("utf-8").decode(uint8array);
}