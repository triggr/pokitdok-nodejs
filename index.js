// JSDoc entries will be converted to markdown for documentation. Private functions or comments that should be private
// should not use JSDoc syntax, or they will end up in the README.md file.

// module globals and imports
var userAgent = 'pokitdok-nodejs@0.0.1',
    baseUrl = 'https://platform.pokitdok.com',
    request = require('request'),
    _ = require('lodash');

// a private function to automatically refresh the access token when receiving a 401.
// Adds rejected requests to a queue to be processed
var refreshAccessToken = function (context, options, callback) {
    // add the current request to the queue
    context.retryQueue.push([options, callback]);
    // bail if the token is currently being refreshed
    if (context.refeshActive) {
        return false;
    }
    // ready to refresh
    context.refeshActive = true;
    request({
        uri: baseUrl + '/oauth2/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + new Buffer(context.clientId + ':' + context.clientSecret).toString('base64'),
            'User Agent': userAgent
        },
        form: {
            grant_type: 'client_credentials'
        }
    }, function (err, res, body) {
        context.refreshActive = false;
        // if anything but a 200 is returned from the token refresh call, we return the error to the
        // caller and blow out the retry queue
        if (res.statusCode != 200) {
            context.retryQueue = [];
            return callback && callback(res.body, res);
        }
        // set the access token on the connection
        var token = JSON.parse(body);
        context.accessToken = token.access_token;
        // process the queue of requests for the current connection
        while (0 < context.retryQueue.length) {
            var reqArgs = context.retryQueue.pop();
            apiRequest(context, reqArgs[0], reqArgs[1]);
        }
    });
};

// a private function to make a request to the platform api. Handles 401's so that the
// access token is automatically created/refreshed.
var apiRequest = function (context, options, callback) {
    // build the default url for the requests
    options.url = baseUrl + '/api/' + context.version + options.path;
    // apply the auth magic
    options.headers = {
        'Authorization': 'Bearer ' + context.accessToken,
        'User Agent': userAgent
    };
    request(options, function (err, res, body) {
        // if a 401 is returned, hit the refresh token process
        if (res.statusCode == 401) {
            return refreshAccessToken(context, options, callback);
        }
        // all other error codes get sent to the caller
        if (res.statusCode != 200) {
            return callback && callback(res.body, res);
        }
        // only return javascript objects to callers on 200's
        var data = JSON.parse(body);
        callback && callback(null, data);
    });
};

/**
 * Create a connection to the pokitdok API. The version defaults to v4. You must enter your client ID and client secret
 * or all requests made with your connection will return errors.
 * @name PokitDok
 * @param {string} clientId - The client id of your PokitDok App
 * @param {string} clientSecret - The client secret of your PokitDok App
 * @param {string} version - the version of the API the connection should use
 * @constructor
 * @example
 *  ```js
 *  // get a connection to the PokitDok Platform for the most recent version
 *  var PokitDok = require('pokitdok-nodejs');
 *  var pokitdok = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET);
 *  ```
 * @example
 *  ```js
 *  // get a connection to the PokitDok Platform for version 3
 *  var PokitDok = require('pokitdok-nodejs');
 *  var pokitdokV3 = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET, 'v3');
 *  ```
 */
function PokitDok(clientId, clientSecret, version) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.version = version || 'v4';
    this.refeshActive = false;
    this.retryQueue = [];
    this.accessToken = null;
}

/**
 * Get a list of activities from the API. If an id is passed with the options, get a single activity. You can also
 * change the state of an activity by passing the
 * @param {object} options - keys: id
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // get a list of activities
 *  pokitdok.activities({}, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the activity name status and id
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var activity = res.data[i];
 *          console.log(activity.id + ':' + activity.name + ':' + activity.state.name);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.activities = function (options, callback) {
    var token = options.id || '';
    apiRequest(this, {
        path: '/activities/' + token,
        method: 'GET',
        qs: (!options.id) ? options : null
    }, callback);
};

PokitDok.prototype.cashPrices = function (options, callback) {
};


PokitDok.prototype.claims = function (options, callback) {
};

PokitDok.prototype.claimStatus = function (options, callback) {
};

PokitDok.prototype.eligiblity = function (options, callback) {
};

PokitDok.prototype.enrollment = function (options, callback) {
};

PokitDok.prototype.files = function (options, callback) {
};

PokitDok.prototype.insurancePrices = function (options, callback) {
};

/**
 * Get a list of payers from the API for use in other EDI transactions.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // cache a list of payers for use in other EDI transactions
 *  var payerList = [];
 *  pokitdok.payers(function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // save the list for later use
 *      payerList = res.data;
 *      console.log(payerList);
 *  });
 *  ```
 * @example
 *  ```js
 *  // print the trading partner id's, used to identify a payer for other EDI transaction
 *  pokitdok.payers(function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the name and trading_partner_id of each payer
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var payer = res.data[i];
 *          console.log(payer.payer_name + ':' + payer.trading_partner_id);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.payers = function (callback) {
    apiRequest(this, {
        path: '/payers/',
        method: 'GET'
    }, callback);
};

/**
 * Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
 * provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
 * 404 error is returned. Use any of the other available options to return a list of providers.
 * @param {object} options - keys: npi, zipcode, radius, first_name, last_name, specialty, organization_name, limit
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // get a list of providers based on the filters provided
 *  pokitdok.providers({
 *      zipcode: 94118,
 *      last_name: 'shen',
 *      radius: '10mi',
 *      limit: 2
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // res.data is a list of results
 *      for(var i=0, ilen=res.data.length; i < ilen; i++) {
 *          var provider = res.data[i].provider;
 *          console.log(provider.first_name + ' ' + provider.last_name);
 *      }
 *  });
 *  ```
 * @example
 *  ```js
 *  // get a provider using a npi id
 *  pokitdok.providers({
 *      npi: '1881692002'
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // res.data is a single result
 *      console.log(res.data.provider.first_name + ' ' + res.data.provider.last_name);
 *  });
 *  ```
 */
PokitDok.prototype.providers = function (options, callback) {
    var token = options.npi || '';
    apiRequest(this, {
        path: '/providers/' + token,
        method: 'GET',
        qs: (!options.npi) ? options : null
    }, callback);
};

/**
 * Get a list of trading partners from the API for use in other EDI transactions.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // cache a list of trading partners for use in other EDI transactions
 *  var tradingPartnerList = [];
 *  pokitdok.tradingPartners(function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // save the list for later use
 *      tradingPartnerList = res.data;
 *      console.log(tradingPartnerList);
 *  });
 *  ```
 * @example
 *  ```js
 *  // print the trading partner id's, used to identify a payer for other EDI transaction
 *  pokitdok.tradingPartners(function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the name and trading_partner_id of each trading partner
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var tradingPartner = res.data[i];
 *          console.log(tradingPartner.name + ':' + tradingPartner.id);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.tradingPartners = function (callback) {
    apiRequest(this, {
        path: '/tradingpartners/',
        method: 'GET'
    }, callback);
};

// expose the constructor
module.exports = PokitDok;