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
        headers: {
            'Authorization': 'Basic ' + new Buffer(self.clientId + ':' + self.clientSecret).toString('base64'),
            'User Agent': userAgent
        },
        form: {
            grant_type: 'client_credentials'
        },
        method: 'POST'
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
 * get a list of providers from the API
 * @param options
 * @param callback
 */
PokitDok.prototype.providers = function (options, callback) {
    var path = '/providers/';
    
    this.apiRequest({
        path: path,
        method: 'GET'
    });
};


module.exports = PokitDok;