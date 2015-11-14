/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	const CACHE_NAME = 'kuvapeli-http-cache';
	
	/*eslint-disable max-nested-callbacks */
	self.addEventListener('fetch', function(event) {
		event.respondWith(
			caches.match(event.request)
				.then(function(cachedResponse) {
					// Cache hit - return response
					if (cachedResponse) {
						return cachedResponse;
					}
	
					// IMPORTANT: Clone the request. A request is a stream and
					// can only be consumed once. Since we are consuming this
					// once by cache and once by the browser for fetch, we need
					// to clone the response
					const fetchRequest = event.request.clone();
	
					return fetch(fetchRequest).then(
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
	
							/*eslint-disable no-undef */
							caches.open(CACHE_NAME)
							/*eslint-enable no-undef */
								.then(function(cache) {
									cache.put(event.request, responseToCache);
								});
	
							return response;
						}
					);
				})
			);
	});
	/*eslint-enable max-nested-callbacks */


/***/ }
/******/ ]);
//# sourceMappingURL=6817fdffb994647c486b.serviceworker.js.map