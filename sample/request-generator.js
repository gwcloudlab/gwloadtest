// requires
const loadtest = require('../lib/loadtest.js');
const testserver = require('../lib/testserver.js');
const args = require('minimist')(process.argv.slice(2));


const fs = require('fs');
rps = args.rps;
rpsInter= args.interval;
const dta = [];
var errs= 0;
var slowest; 
var fastest;
var max;
var avg =0;


let fileTitle = "sample/log-rps-"+rps+"-iv-"+rpsInter+ ".csv";
let fileTitle2 = "sample/sum-rps-"+rps+"-iv-"+rpsInter + ".txt";

const options = {
    url: 'http://127.0.0.1:5000',
    statusCallback: statusCallback,
	requestsPerSecond: rps,
	rpsInterval: rpsInter,
    urlList: 'sample/url_list.txt',// an example of passing in a list of urls with weights by passing in the file title 
    clientMode: 'open' //passed in to activate gwloadtest modifications 'closed' for closed loop requests and 'open' for open loop requests 

};

//the function called after every request is finished 
function statusCallback(error, result, latency) { 
    console.log('----');
    console.log('Timestamp: ', result.startTime.toFixed(2));
    console.log('Request index: ', result.requestIndex);
    console.log('Request elapsed milliseconds: ', result.requestElapsed);
    console.log('Code: ', result.statusCode);
    console.log('URL: ', result.url);
    
    let n = result.requestElapsed.toFixed();
 	let s = result.requestIndex + ", " +result.startTime.toFixed(2) + ", " + n.toString() + ", " + result.statusCode  + ", " + String(result.url) +"\n";

    fs.writeFileSync(fileTitle, s, { flag: 'a+' }, err => {}); //write to the log file 

	dta[result.requestIndex]= result.requestElapsed; // store elpased for percentile calculation

    avg+=parseFloat(result.requestElapsed); // add to sum

    if (result.requestIndex==0){
        slowest = result.requestElapsed;
        fastest = result.requestElapsed;

    }
    else{
        if (result.requestElapsed<fastest){
            fastest = result.requestElapsed;

        }
        else if(result.requestElapsed>slowest){
            slowest = result.requestElapsed; 
        }
    }

    if ( result.statusCode>299){
      errs++;
    }

    if ( result.startTime>rpsInter*1000){
        max = result.requestIndex +1;

        // print summary after last request
        let f = "Summary: " + '\n'; 
		f = f + 'total time: ';
		m = (result.startTime/1000).toFixed(2) + ' s\n';
		f = f + m + 'total requests: ' + max + '\n';
				
		var num = result.startTime/1000;
		f = f + 'throughput: ' + (max/num).toFixed(2) + ' req/s\n';
		fs.writeFileSync(fileTitle2, f, { flag: 'w' }, err => {});
       
        percentile();
        process.exit(0);
    }
}

function percentile(){
    let f = 'errors: ' + errs + '\n' + 'average: ' + (avg/max).toFixed(2) +' ms\n' + 'fastest: ' + fastest.toFixed(2) + ' ms\n'+ 'slowest: ' + slowest.toFixed(2) + ' ms\n' ;
                
                dta.sort(function(a, b){return a - b});
                
                var p25 =( 0.25*(max-1)).toFixed();
                f = f + '25%ile Latency: ' + dta[p25].toFixed(2) + ' ms\n';
                
                var p50 =( 0.50*(max-1)).toFixed();
                f = f + '50%ile Latency: ' + dta[p50].toFixed(2) + ' ms\n';
            
                var p75 =( 0.75*(max-1)).toFixed();
                f = f + '75%ile Latency: ' + dta[p75].toFixed(2) + ' ms\n';
            
                var p99 =( 0.99*(max-1)).toFixed();
                f =  f +'99%ile Latency: ' + dta[p99] + ' ms\n';
                

                var p999 =( 0.999*(max-1)).toFixed();
                f = f + '99.9%ile Latency: ' + dta[p999] + ' ms\n';
            
                fs.writeFileSync(fileTitle2, f, { flag: 'a' }, err => {});
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

