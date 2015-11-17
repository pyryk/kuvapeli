const CACHE_NAME = 'kuvapeli-http-cache';

/*eslint-disable max-nested-callbacks */
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
			.then(function(cachedResponse) {

				// IMPORTANT: Clone the request. A request is a stream and
				// can only be consumed once. Since we are consuming this
				// once by cache and once by the browser for fetch, we need
				// to clone the response
				const fetchRequest = event.request.clone();

				const fetchResponse = fetch(fetchRequest).then(
					function(response) {
						// Check if we received a valid response
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						// IMPORTANT: Clone the response. A response is a stream
						// and because we want the browser to consume the response
						// as well as the cache consuming the response, we need
						// to clone it so we have 2 stream.
						const responseToCache = response.clone();

						caches.open(CACHE_NAME)
							.then(function(cache) {
								cache.put(event.request, responseToCache);
							});

						return response;
					}
				);

				if (cachedResponse) {
					return cachedResponse;
				} else {
					return fetchResponse;
				}
			})
		);
});

self.addEventListener('install', function() {
	console.log('serviceworker install');
});

self.addEventListener('activate', function(event) {
	console.log('serviceworker activate');
	event.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key, i) {
				return caches.delete(keyList[i]);
			}));
		})
	);
});
/*eslint-enable max-nested-callbacks */
