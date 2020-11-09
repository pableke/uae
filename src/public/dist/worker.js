 
const cacheName = "v1";
const staticAssets = [
	//"../", //static dir
	"./style.css",
	"./multi-box.min.js",
	"./webpush.html"
];

self.addEventListener("install", ev => {
	ev.waitUntil(
		caches.open(cacheName).then(cache => cache.addAll(staticAssets))
	);
	console.log(cacheName, "cache is instaled!");
});

self.addEventListener("activate", function(ev) {
	ev.waitUntil( // delete any caches that aren"t in expectedCaches
		caches.keys().then(keys => Promise.all(
			keys.map(key => { if (cacheName != key) return caches.delete(key); })
		)).then(() => {
			console.log(cacheName, "now ready to handle fetches!");
		})
	);
});

self.addEventListener("fetch", function(ev) {
	const req = ev.request;
	const url = new URL(req.url);

	if (url.origin === location.origin) {
		caches.open(cacheName).then(cache => {
			return cache.match(req);
		}).then(cached => {
			ev.respondWith(cached || fetch(req));
		});
	}
	else {
		caches.open(cacheName).then(async (cache) => {
			try {
				const res = await fetch(req);
				await cache.put(req, res.clone());
				ev.respondWith(res);
			} catch (ex) {
				console.log("cache-exception", ex);
				ev.respondWith(await cache.match(req));
			}
		});
	}
});

self.addEventListener("push", ev => {
	let data = ev.data ? ev.data.json() : {};
	let title = data.title || "Something Has Happened";
	let message = data.message || "Here is something you might want to check out.";

	//Chrome desktop notification work only on https protocol
	let notification = self.registration.showNotification(title, {
		body: message,
		tag: "vibration-sample",
		vibrate: [200, 100, 200, 100, 200, 100, 200],
		icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Archlinux-icon-crystal-64.svg/1024px-Archlinux-icon-crystal-64.svg.png"
	});
	ev.waitUntil(notification);
});
