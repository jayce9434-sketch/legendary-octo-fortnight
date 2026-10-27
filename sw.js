const CACHE='crashflock-v1';
const FILES=['./','index.html','style.css','game.js','levels.js','content.js','manifest.webmanifest','icon-192.png','icon-512.png','birds-sprites.png','pigs-sprites.png','materials.png','bg-field.png','bg-factory.png','bg-storm.png','bg-cavern.png','bg-sky.png','bg-citadel.png','launch.wav','impact.wav','shatter.wav','victory.wav','boss-hit.wav'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
