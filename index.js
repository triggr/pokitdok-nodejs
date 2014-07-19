var userAgent = 'pokitdok-nodejs@0.0.1',
    baseUrl = 'https://platform.pokitdok.com',
    request = require('request'),
    _ = require('lodash');

/**
 * Create a connection to the pokitdok API
 * @param clientId
 * @param clientSecret
 * @param version
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
 * Automatically refresh the access token when receiving a 401. Rejected
 * requests are replayed after a token is refreshed.
 * @param options
 * @param callback
 */
PokitDok.prototype.refreshAccessToken = function (options, callback) {
    this.retryQueue.push([options, callback]);
    if (this.refeshActive) {
        return false;
    }
    this.refeshActive = true;
    var self = this;
    request({
        uri: baseUrl + '/oauth2/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + new Buffer(self.clientId + ':' + self.clientSecret).toString('base64'),
            'User Agent': userAgent
        },
        form: {
            grant_type: 'client_credentials'
        }
    }, function (err, res, body) {
        self.refreshActive = false;
        if (res.statusCode != 200) {
            self.retryQueue = [];
            return callback && callback(res.body, res);
        }
        var token = JSON.parse(body);
        self.accessToken = token.access_token;
        while (0 < self.retryQueue.length) {
            var reqArgs = self.retryQueue.pop();
            self.apiRequest(reqArgs[0], reqArgs[1]);
        }
    });
};

/**
 * Make a request to the platform api. Handle 401's so that the access token is automatically created/refreshed.
 * @param options
 * @param callback
 */
PokitDok.prototype.apiRequest = function (options, callback) {
    var self = this;
    options.url = baseUrl + '/api/' + this.version + options.path;
    options.headers = {
        'Authorization': 'Bearer ' + this.accessToken,
        'User Agent': userAgent
    };
    request(options, function (err, res, body) {
        if (res.statusCode == 401) {
            return self.refreshAccessToken(options, callback);
        }
        if (res.statusCode != 200) {
            return callback && callback(res.body, res);
        }
        var data = JSON.parse(body);
        callback && callback(null, data);
    });
};

/**
 * Get a list of activities partners from the API. If an id is passed with the options, get a single activity.
 * @param callback
 */
PokitDok.prototype.activities = function (options, callback) {
    this.apiRequest({
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
    this.apiRequest({
        path: '/tradingpartners/',
        method: 'GET'
    }, callback);
};

/**
 * get a list of payers from the API
 * @param callback
 */
PokitDok.prototype.payers = function (callback) {
    this.apiRequest({
        path: '/payers/',
        method: 'GET'
    }, callback);
};

/**
 * Search health care providers in the PokitDok directory
 * @param options
 * @param callback
 * @example refine a provider search
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  //search for providers with all available filter options
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
 *
 * @example get a provider by npi id
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  //search for provider using a npi id
 *  pokitdok.providers({
 *      npi: 1467560003
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.data.first_name + ' ' + res.data.last_name);
 *  });
 *
 * @example get a provider by pokitdok id
 *  var pokitdok = new PokitDok(clientId, clientSecret);
 *  //search for provider using a pokitdok id
 *  pokitdok.providers({
 *      id: 1234567890ABCDEF
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.data.first_name + ' ' + res.data.last_name);
 *  });
 */
PokitDok.prototype.providers = function (options, callback) {
    this.apiRequest({
        path: '/providers/' + options.id,
        method: 'GET',
        qs: (!options.id) ? options : null
    }, callback);
};

// expose the constructor
module.exports = PokitDok;