function parse(text) {
  if (text == 'OK') {
    // TIMEOUT RESET
    return;
  }

  let device;
  try {
    device = JSON.parse(text.replaceAll("\'", "\""));
  } catch (e) {
    return;
  }

  if (device.net_id != cfg.net_id) return;  // не наша сеть
  // TIMEOUT RESET

  let id = device.dev_id;

  if (device.type == 'find') {
    if (id in devices) {
      if (device.mqtt) {    // пришёл девайс с mqtt
        if (!devices[id].mqtt) return;  // у нас он уже есть, но по tcp
      } else {              // пришёл девайс с tcp
        // если у нас был mqtt - меняем на tcp
        if (devices[id].mqtt) getEl(`address#${device.dev_id}`).innerHTML = device.ip;
      }
      devices[id] = device;
    } else {
      devices[id] = device;
      addDevice(device);
    }
    if (id == focused) openControls(id);
  } else if (device.type == 'update') {   // апдейт

  }
}

function openControls(id) {
  focused = id;
  getEl('title').innerHTML = '[' + devices[id].name + ']';
  getEl('devices').style.display = 'none';
  getEl('back').style.display = 'block';
  getEl('controls').innerHTML = '';

  for (ctrl of devices[id].controls) {
    switch (ctrl.type) {
      case 'update': addUpdate(ctrl, id); break;
      case 'buttons': addButtons(ctrl, id); break;
      case 'buttons_i': addButtons_i(ctrl, id); break;
      case 'spacer': addSpacer(ctrl, id); break;
      case 'tabs': addTabs(ctrl, id); break;
      case 'title': addTitle(ctrl, id); break;
      case 'led': addLed(ctrl, id); break;
      case 'label': addLabel(ctrl, id); break;
      case 'input': addInput(ctrl, id); break;
      case 'pass': addPass(ctrl, id); break;
      case 'slider': addSlider(ctrl, id); break;
      case 'switch': addSwitch(ctrl, id); break;
      case 'date': addDate(ctrl, id); break;
      case 'time': addTime(ctrl, id); break;
      case 'list': addList(ctrl, id); break;
    }
  }

  getEl('controls').style.display = 'block';
}


// =================== BUILDERS ===================
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

function addUpdate(ctrl, id) {

}
function addButtons(ctrl, id) {
  let inner = '';
  for (i in ctrl.label) {
    inner += `<button class="c_btn" onclick="postClick('${id}','${ctrl.name[i]}','')">${ctrl.label[i]}</button>`;
  }

  getEl('controls').innerHTML += `
  <div class="control control_nob">
    ${inner}
  </div>
  `;
}
function addButtons_i(ctrl, id) {
  let inner = '';
  for (i in ctrl.label) {
    inner += `<button class="c_btn w_icon" onclick="postClick('${id}','${ctrl.name[i]}','')">${ctrl.label[i]}</button>`;
  }

  getEl('controls').innerHTML += `
  <div class="control control_nob">
    ${inner}
  </div>
  `;
}
function addTabs(ctrl, id) {
  let inner = '';
  for (i in ctrl.label) {
    let sel = (i == ctrl.sel) ? 'class="tab_act"' : '';
    inner += `<li onclick="postClick('${id}','${ctrl.name}','${i}')" ${sel}>${ctrl.label[i]}</li>`;
  }

  getEl('controls').innerHTML += `
  <div class="navtab">
    <ul>
      ${inner}
    </ul>
  </div>
  `;
}
function addSpacer(ctrl, id) {
  getEl('controls').innerHTML += `
    <div style="height:${ctrl.size}px"></div>
  `;
}
function addTitle(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control control_nob">
    <span class="c_title">${ctrl.value}</span>
  </div>
  `;
}
function addLed(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <span class="icon" id='#${ctrl.name}' style="color:${ctrl.color}">${ctrl.value}</span>
  </div>
  `;
}
function addLabel(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <label class="c_label" id='#${ctrl.name}' style="color:${ctrl.color}">${ctrl.value}</label>
  </div>
  `;
}
function addInput(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <div class="cfg_inp_row">
      <input class="cfg_inp" type="text" value="${ctrl.value}" id="#${ctrl.name}">
      <div class="cfg_btn_block">
        <button class="icon cfg_btn" onclick="postClick('${id}','${ctrl.name}',getEl('#${ctrl.name}').value)"></button>
      </div>
    </div>
  </div>
  `;
}
function addPass(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <div class="cfg_inp_row">
      <input class="cfg_inp" type="password" value="${ctrl.value}" id="#${ctrl.name}">
      <div class="cfg_btn_block2">
        <button class="icon cfg_btn" onclick="togglePass('#${ctrl.name}')"></button>
        <button class="icon cfg_btn" onclick="postClick('${id}','${ctrl.name}',getEl('#${ctrl.name}').value)"></button>
      </div>
    </div>
  </div>
  `;
}
function addSlider(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <div class="sld_name">
      <label>${ctrl.label}</label>
      <label>:&nbsp;</label>
      <output id="${ctrl.name}">${ctrl.value}</output>
    </div>
    <div class="cfg_inp_row">
      <input onclick="postClick('${id}','${ctrl.name}',this.value)" oninput="document.getElementById('${ctrl.name}').value=value" type="range" class="qs_range" value="${ctrl.value}" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}">
    </div>
  </div>
  `;
}
function addSwitch(ctrl, id) {
  let ch = ctrl.value ? 'checked' : '';
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <label class="switch"><input type="checkbox" id='#${ctrl.name}' onclick="postClick('${id}','${ctrl.name}',(this.checked ? 1 : 0))" ${ch}><span class="slider"></span></label>
  </div>
  `;
}
function addDate(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <input class="c_base_inp" type="date" value="${ctrl.value}" onchange="postClick('${id}','${ctrl.name}',this.value)">
  </div>
  `;
}
function addTime(ctrl, id) {
  getEl('controls').innerHTML += `
  <div class="control">
    <label>${ctrl.label}</label>
    <input class="c_base_inp" type="time" value="${ctrl.value}" onchange="postClick('${id}','${ctrl.name}',this.value)">
  </div>
  `;
}
function addList(ctrl, id) {
  let elms = ctrl.value.split(',');
  let inner = '';
  for (i in elms) {
    let sel = (i == ctrl.sel) ? 'selected' : '';
    inner += `<option value="${i}" ${sel}>${elms[i]}</option>`;
  }

  getEl('controls').innerHTML += `
  <div class="control">
  <label>${ctrl.label}</label>
    <select class="c_base_inp" onchange="postClick('${id}','${ctrl.name}',this.value)">
      ${inner}
    </select>
  </div>
  `;
}

// ================ UTILS =================
function togglePass(id) {
  if (getEl(id).type == 'text') getEl(id).type = 'password';
  else getEl(id).type = 'text';
}