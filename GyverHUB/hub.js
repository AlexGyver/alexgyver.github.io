// ============ VARS =============
let mq_client;
let mqtt_state = false;
let devices;
let focused = null;
let cfg = { 'darkmode': false, 'net_id': 'MyDevices', 'use_tcp': false, 'tcp_ip': '', 'tcp_port': 50000, 'use_mqtt': false, 'mq_host': '', 'mq_port': '', 'mq_login': '', 'mq_pass': '' };
const theme = [
  ['#202122', '#2b2b2c', '#eee', '#ccc', '#1b1c1d'],
  ['#eee', '#fff', '#111', '#333', '#ddd']
];  // back/tab/font/font2/dark

load_cfg();
//scan();

function toggle_cfg() {
  let cfg_s = getEl('cfg').style;
  let dev_s = getEl('devices').style;
  if (cfg_s.display == 'block') {
    cfg_s.display = 'none';
    dev_s.display = 'block';
    save_cfg();
    if (!cfg.use_mqtt) spinColor(0);
    scan();
  } else {
    cfg_s.display = 'block';
    dev_s.display = 'none';
    if (mqtt_state) {
      mqtt_state = false;
      mq_client.end();
    }
  }
}

function scan() {
  console.log('update...');
  getEl('devices').innerHTML = "";
  devices = [];
  if (cfg.use_mqtt) mq_start();
  if (cfg.use_tcp) scan_tcp();
}

// ============ MQTT =============
function mq_start() {
  const url = 'wss://' + cfg.mq_host + ':' + cfg.mq_port + '/mqtt';
  const clientId = 'GHUB-' + Math.round(Math.random() * 0xffffffff).toString(16);

  const options = {
    keepalive: 60,
    clientId: clientId,
    username: cfg.mq_login,
    password: cfg.mq_pass,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 20 * 1000,
    /*will: {
      topic: 'willmsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false
    },*/
  }

  if (!mqtt_state) {
    mq_client = mqtt.connect(url, options);
    console.log('connect...');
  }

  mq_client.on('connect', function () {
    console.log('connected');
    mqtt_state = true;
    mq_client.subscribe(cfg.net_id + '_app');
    spinColor(1);
  });

  mq_client.on('error', function (err) {
    mqtt_state = false;
    mq_client.end();
    spinColor(2);
  });

  mq_client.on('close', function () {
    mqtt_state = false;
    mq_client.end();
    spinColor(2);
  });

  mq_client.on('message', function (topic, message) {
    parse(message.toString());
  });
}
function mq_send(topic, msg) {
  if (mqtt_state) mq_client.publish(topic, msg);
}

// ============ UTILS =============
function getVal(id) {
  return document.getElementById(id).value;
}
function getEl(id) {
  return document.getElementById(id);
}

function save_cfg() {
  Object.keys(cfg).forEach(key => {
    let el = getEl(key);
    if (el.type == 'checkbox') cfg[key] = el.checked;
    else cfg[key] = el.value;
  });
  localStorage.setItem('cfg', JSON.stringify(cfg));
  updateTheme();
}
function load_cfg() {
  //localStorage.clear();
  if (localStorage.hasOwnProperty('cfg')) {
    cfg = JSON.parse(localStorage.getItem('cfg'));
  }
  Object.keys(cfg).forEach(key => {
    let el = getEl(key);
    if (el.type == 'checkbox') el.checked = cfg[key];
    else el.value = cfg[key];
  });
  updateTheme();
}
function updateTheme() {
  let v = cfg.darkmode ? 0 : 1;
  let r = document.querySelector(':root');
  r.style.setProperty('--back', theme[v][0]);
  r.style.setProperty('--tab', theme[v][1]);
  r.style.setProperty('--font', theme[v][2]);
  r.style.setProperty('--font2', theme[v][3]);
  r.style.setProperty('--dark', theme[v][4]);
}
function spinColor(val) {
  const cols = ['#fff', '#5aff5a', '#f58033'];  // white green orange
  if (!cfg.use_mqtt) val = 0;
  document.querySelector(':root').style.setProperty('--spin', cols[val]);
}

function scan_tcp() {
  let ip = document.getElementById("tcp_ip").value;
  let port = document.getElementById("tcp_port").value;
  let ip_a = ip.split('.');
  ip = ip_a[0] + '.' + ip_a[1] + '.' + ip_a[2] + '.';

  for (let i = 1; i < 255; i++) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) parse(this.responseText);
    }
    xhr.timeout = 2000;
    xhr.open("GET", "http://" + ip + i + ":" + port + "/" + cfg.net_id);
    xhr.send();
  }
}
function update_ip() {
  getLocalIP().then((ip) => {
    if (ip.indexOf("local") > 0) alert('Disable WEB RTC anonymizer');
    else document.getElementById("tcp_ip").value = ip;
  });
}
function genID() {
  document.getElementById("net_id").value = "HUB_" + Math.round(Math.random() * 0xffffff).toString(16);
}
function getLocalIP() {
  return new Promise(function (resolve, reject) {
    var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      reject('Your browser does not support this API');
    }

    var rtc = new RTCPeerConnection({ iceServers: [] });
    var addrs = {};
    addrs["0.0.0.0"] = false;

    function grepSDP(sdp) {
      var hosts = [];
      var finalIP = '';
      sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
        if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
          var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
            addr = parts[4],
            type = parts[7];
          if (type === 'host') {
            finalIP = addr;
          }
        } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
          var parts = line.split(' '),
            addr = parts[2];
          finalIP = addr;
        }
      });
      return finalIP;
    }

    if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
      rtc.createDataChannel('', { reliable: false });
    };

    rtc.onicecandidate = function (evt) {
      // convert the candidate to SDP so we can run it through our general parser
      // see https://twitter.com/lancestout/status/525796175425720320 for details
      if (evt.candidate) {
        var addr = grepSDP("a=" + evt.candidate.candidate);
        resolve(addr);
      }
    };
    rtc.createOffer(function (offerDesc) {
      rtc.setLocalDescription(offerDesc);
    }, function (e) { console.warn("offer failed", e); });
  });
}