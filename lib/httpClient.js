'use strict';

/**
 * Load Test a URL, website or websocket.
 * (C) 2013 Alex Fernández.
 */


// requires
const testing = require('testing');
const urlLib = require('url');
const http = require('http');
const https = require('https');
const qs = require('querystring');
const websocket = require('websocket');
const Log = require('log');
const {HighResolutionTimer} = require('./hrtimer.js');
const headers = require('./headers.js');
const fs = require('fs');

// globals
const log = new Log('info');
const timeStamps = []; // added for gwloadtest timestamps
var url_list; //added for gwloadtest client behaviour 
var total; //added for gwloadtest client behaviour 


/**
 * Create a new HTTP client.
 * Seem parameters below.
 */
exports.create = function(operation, params) {
	return new HttpClient(operation, params);
};

/**
 * A client for an HTTP connection.
 * Operation is an object which has these attributes:
 *	- latency: a variable to measure latency.
 *	- running: if the operation is running or not.
 * Params is an object with the same options as exports.loadTest.
 */
class HttpClient {
	constructor(operation, params) {
		this.operation = operation
		this.params = params
		this.init();
	}

	/**
	 * Init options and message to send.
	 */
	init() {
		this.options = urlLib.parse(this.params.url);
		this.options.headers = {};
		if (this.params.headers) {
			this.options.headers = this.params.headers;
		}
		if (this.params.cert && this.params.key) {
			this.options.cert = this.params.cert;
			this.options.key = this.params.key;
		}
		this.options.agent = false;
		if (this.params.agentKeepAlive) {
			const KeepAlive = (this.options.protocol == 'https:') ? require('agentkeepalive').HttpsAgent : require('agentkeepalive');
			let maxSockets = 10;
			if (this.params.requestsPerSecond) {
				maxSockets += Math.floor(this.params.requestsPerSecond);
			}
			this.options.agent = new KeepAlive({
				maxSockets: maxSockets,
				maxKeepAliveRequests: 0, // max requests per keepalive socket, default is 0, no limit
				maxKeepAliveTime: 30000  // keepalive for 30 seconds
			});
		}
		if (this.params.method) {
			this.options.method = this.params.method;
		}
		if (this.params.body) {
			if (typeof this.params.body == 'string') {
				log.debug('Received string body');
				this.generateMessage = () => this.params.body;
			} else if (typeof this.params.body == 'object') {
				log.debug('Received JSON body');
				if (this.params.contentType === 'application/x-www-form-urlencoded') {
					this.params.body = qs.stringify(this.params.body);
				}
				this.generateMessage = () => this.params.body;
			} else if (typeof this.params.body == 'function') {
				log.debug('Received function body');
				this.generateMessage = this.params.body;
			} else {
				log.error('Unrecognized body: %s', typeof this.params.body);
			}
			this.options.headers['Content-Type'] = this.params.contentType || 'text/plain';
		}
		if (this.params.cookies) {
			if (Array.isArray(this.params.cookies)) {
				this.options.headers.Cookie =  this.params.cookies.join('; ');
			} else if (typeof this.params.cookies == 'string') {
				this.options.headers.Cookie = this.params.cookies;
			} else {
				console.error('Invalid cookies %j, please use an array or a string', this.params.cookies);
			}
		}
		headers.addUserAgent(this.options.headers);
		if (this.params.secureProtocol) {
			this.options.secureProtocol = this.params.secureProtocol;
		}
		log.debug('Options: %j', this.options);
	}

	randomExp(rps){
		let v = Number(rps);
		v = -1/v;
		let u = Math.random();
		u = Math.log(u);
		let x = u*v;
		return x;
	}

	/**
	 * Start the HTTP client.
	 */
	start() {
		if (this.params.rpsInterval) {
			const rps = this.params.requestsPerSecond;
				 if (this.params.agentKeepAlive) {
				 	this.options.agent.maxSockets = 10 + rps;
				 }
				 // stop the old requesttimer
				 if (this.requestTimer !== undefined) {
				 	this.requestTimer.stop();
				 }
				// Modification: Replace the fixed interval by exponential random interval 
				// which follows the poisson distribution
				var cumulative_time = 0;
				var intr = this.params.rpsInterval *1000;
				var num_rquests =0;
				while (cumulative_time< intr) {
					var interval = 1000 * this.randomExp(rps);
					cumulative_time += interval;
					timeStamps[num_rquests] = cumulative_time;
					num_rquests++;
					setTimeout(() => this.makeRequest(), cumulative_time); 	// sets a timer for all the requests 
				}
				total = num_rquests;
				// starts the log file for each request
				let fileTitle = "sample/log-rps-"+rps+"-iv-"+intr/1000 + ".csv";
				let m  = 'Index, timestamp, latency, status code \n';
				fs.writeFile(fileTitle, m, { flag: 'w' }, err => {});		
				
		}
		else{
		const interval = 1000 / this.params.requestsPerSecond;
			// start new request timer
			this.requestTimer = new HighResolutionTimer(interval, () => this.makeRequest());
		}	
		//gwloadtest modification: read url list to make requested according to weights
		if (this.params.url_list){
			try {
				const data = fs.readFileSync(this.params.url_list, 'utf8');
				var arr = this.fileToArray(data, ', ')
				url_list = arr;
				for (var i=0; i<arr.length; i++){
					arr[i].weight= arr[i].weight*total;
				}
				console.log(arr);
			  } catch (err) {
				console.error(err);
			  }			  
			

		}
	}

	fileToArray(str, delimiter = ",") {
		// slice from start of text to the first \n index
		// use split to create an array from string by delimiter
		const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
	  
		// slice from \n index + 1 to the end of the text
		const rows = str.slice(str.indexOf("\n") + 1).split("\n");
	  
		// Map the rows
		const arr = rows.map(function (row) {
		  const values = row.split(delimiter);
		  const el = headers.reduce(function (object, header, index) {
			object[header] = values[index];
			return object;
		  }, {});
		  return el;
		});
	  
		// return the array
		return arr;
	  }

	/**
	 * Stop the HTTP client.
	 */
	stop() {
		if (this.requestTimer) {
			this.requestTimer.stop();
		}
	}

	/**
	 * Make a single request to the server.
	 */
	makeRequest() {
		if (!this.operation.running) {
			return;
		}
		if (this.operation.options.maxRequests && this.operation.requests >= this.operation.options.maxRequests) return
		this.operation.requests += 1;

		const id = this.operation.latency.start();
		const requestFinished = this.getRequestFinisher(id);
		let lib = http;
		if (this.options.protocol == 'https:') {
			lib = https;
		}
		if (this.options.protocol == 'ws:') {
			lib = websocket;
		}
		const HttpsProxyAgent = require('https-proxy-agent');

		// adding proxy configuration
		if (this.params.proxy) {
			const proxy = this.params.proxy;
			//console.log('using proxy server %j', proxy);
			const agent = new HttpsProxyAgent(proxy);
			this.options.agent = agent;
		}


		// Disable certificate checking
		if (this.params.insecure === true) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		}
		let request, message;
		if (this.generateMessage) {
			message = this.generateMessage(id);
			if (typeof message === 'object') {
				message = JSON.stringify(message);
			}
			this.options.headers['Content-Length'] = Buffer.byteLength(message);
		} else {
			delete this.options.headers['Content-Length'];
		}
		if (typeof this.params.requestGenerator == 'function') {
			request = this.params.requestGenerator(this.params, this.options, lib.request, this.getConnect(id, requestFinished, this.params.contentInspector));
		} else {
			//gwloadtest modification 
			//check if file passed in and if true use weights to send a different url each time
			var temp;
			if (this.params.url_list){
				//choose url here according to weight
				while (true){
					var num = Math.floor(Math.random() * url_list.length);
					if (url_list[num].weight>0){
						url_list[num].weight--;
						temp=url_list[num].url;
						console.log(temp);
						break;
					}
				}
				
				console.log(num);
				//hint use the max num of requests multiply weights by total 
	
			}
			else {
				temp = this.options;
			}
			
			request = lib.request(temp, this.getConnect(id, requestFinished, this.params.contentInspector));
		}
		if (this.params.timeout) {
			const timeout = parseInt(this.params.timeout);
			if (!timeout) {
				log.error('Invalid timeout %s', this.params.timeout);
			}
			request.setTimeout(timeout, () => {
				requestFinished('Connection timed out');
			});
		}
		if (message) {
			request.write(message);
		}
		request.on('error', error => {
			requestFinished('Connection error: ' + error.message);
		});
		request.end();
	}

	/**
	 * Get a function that finishes one request and goes for the next.
	 */
	getRequestFinisher(id, timestamp) {
		return (error, result) => {
			let errorCode = null;
			if (error) {
				log.debug('Connection %s failed: %s', id, error);
				if (result) {
					errorCode = result.statusCode;
					if (result.customErrorCode !== undefined) {
						errorCode = errorCode + ":" + result.customErrorCode
					}
				} else {
					errorCode = '-1';
				}
			} else {
				log.debug('Connection %s ended', id);
			}

			const elapsed = this.operation.latency.end(id, errorCode);
			
			
			

			
		
			if (elapsed < 0) {
				// not found or not running
				return;
			}
			const index = this.operation.latency.getRequestIndex(id);
			
			
			

			if (result) {
				result.requestElapsed = elapsed;
				result.requestIndex = index;
				result.instanceIndex = this.operation.instanceIndex;
				result.startTime = timeStamps[index]; // stores the timestamps pf teh request added for gwloadtest
				//console.log(result.body)
			}
			

			let callback;
			if (!this.params.requestsPerSecond) {
				callback = this.makeRequest.bind(this);
			}
			this.operation.callback(error, result, callback);
		};
	}

	/**
	 * Get a function to connect the player.
	 */
	getConnect(id, callback, contentInspector) {
		let body = '';
		return connection => {
			log.debug('HTTP client connected to %s with id %s', this.params.url, id);
			connection.setEncoding('utf8');
			connection.on('data', chunk => {
				log.debug('Body: %s', chunk);
				body += chunk;
			});
			connection.on('error', error => {
				callback('Connection ' + id + ' failed: ' + error, '1');
			});
			connection.on('end', () => {
				const client = connection.connection || connection.client
				const result = {
					host: client._host,
					path: connection.req.path,
					method: connection.req.method,
					statusCode: connection.statusCode,
					body: body,
					headers: connection.headers,
				};
				if (connection.req.labels) {
					result.labels = connection.req.labels
				}
				if (contentInspector) {
					contentInspector(result)
				}
				if (connection.statusCode >= 400) {
					return callback('Status code ' + connection.statusCode, result);
				}
				if (result.customError) {
					return callback('Custom error: ' + result.customError, result);
				}
				callback(null, result);
			});
		};
	}
}

function testHttpClient(callback) {
	const options = {
		url: 'http://localhost:7357/',
		maxSeconds: 0.1,
		concurrency: 1,
		quiet: true,
	};
	exports.create({}, options);
	testing.success(callback);
}


/**
 * Run all tests.
 */
exports.test = function (callback) {
	testing.run([
		testHttpClient,
	], callback);
};

// run tests if invoked directly
if (__filename == process.argv[1]) {
	exports.test(testing.show);
}

