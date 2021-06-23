/** Close btn */

document.getElementById('close-btn').addEventListener('click', ()=>{
    chrome.runtime.sendMessage({type: 'toggle'});
});

/** Screen Navigation */

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

/** Listen to device connected event */
chrome.runtime.onMessage.addListener(({type, payload})=>{
    if(type === 'device-connected'){
        activateScreen('screen-2');
    }
    if(type === 'update-device-list'){
        updateDeviceList(payload);
    }
});

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getReadableDate(timestamp){
    if(!timestamp){
        return 'undefined';
    }
    const date = new Date(timestamp);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function updateDeviceList(devices){
    console.log(devices);
    const container =  document.getElementById('device-history');
    if(!(Array.isArray(devices) && devices.length > 0)){
        container.innerHTML = `<p>No device found</p>`;
    } else {
        container.innerHTML = devices.map((each, index)=>`
                    <div>
                      <img data-remove-device="${each.id}" src='./images/prevConnection.svg' alt=""/>
                      <div>
                          <p>${each.name || 'Undefined'}</p>
                          <li>${each.id}</li>
                          <li>Last connected on ${getReadableDate(each.at)}</li>
                      </div>
                      <h5>Connect</h5>
                  </div>
        `)
    }
}

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