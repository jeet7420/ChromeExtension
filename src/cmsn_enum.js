/* Enum */

// Enum: ERROR
export const ERROR = createEnum({
    unknown: 0,

    // BLE device error codes
    ble_device_unreachable: -128,
    ble_not_enabled: -129,
});

// Enum: CMD
export const CMD = createEnum({
    afeConfig: -1,
    imuConfig: -2,
    unused: 0,
    pair: 1,
    checkPairStatus: 2,
    startDataStream: 3,
    stopDataStream: 4,
    shutdown: 5,
    enterOTA: 6,
    enterFactoryMode: 7,
    restoreFactorySettings: 8,
    setLEDColor: 9,
    setDeviceName: 10,
    setSleepIdleTime: 11,
    setVibrationIntensity: 12,
    getSystemInfo: 13,
    getLeadOffStatus: 14,
});

// Enum: CONNECTIVITY
export const CONNECTIVITY = createEnum({
    connecting: 0,
    connected: 1,
    disconnecting: 2,
    disconnected: 3,
});

// Enum: CONTACT_STATE
export const CONTACT_STATE = createEnum({
    unknown: 0,
    contact: 1,
    no_contact: 2,
});

// Enum: ORIENTATION
export const ORIENTATION = createEnum({
    unknown: 0,
    bottomUp: 1,
    leftArmEndUp: 2,
    leftArmEndDown: 3,
    topUp: 4,
    leftFaceUp: 5,
    leftFaceDown: 6
});

// Enum: AFE.SAMPLE_RATE, AFE.CHANNEL, AFE.LEAD_OFF_OPTION
export const AFE = {
    SAMPLE_RATE: createEnum({
        sr125: 0,
        sr250: 1,
        sr500: 2,
        sr1000: 3,
    }),

    CHANNEL: createEnum({
        none: 0,
        ch1: 1,
        ch2: 2,
        both: 3,
    }),

    LEAD_OFF_OPTION: createEnum({
        disabled: 0,
        ac: 1,
        dc_6na: 2,
        dc_22na: 3,
        dc_6ua: 4,
        dc_22ua: 5,
    })
};

// Enum: ACC.SAMPLE_RATE, ACC.OPTION
export const ACC = {
    SAMPLE_RATE: createEnum({
        sr1: 0,
        sr10: 1,
        sr25: 2,
        sr50: 3,
        sr100: 4,
        sr200: 5,
    }),

    OPTION: createEnum({
        disabled: 0,
        raw: 1,
        six_d: 2,
    })
};

export const IMU = {
    SAMPLE_RATE: createEnum({
        unused: 0,
        sr125: 0x10,
        sr26: 0x20,
        sr52: 0x30,
        sr104: 0x40,
        sr208: 0x50,
        sr416: 0x60,
        sr833: 0x70,
    }),
};

/* Example:
 * const STATE = createEnum({
 * on: 0,
 * off: 1
 * });
 *
 * STATE.ON => 'on'
 * STATE.OFF => 'off'
 *
 * STATE(0) => 'on'
 * STATE(1) => 'off'
 * STATE(2) => Error: unknown input enum: 2.
 *
 * STATE.enum.ON => 0
 * STATE.enum.OFF => 1
 *
 * STATE.enum('on') => 0
 * STATE.enum('off') => 1
 * STATE.enum(null) => Error: unknown input value: null.
 */
function createEnum(input, type = String) {
    // check the input, which should be one-to-one relationship
    let doc = ` ENUM => VALUE (${type.name})\n`;
    doc += ' -----------------------\n';
    const valueMap = new Map();
    const enumMap = new Map();
    for (const v in input) {
        const val = type(v);
        const num = input[val];
        if (enumMap.has(num)) {
            throw Error(`the enum '${num}' is duplicated`);
        }
        valueMap.set(val, num);
        enumMap.set(num, val);
        doc += ` ${num} => ${val}\n`;
    }

    const FN = (num) => {
        if (!enumMap.has(num)) {
            throw Error(`Invalid Enum: ${num}. The enum/value should be:\n${doc}`);
        }
        return enumMap.get(num);
    }

    FN.enum = (val) => {
        if (!valueMap.has(val)) {
            throw Error(`Invalid Value: ${val}. The enum/value should be:\n${doc}`);
        }
        return valueMap.get(val);
    }

    for (const val in input) {
        const symbol = String(val).toUpperCase();
        FN[symbol] = type(val);
        FN.enum[symbol] = input[val];
    }

    return FN;
}

// module.exports = {
//     CMD,
//     CONNECTIVITY,
//     CONTACT_STATE,
//     ORIENTATION,
//     AFE,
//     IMU,
//     ACC,
// };