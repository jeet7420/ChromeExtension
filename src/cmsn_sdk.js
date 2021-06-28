// 'use strict';
import * as Enum from './cmsn_enum.js';

// Global Variable
let globalDevice; // todo multi device implement
const DeviceMap = new Map(); // (uuid: string, device)

// bstar
// const data_stream_service_uuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
// const data_stream_uuid_write   = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
// const data_stream_uuid_notify  = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

//crimson
const data_stream_service_uuid = "0d740001-d26f-4dbb-95e8-a4f5c55c57a9"
const data_stream_uuid_write   = "0d740002-d26f-4dbb-95e8-a4f5c55c57a9"
const data_stream_uuid_notify  = "0d740003-d26f-4dbb-95e8-a4f5c55c57a9"

const availableCallbacks = {
        'onError':               '(CMSNDevice, Error)=>Void',
        'onConnectivityChanged': '(CMSNDevice, Connectivity)=>Void',
        'onDeviceInfoReady':     '(CMSNDevice, DeviceInfo)=>Void',
        'onPairResponse':        '(CMSNDevice, SysConfigResponse)=>Void',
        'onContactStateChanged': '(CMSNDevice, ContactState)=>Void',
        'onOrientationChanged':  '(CMSNDevice, Orientation)=>Void',
        'onBrainWave':           '(CMSNDevice, BrainWave)=>Void',
        'onEEGData':             '(CMSNDevice, EEGData)=>Void',
        'onIMUData':             '(CMSNDevice, IMUData)=>Void',
        'onAttention':           '(CMSNDevice, Float)=>Void',
        'onMeditation':          '(CMSNDevice, Float)=>Void',
};
export class CMSNDeviceListener {
    constructor(callbacks) {
        const cbs = callbacks? callbacks : {};
        for (const [key, cb] of Object.entries(cbs)) {
            if(key in availableCallbacks){
                if(typeof cb == 'function') this[key] = cb;
                else console.error(`ERROR: Callback for ${key} is not a function, should be ${CMSNDeviceListener.availableCallbacks[key]}`);
            } else console.error(`ERROR:${key} is not an option for ${this}`);            
        }
    }
}
export class CMSNDevice {
    constructor(window) {
        this.window = window;
    }

    async setup(listener) {
        this.listener = listener;
        if (this.bleDevice != null) return;
        try {
            const isBluetoothAvailable = await navigator.bluetooth.getAvailability();
            console.log(`> Bluetooth is ${isBluetoothAvailable ? 'available' : 'unavailable'}`);
            if (!isBluetoothAvailable) return;

            if ('onavailabilitychanged' in navigator.bluetooth) {
                navigator.bluetooth.addEventListener('availabilitychanged', function (event) {
                    console.log(`> Bluetooth is ${event.value ? 'available' : 'unavailable'}`);
                });
            }

            console.log('Requesting any Bluetooth Device...');

            // let options = {acceptAllDevices: true};
            // const device = await navigator.bluetooth.requestDevice(options);
            // return device;
            // navigator.bluetooth.requestDevice(options).then(function(device) {
            //     console.log({device});
            //     console.log('Name: ' + device.name);
            // });


            const bleDevice = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                // filters: [{
                //     services: [data_stream_service_uuid]
                // }],
                optionalServices: ['battery_service', 'device_information', data_stream_service_uuid]
            });
            if (bleDevice) {
                console.log(bleDevice);
                this.bleDevice = bleDevice;
                bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
                // await this.bleDevice.gatt.connect();
                this.uuid = bleDevice.id;
                this.name = bleDevice.name;
                console.log(`uuid=${this.uuid}, name=${this.name}`)
                DeviceMap.set(this.uuid, this);
                globalDevice = this;
                await this.connect();
                //bleDevice.pair(true);
                return bleDevice;
            }

        } catch (error) {
            console.log('Argh! ' + error);
        }
    }

    async exponentialBackoff(max, delay, toTry, success, fail) {
        const that = this;
        try {
            success(this, await toTry(this));
        } catch (error) {
            if (max === 0) {
                return fail();
            }
            console.log('Retrying in ' + delay + 's... (' + max + ' tries left)');
            setTimeout(function () {
                that.exponentialBackoff(--max, delay * 2, toTry, success, fail);
            }, delay * 1000);
        }
    }

    async connect() {
        await this.onTryConnect();
        await this.onConnected();
        // this.exponentialBackoff(
        //     3, /* max retries */
        //     1, /* seconds delay */
        //     this.onTryConnect,
        //     this.onConnected,
        //     function fail() {
        //         console.log('Failed to connect.');
        //     });
    }

    async onTryConnect() {
        console.log('Connecting to Bluetooth Device... ');
        this.connectivity = Enum.CONNECTIVITY.enum('connecting');
        console.log(this.bleDevice.gatt);
        return await this.bleDevice.gatt.connect();
    }

    async onConnected() {
        console.log('> Bluetooth Device connected.');
        this.connectivity = Enum.CONNECTIVITY.enum('connected');
        
        console.log('Getting Services...');
        const services = await this.bleDevice.gatt.getPrimaryServices();

        const decoder = new TextDecoder('utf-8');
        console.log('Getting Characteristics...');

        try {
            const deviceInfo = {};
            for (const service of services) {
                console.log('> Service: ' + service.uuid);
                const characteristics = await service.getCharacteristics();

                for (const characteristic of characteristics) {
                    //console.log('>> Characteristic: ' + characteristic.uuid + ', service.uuid=' + service.uuid);
                    if (service.uuid == data_stream_service_uuid) {
                        if (characteristic.properties.write) {
                            console.log(`characteristicWrite=${characteristic}`);
                            this.characteristicWrite = characteristic;

                        } else if (characteristic.properties.notify) {
                            console.log(`characteristicNotify=${characteristic}`);
                            this.characteristicNotify = characteristic;
                            await characteristic.startNotifications();
                            characteristic.addEventListener('characteristicvaluechanged', onCharacteristicValueChanged);
                        }

                    } else {
                        switch (characteristic.uuid) {
                            case BluetoothUUID.getCharacteristic('battery_level'):
                                await characteristic.startNotifications();
                                characteristic.addEventListener('characteristicvaluechanged', onBatteryLevelChanged);
                                await characteristic.readValue();
                                break;
                            //0x2a24~0x2a29
                            case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
                                const manufacturer = await characteristic.readValue();
                                deviceInfo.manufacturer = decoder.decode(manufacturer);
                                console.log('> manufacturer_name: ' + deviceInfo.manufacturer);
                                break;
                            case BluetoothUUID.getCharacteristic('model_number_string'):
                                const model = await characteristic.readValue();
                                deviceInfo.model = decoder.decode(model);
                                console.log('> model_number: ' + deviceInfo.model);
                                break;
                            case BluetoothUUID.getCharacteristic('serial_number_string'):
                                const serial = await characteristic.readValue();
                                deviceInfo.serial = decoder.decode(serial);
                                console.log('> serial_number: ' + deviceInfo.serial);
                                break;
                            case BluetoothUUID.getCharacteristic('hardware_revision_string'):
                                const hardware = await characteristic.readValue();
                                deviceInfo.hardware = decoder.decode(hardware);
                                console.log('> hardware_revision: ' + deviceInfo.hardware);
                                break;
                            case BluetoothUUID.getCharacteristic('firmware_revision_string'):
                                const firmware = await characteristic.readValue();
                                deviceInfo.firmware = decoder.decode(firmware);
                                console.log('> firmware_revision: ' + deviceInfo.firmware);
                                break;
                        }
                    }
                }
            }
            this.deviceInfo = deviceInfo;
            if (this.listener) this.listener.onDeviceInfoReady(this, this.deviceInfo);

        } catch (error) {
            console.log('Argh! ' + error);
        }
    }

    /**
     * @param {Enum.CONNECTIVITY} connectivity
     */
    set connectivity(connectivity) {
        this._connectivity = connectivity;
        if (this.listener) this.listener.onConnectivityChanged(this, connectivity);
    }

    reset() {
        this.characteristicWrite = undefined;
        this.characteristicNotify = undefined;
    }

    sendMessage(params) {
        if (this.characteristicWrite == undefined) {
            console.warn('device is not reday.');
            return;
        }
        params.cb = undefined; // TODO can not post function params
        console.log(`sendMessage, ${JSON.stringify(params)}`);
        this.postToSanbox('sendMessage', params);
    }

    postToSanbox(command, params) {
        var message = {
            uuid: this.uuid,
            command: command,
            params: params
        };
        this.window.postMessage(message, '*');
    }

    pair(isInPairingMode) {
        this.sendMessage({
            cmd: Enum.CMD.enum('pair'), isInPairingMode: isInPairingMode,
            // cb: function (deviceId, success, message) {
            //     if (this.listener) this.listener.onPairResponse(this, success);
            // } 
        });
    }

    startDataStream() {
        this.sendMessageWithCmd(Enum.CMD.enum('startDataStream'));
    }

    stopDataStream() {
        this.sendMessageWithCmd(Enum.CMD.enum('stopDataStream'));
    }

    startIMU(sampleRate, cb) {
        var params = {cmd: Enum.CMD.enum('afeConfig'), sampleRate: sampleRate, cb: cb}
        console.log(`startIMU, ${params}`);
        this.sendMessage(params);
    }

    stopIMU(cb) {
        var params = { cmd: Enum.CMD.enum('imuConfig'), sampleRate: Enum.IMU.SAMPLE_RATE.unused, cb: cb};
        console.log(`stopIMU, ${params}`);
        this.sendMessage(params);
    }

    setLedColor(color) {
        this.sendMessage({ cmd: Enum.CMD.enum('setLedColor'), color: color });
    }

    setDeviceName(name, cb) {
        this.sendMessage({ cmd: Enum.CMD.enum('setDeviceName'), name: name, cb: cb });
    }

    setSleepIdleTime(sleepIdleTime, cb) {
        this.sendMessage({ cmd: Enum.CMD.enum('setSleepIdleTime'), value: sleepIdleTime, cb: cb });
    }

    setVibrationIntensity(vibration, cb) {
        this.sendMessage({ cmd: Enum.CMD.enum('setVibrationIntensity'), value: vibration, cb: cb });
    }

    sendMessageWithCmd(cmd, cb) {
        this.sendMessage({ cmd: cmd, cb: cb });
    }
}

window.addEventListener('message', async function (event) {
    console.log('Event : ', event);
    const command = event.data.command;
    const params = event.data.params || {};
    console.log('Command : ', command);
    console.log('Params : ', params);
    // console.debug(`getMessage, command=${command}`);
    // console.debug(`getMessage, params=${JSON.stringify(params)}`);
    
    // TODO
    const deviceId = params.deviceId;
    const device = DeviceMap.get(deviceId);
    console.log('Device Id : ', deviceId);
    console.log('Device : ', device);
    if (device == null) {
        console.error('device == null');
        return;
    }
    // const device = globalDevice;
    
    switch (command) {
        case 'onContactStateChanged':
            const contactState = params.contactState;
            // console.log(`[${device.name}] onContactStateChanged: ${contactState}`);
            if (device && device.listener) device.listener.onContactStateChanged(device, contactState);
            break;
        case 'onOrientationChanged':
            const orientation = params.orientation;
            // console.log(`[${device.name}] onOrientationChanged: ${orientation}`);
            if (device && device.listener) device.listener.onOrientationChanged(device, orientation);
            break;
        case 'onEEGData':
            const eeg = params.eeg;
            // console.log(`[${device.name}] onEEGData: ${eeg}`);
            if (device && device.listener) device.listener.onEEGData(device, eeg);
            break;
        case 'onBrainWave':
            const stats = params.stats;
            // console.log(`[${device.name}] onBrainWave: ${stats}`);
            if (device && device.listener) device.listener.onBrainWave(device, stats);
            break;
        case 'onIMUData':
            const imu = params.imu;
            // console.log(`[${device.name}] onIMUData: ${imu}`);
            if (device && device.listener) device.listener.onIMUData(device, attention);
            break;    
        case 'onAttention':
            const attention = params.value;
            // console.log(`[${device.name}] onAttention: ${attention}`);
            if (device && device.listener) device.listener.onAttention(device, attention);
            break;
        case 'onMeditation':
            const meditation = params.value;
            // console.log(`[${device.name}] onMeditation: ${meditation}`);
            if (device && device.listener) device.listener.onMeditation(device, meditation);
            break;
        case 'writeValue':
            if (device.characteristicWrite == undefined) {
                console.log('characteristicWrite null');
                return;
            }
            device.characteristicWrite.writeValue(params.data);
            // const value = params.data;
            // console.log(value);
            // console.log(device.characteristicWrite);
            break;
        default: break; 
    }
});

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
    console.log(this);
    const device = DeviceMap.get(this.id);
    console.log(device);
    if (device) {
        device.reset();
        this.connectivity = Enum.CONNECTIVITY.enum('disconnected');
        
        // setTimeout(() => {
        //     device.connect(); // try reconnect
        // }, 1000);
    }  
}

function onBatteryLevelChanged(event) {
    const batteryLevel = event.target.value.getUint8(0);
    console.log('> Battery Level is ' + batteryLevel + '%');
    // console.log(event);
    globalDevice.batteryLevel = batteryLevel;
    // const device = DeviceMap.get(this.id);
    // console.log(device);
    // if (device) {
    //     device.batteryLevel = batteryLevel;
    // }
}

function onCharacteristicValueChanged(event) {
    const value = event.target.value;
    const arrayBuffer = value.buffer;
    const data = new Uint8Array(arrayBuffer);
    // console.log(event);
    globalDevice.postToSanbox('didReceiveData', { data: data });
    // const device = DeviceMap.get(this.id);
    // console.log(device);
    // if (device) {
    //     device.postToSanbox('didReceiveData', { data: data });
    // }
}

// module.exports = {
//     CMSNDeviceListener,
//     CMSNDevice,
// };