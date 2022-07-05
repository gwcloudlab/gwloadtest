
// requires
const loadtest = require('../lib/loadtest.js');
const testserver = require('../lib/testserver.js');


const fs = require('fs');
rps = 10;
rpsInter= 10;
let fileTitle = "sample/log-rps-"+rps+"-iv-"+rpsInter+ ".csv";

const options = {
    url: 'https://www.google.com',
    statusCallback: statusCallback, 
	requestsPerSecond: rps,
	rpsInterval: rpsInter
};


function statusCallback(error, result, latency) {
    console.log('----');
    console.log('Timestamp: ', result.startTime.toFixed(2));
    console.log('Request index: ', result.requestIndex);
    console.log('Request elapsed milliseconds: ', result.requestElapsed);
    let n = result.requestElapsed.toFixed();
 	let s = result.requestIndex + ", " +result.startTime.toFixed(2) + ", " + n.toString() + ", " + result.statusCode + "\n";
    fs.writeFile(fileTitle, s, { flag: 'a+' }, err => {});
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

