(()=>{var e,t,n={10:(e,t,n)=>{const o=async e=>{let t;Promise.all([n.e(314),n.e(223)]).then(n.bind(n,223));try{t=await navigator.serial.requestPort()}catch(t){return"NotFoundError"===t.name?void Promise.all([n.e(314),n.e(380)]).then(n.bind(n,380)).then((t=>t.openNoPortPickedDialog((()=>o(e))))):void alert(`Error: ${t.message}`)}if(!t)return;try{await t.open({baudRate:115200})}catch(e){return void alert(e.message)}const r=document.createElement("ewt-install-dialog");r.port=t,r.manifestPath=e.manifest||e.getAttribute("manifest"),r.overrides=e.overrides,r.addEventListener("closed",(()=>{t.close()}),{once:!0}),document.body.appendChild(r)};class r extends HTMLElement{connectedCallback(){if(this.renderRoot)return;if(this.renderRoot=this.attachShadow({mode:"open"}),!r.isSupported||!r.isAllowed)return this.toggleAttribute("install-unsupported",!0),void(this.renderRoot.innerHTML=r.isAllowed?"<slot name='unsupported'>Your browser does not support installing things on ESP devices. Use Google Chrome or Microsoft Edge.</slot>":"<slot name='not-allowed'>You can only install ESP devices on HTTPS websites or on the localhost.</slot>");this.toggleAttribute("install-supported",!0);const e=document.createElement("slot");e.addEventListener("click",(async e=>{e.preventDefault(),o(this)})),e.name="activate";const t=document.createElement("button");if(t.innerText="Connect",e.append(t),"adoptedStyleSheets"in Document.prototype&&"replaceSync"in CSSStyleSheet.prototype){const e=new CSSStyleSheet;e.replaceSync(r.style),this.renderRoot.adoptedStyleSheets=[e]}else{const e=document.createElement("style");e.innerText=r.style,this.renderRoot.append(e)}this.renderRoot.append(e)}}r.isSupported="serial"in navigator,r.isAllowed=window.isSecureContext,r.style='\n  button {\n    position: relative;\n    cursor: pointer;\n    font-size: 14px;\n    font-weight: 500;\n    padding: 10px 24px;\n    color: var(--esp-tools-button-text-color, #fff);\n    background-color: var(--esp-tools-button-color, #03a9f4);\n    border: none;\n    border-radius: var(--esp-tools-button-border-radius, 9999px);\n  }\n  button::before {\n    content: " ";\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    opacity: 0.2;\n    border-radius: var(--esp-tools-button-border-radius, 9999px);\n  }\n  button:hover::before {\n    background-color: rgba(255,255,255,.8);\n  }\n  button:focus {\n    outline: none;\n  }\n  button:focus::before {\n    background-color: white;\n  }\n  button:active::before {\n    background-color: grey;\n  }\n  :host([active]) button {\n    color: rgba(0, 0, 0, 0.38);\n    background-color: rgba(0, 0, 0, 0.12);\n    box-shadow: none;\n    cursor: unset;\n    pointer-events: none;\n  }\n  .hidden {\n    display: none;\n  }',customElements.define("esp-web-install-button",r)}},o={};function r(e){var t=o[e];if(void 0!==t)return t.exports;var a=o[e]={exports:{}};return n[e](a,a.exports,r),a.exports}r.m=n,r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.f={},r.e=e=>Promise.all(Object.keys(r.f).reduce(((t,n)=>(r.f[n](e,t),t)),[])),r.u=e=>e+".script.js",r.miniCssF=e=>{},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="ota-gyver:",r.l=(n,o,a,s)=>{if(e[n])e[n].push(o);else{var i,c;if(void 0!==a)for(var l=document.getElementsByTagName("script"),d=0;d<l.length;d++){var u=l[d];if(u.getAttribute("src")==n||u.getAttribute("data-webpack")==t+a){i=u;break}}i||(c=!0,(i=document.createElement("script")).charset="utf-8",i.timeout=120,r.nc&&i.setAttribute("nonce",r.nc),i.setAttribute("data-webpack",t+a),i.src=n),e[n]=[o];var p=(t,o)=>{i.onerror=i.onload=null,clearTimeout(b);var r=e[n];if(delete e[n],i.parentNode&&i.parentNode.removeChild(i),r&&r.forEach((e=>e(o))),t)return t(o)},b=setTimeout(p.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=p.bind(null,i.onerror),i.onload=p.bind(null,i.onload),c&&document.head.appendChild(i)}},r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.p="",(()=>{var e={57:0};r.f.j=(t,n)=>{var o=r.o(e,t)?e[t]:void 0;if(0!==o)if(o)n.push(o[2]);else{var a=new Promise(((n,r)=>o=e[t]=[n,r]));n.push(o[2]=a);var s=r.p+r.u(t),i=new Error;r.l(s,(n=>{if(r.o(e,t)&&(0!==(o=e[t])&&(e[t]=void 0),o)){var a=n&&("load"===n.type?"missing":n.type),s=n&&n.target&&n.target.src;i.message="Loading chunk "+t+" failed.\n("+a+": "+s+")",i.name="ChunkLoadError",i.type=a,i.request=s,o[1](i)}}),"chunk-"+t,t)}};var t=(t,n)=>{var o,a,[s,i,c]=n,l=0;if(s.some((t=>0!==e[t]))){for(o in i)r.o(i,o)&&(r.m[o]=i[o]);if(c)c(r)}for(t&&t(n);l<s.length;l++)a=s[l],r.o(e,a)&&e[a]&&e[a][0](),e[a]=0},n=self.webpackChunkota_gyver=self.webpackChunkota_gyver||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),(()=>{"use strict";class e{constructor(t,n={}){n.context=this,this.$root=e.make(t,n)}static make(t,n={}){return t&&"object"==typeof n?n instanceof Node?n:e.config(document.createElement(t),n):null}static makeShadow(t,n={},o=null){if(!t||"object"!=typeof n)return null;let r=t instanceof Node?t:document.createElement(t);return r.attachShadow({mode:"open"}),e.config(r.shadowRoot,{context:n.context,children:[{tag:"style",textContent:o??""},n.child??{},...n.children??[]]}),delete n.children,delete n.child,e.config(r,n),r}static config(t,n){if(!(t instanceof Node)||"object"!=typeof n)return t;const o=n.context;let r=n=>{if(n)if(n instanceof Node)t.appendChild(n);else if(n instanceof e)t.appendChild(n.$root);else if("object"==typeof n){n.context||(n.context=o);let r=e.make(n.tag,n);r&&t.appendChild(r)}else"string"==typeof n&&(t.innerHTML+=n)};for(const[e,a]of Object.entries(n))if(a)switch(e){case"tag":case"context":continue;case"text":t.textContent=a;break;case"html":t.innerHTML=a;break;case"class":t.classList.add(...a.split(" "));break;case"also":o&&a.call(o,t);break;case"export":a[0]=t;break;case"var":o&&(o["$"+a]=t);break;case"events":for(let e in a)a[e]&&t.addEventListener(e,a[e].bind(o));break;case"parent":(a instanceof Node||a instanceof DocumentFragment)&&a.append(t);break;case"attrs":for(let e in a)t.setAttribute(e,a[e]);break;case"props":for(let e in a)t[e]=a[e];break;case"child":r(a);break;case"children":for(const e of a)r(e);break;case"style":if("string"==typeof a)t.style.cssText+=a+";";else for(let e in a)t.style[e]=a[e];break;default:t[e]=a}return t}static makeArray(t){return t&&Array.isArray(t)?t.map((t=>e.make(t.tag,t))):[]}}new Set,new Map;r(10);class t{constructor(){this.load()}async load(){e.make("div",{parent:document.body,context:this,class:"main",children:[{tag:"div",class:"header",text:"AlexGyver OTA"},{tag:"div",class:"projects",var:"projects"}]});let t=await fetch("https://raw.githubusercontent.com/AlexGyver/ota-projects/main/projects.txt",{cache:"no-store"});t=await t.text(),t=t.split(/\r?\n/);for(let n of t)e.make("div",{context:this,parent:this.$projects,var:n,class:"project",children:[{tag:"span",class:"project_label",text:n,events:{click:()=>window.open("https://github.com/AlexGyver/"+n)}},{tag:"div",class:"icon down",events:{click:()=>this["$"+n+"_btn"].click()}}]}),e.make("esp-web-install-button",{context:this,parent:document.body,style:"display:none",attrs:{manifest:"https://raw.githubusercontent.com/AlexGyver/"+n+"/main/project.json"},child:{tag:"button",slot:"activate",var:n+"_btn"}})}}document.addEventListener("DOMContentLoaded",(async()=>{new t}))})()})();