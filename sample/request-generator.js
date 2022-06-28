
// requires
const loadtest = require('../lib/loadtest.js');
const testserver = require('../lib/testserver.js');


const fs = require('fs');


const options = {
    url: 'https://www.google.com/',
    statusCallback: statusCallback, 
	requestsPerSecond: 100,
	rpsInterval: 11
};


function statusCallback(error, result, latency) {
    console.log('----');
    console.log('Request elapsed milliseconds: ', result.requestElapsed);
 	let f = result.requestElapsed.toString()+ '\n';
   // fs.writeFile('test.txt', f, { flag: 'a+' }, err => {});
    console.log('Request index: ', result.requestIndex);
	console.log('Code: ', result.statusCode);
}



loadtest.loadTest(options, function(error) {
    if (error) {
        return console.error('Got an error: %s', error);
    }
    console.log('Tests run successfully');
});

// exports
exports.loadTest = loadtest.loadTest;
exports.startServer = testserver.startServer;

