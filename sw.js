/* 순공 플래너: 오프라인에서도 열리도록 앱 파일을 기기에 보관한다. */
const CACHE = 'sungong-v11';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !font) return;
  // 보관본을 먼저 보여 주고, 연결되어 있으면 뒤에서 새 버전을 받아 다음 실행 때 반영한다.
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: !font }).then((hit) => {
    const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  })));
});
