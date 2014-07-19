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
    context.retryQueue.push([options, callback]);
    if (context.refeshActive) {
        return false;
    }
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
        if (res.statusCode != 200) {
            context.retryQueue = [];
            return callback && callback(res.body, res);
        }
        var token = JSON.parse(body);
        context.accessToken = token.access_token;
        while (0 < context.retryQueue.length) {
            var reqArgs = context.retryQueue.pop();
            apiRequest(context, reqArgs[0], reqArgs[1]);
        }
    });
};

// a private function to make a request to the platform api. Handles 401's so that the
// access token is automatically created/refreshed.
var apiRequest = function (context, options, callback) {
    options.url = baseUrl + '/api/' + context.version + options.path;
    options.headers = {
        'Authorization': 'Bearer ' + context.accessToken,
        'User Agent': userAgent
    };
    request(options, function (err, res, body) {
        if (res.statusCode == 401) {
            return refreshAccessToken(context, options, callback);
        }
        if (res.statusCode != 200) {
            return callback && callback(res.body, res);
        }
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
 * Get a list of activities partners from the API. If an id is passed with the options, get a single activity.
 * @param callback
 */
PokitDok.prototype.activities = function (options, callback) {
    apiRequest(this, {
        path: '/activities/' + options.id,
        method: 'GET',
        qs: (!options.id) ? options : null
    }, callback);
};

/**
 * get a list of trading partners from the API
 * @param callback
 */
PokitDok.prototype.tradingPartners = function (callback) {
    apiRequest(this, {
        path: '/tradingpartners/',
        method: 'GET'
    }, callback);
};

/**
 * get a list of payers from the API
 * @param callback
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
 * @param {object} options - accepts: id, npi, zipcode, radius, first_name, last_name, specialty, organization_name, limit
 * @param {function} callback - a function that accepts an error and response parameter
 * @example refine a provider search
 *  ```javascript
 *  var PokitDok = require('pokitdok-nodejs');
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  pokitdok.providers({
 *      zipcode: 30606,
 *      radius: '10mi',
 *      first_name: 'Cliff',
 *      last_name: 'Wicklow',
 *      specialty: 'RHEUMATOLOGY',
 *      organization_name='Athens Regional Hospital',
 *      limit: 20
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.meta.result_count + ' results');
 *      for(i in res.data) {
 *          console.log(i.first_name + ' ' + i.last_name);
 *      }
 *  });
 *  ```
 *
 * @example get a provider using a npi id
 *  ```javascript
 *  var PokitDok = require('pokitdok-nodejs');
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  pokitdok.providers({
 *      npi: 1467560003
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.data.first_name + ' ' + res.data.last_name);
 *  });
 *  ```
 *
 * @example get a provider by using a pokitdok id
 *  ```javascript
 *  var PokitDok = require('pokitdok-nodejs');
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  pokitdok.providers({
 *      id: 1234567890ABCDEF
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.data.first_name + ' ' + res.data.last_name);
 *  });
 *  ```
 */
PokitDok.prototype.providers = function (options, callback) {
    apiRequest(this, {
        path: '/providers/' + options.id,
        method: 'GET',
        qs: (!options.id) ? options : null
    }, callback);
};

// expose the constructor
module.exports = PokitDok;