var ghpages = require('gh-pages');
var path = require('path');
 
ghpages.publish(path.join(__dirname, 'dist'), function(err) {
	if (err) {
		console.error('Error deploying to gh-pages: ', err);
	} else {
		console.log('Published successfully!');
	}
});