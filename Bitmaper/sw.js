const CACHE_NAME="bitmaper_0df8ed42450b03f1f4c7",CACHED_URLS=["/","/favicon.svg","/index.html","/script.js","/style.css"];self.addEventListener("install",(t=>{t.waitUntil(async function(){const t=await caches.open(CACHE_NAME);await t.addAll(CACHED_URLS)}())})),self.addEventListener("fetch",(t=>{const{request:a}=t;a.url.startsWith(self.location.href)&&("only-if-cached"===a.cache&&"same-origin"!==a.mode||t.respondWith(async function(){const e=await caches.open(CACHE_NAME),n=await e.match(a),i=fetch(a);return a.url.startsWith(self.location.origin)&&t.waitUntil(async function(){const t=await i;await e.put(a,t.clone())}()),n||i}()))})),self.addEventListener("activate",(t=>{t.waitUntil(async function(){const t=await caches.keys();await Promise.all(t.filter((t=>t!==CACHE_NAME)).map((t=>caches.delete(t))))}())}));