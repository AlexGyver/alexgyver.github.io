function parse(text) {
  if (text == 'OK') {
    // TIMEOUT RESET
    console.log('got OK');
    return;
  }

  let device;
  try {
    device = JSON.parse(text.replaceAll("\'", "\""));
  } catch (e) {
    console.log('JSON error');
    return;
  }

  if (device.net_id != cfg.net_id) return;  // не наша сеть
  // TIMEOUT RESET
  console.log('read packet');

  let id = device.dev_id;
  if (device.type == 'find') {    // поиск
    if (id in devices) {          // уже есть
      if (!device.mqtt && devices.id.mqtt) {  // он TCP, но у нас записан как MQTT
        devices.id.mqtt = false;
        getEl(`address#${device.dev_id}`).innerHTML = device.mqtt ? (device.net_id + '/' + device.dev_id) : device.ip;;
      }
    } else {
      devices[id] = device;
      addDevice(device);
    }
  } else if (device.type == 'update') {   // апдейт
    
  }
}

function addDevice(device) {
  let addr = device.mqtt ? (device.net_id + '/' + device.dev_id) : device.ip;
  getEl('devices').innerHTML += `
  <div class="device" onclick="openControls('${device.dev_id}')" id="${device.dev_id}">
    <div class="d_icon"><span class="icon">${device.icon}</span></div>
    <div class="d_head">
      <span class="d_name">${device.name}</span>
      <span class="d_address" id="address#${device.dev_id}">${addr}</span>
    </div>
    <div class="d_status">
      <div><span class="icon d_wifi"></span><span>${device.rssi}</span>%</div>
      <div class="d_status_in">${device.status}</div>
    </div>
  </div>`;
}

function openControls(id) {  
  focused = id;
  getEl('title').innerHTML = '[' + devices[id].name + ']';
  getEl('devices').style.display = 'none';
  getEl('controls').style.display = 'block';
  getEl('back').style.display = 'block';
}
function closeControls() {
  focused = null;
  getEl('title').innerHTML = 'GyverHUB';
  getEl('devices').style.display = 'block';
  getEl('controls').style.display = 'none';
  getEl('back').style.display = 'none';
}

function post(id, value) {

}