import registerServiceWorker from './cache.sw.js';

function init() {
	if ('serviceWorker' in navigator) {
		registerServiceWorker({ scope: './' }).then(function(registration) {
			console.log('serviceworker succeeded', registration);
		}).catch(function(error) {
			console.log('serviceworker failed: ' + error);
		});
	} else {
		console.log('no serviceworker support!');
	}
}

module.exports = {
	init
};
