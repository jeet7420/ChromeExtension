/** Close btn */

document.getElementById('close-btn').addEventListener('click', ()=>{
    chrome.runtime.sendMessage({type: 'toggle'});
});

/**
 * Screen Navigation
 *  
 * Any html element with data-navigate="SCREEN_ID" would work as navigator
 * SCREEN_ID denotes the id of the screen
 * Here, we have 3 screens (screen-1, screen-2, screen-3)
 * 
 * */

function activateScreen(id){
    document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.addEventListener('click', e=>{
    try{
        var target = e.target.dataset.navigate;
        if(target){
            e.preventDefault();
            e.stopPropagation();
            activateScreen(target);
        }
    } catch(e){}
});

/** Bluetooth connection buttons */

document.getElementById('btn-scan-bluetooth').addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({type: 'connect-new'});
});

document.getElementById('btn-pair').addEventListener('click', (e)=>{
    console.log('Pair Request');
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({type: 'pair'});
});

document.getElementById('pair-new-device').addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({type: 'connect-new'});
});

document.getElementById('btn-disconnect').addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({type: 'disconnect'});
});

/** Listen to device connected event */
chrome.runtime.onMessage.addListener(({type, payload})=>{
    if(type === 'device-connected'){
        activateScreen('screen-2');
    }
    if(type === 'disconnected'){
        activateScreen('screen-1');
    }
    if(type === 'update-device-list'){
        updateDeviceList(payload);
    }
});

/**
 * A helper function to convert timestamp to readable date
 * @param {?number} timestamp 
 * @returns {string} 
 */

function getReadableDate(timestamp){
    if(!timestamp){
        return 'undefined';
    }
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(timestamp);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Helper function to update device list
 * @param {{id: string, name: string, at?: number}[]} devices 
 */

function updateDeviceList(devices){
    const container =  document.getElementById('device-history');
    if(!(Array.isArray(devices) && devices.length > 0)){
        container.innerHTML = `<p>No device found</p>`;
    } else {
        container.innerHTML = devices.map((each)=>`
                    <div>
                      <img data-remove-device="${each.id}" src='./images/prevConnection.svg' alt=""/>
                      <div>
                          <p>${each.name || 'Undefined'}</p>
                          <li>${each.id}</li>
                          <li>Last connected on ${getReadableDate(each.at)}</li>
                      </div>
                      <h5 data-connect='${JSON.stringify(each)}'>Connect</h5>
                  </div>
        `)
    }
}

/**
 * Device remove function by clicking (-) icon
 */
chrome.runtime.sendMessage({type: 'get-previous-devices'}, updateDeviceList);

document.addEventListener('click', e=>{
    try{
        var payload = e.target.dataset.removeDevice;
        if(payload){
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({type: 'remove-previous-device', payload})
        }
    } catch(e){}
});

// const window = document.getElementById('sandboxFrame').contentWindow;

// chrome.runtime.sendMessage({type: 'window', payload: window});


/**
 * Connect button functionality
 */

 document.addEventListener('click', e=>{
    try{
        var deviceInfoRaw = e.target.dataset.connect;
        if(deviceInfoRaw){
            var device = JSON.parse(deviceInfoRaw);
            console.log({device});
            e.preventDefault();
            e.stopPropagation();
            alert(`Unable to connect ${JSON.stringify(deviceInfoRaw)}`)
        }
    } catch(e){}
});