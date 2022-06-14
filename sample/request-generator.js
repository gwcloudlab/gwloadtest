
// requires
const loadtest = require('../lib/loadtest.js');
const testserver = require('../lib/testserver.js');
//const configuration = require('../sample/config.json');   

const fs = require('fs');


const options = {
    url: 'https://www.google.com/',
    statusCallback: statusCallback, 
	requestsPerSecond: 5,
	rpsInterval: 60
};


function statusCallback(error, result, latency) {
    console.log('----');
    console.log('Request elapsed milliseconds: ', result.requestElapsed);
 	let f = result.requestElapsed.toString()+ '\n';
   // fs.writeFile('test.txt', f, { flag: 'a+' }, err => {});
    console.log('Request index: ', result.requestIndex);
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

