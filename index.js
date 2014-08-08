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
    if (context.refreshActive) {
        return false;
    }
    // ready to refresh
    context.refreshActive = true;
    return request({
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
    return request(options, function (err, res, body) {
        // if a 401 is returned, hit the refresh token process
        if (res.statusCode == 401 || res.statusCode == 400) {
            return refreshAccessToken(context, options, callback);
        }
        // all other error codes get sent to the caller
        if (res.statusCode != 200) {
            return callback && callback(res.body, res);
        }
        // only return javascript objects to callers on 200's
        var data = {};
        try {
            data = JSON.parse(body);
        } catch (err) {
            data = body;
        }
        callback && callback(null, data);
    });
};

// clean up parameters
var formatParameters = function (options, callback) {

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
    this.refreshActive = false;
    this.retryQueue = [];
    this.accessToken = null;
}

/**
 * Get a list of activities from the API. If an id is passed with the options, get a single activity. You can also
 * change the state of an activity by passing the desired state (pause, cancel, resume) in the transition key.
 * @param {object} options - keys: id, transition
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
 * @example
 *  ```js
 *  // get a single activity
 *  pokitdok.activities({
 *      id: '5317f51527a27620f2ec7533'
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the activity name status and id
 *      console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
 *  });
 *  ```
 * @example
 *  ```js
 *  // cancel an  activity
 *  pokitdok.activities({
 *      id: '5317f51527a27620f2ec7533',
 *      transition: 'cancel'
 *  }, function(err, res){
 *      if(err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the activity name status and id
 *      console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
 *  });
 *  ```
 */
PokitDok.prototype.activities = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.id || '';
    apiRequest(this, {
        path: '/activities/' + token,
        method: (options.transition && options.id) ? 'PUT' : 'GET',
        qs: (!options.id) ? options : null,
        json: {
            transition: options.transition
        }
    }, callback);
};

/**
 * Get a list of cash prices for a particular CPT Code in a specific Zip Code
 * @param {object} options - keys: cpt_code, zip_code
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // print the procedure code and price for a particular zip/cpt combination
 *  pokitdok.cashPrices({
 *          zip_code: '94401',
 *          cpt_code: '90658'
 *      }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the cpt, geo_zip and average price
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var price = res.data[i];
 *          console.log(price.cpt_code + ':' + price.geo_zip_area +  ':' + price.average);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.cashPrices = function (options, callback) {
    apiRequest(this, {
        path: '/prices/cash',
        method: 'GET',
        qs: options
    }, callback);
};

/**
 * Submit a claim for processing. The API calls back with an activity object that tracks the state of the claim.
 * @param {object} options - the claim document
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // submit a claim document
 *  pokitdok.claims({
 *      transaction_code: 'chargeable',
 *      trading_partner_id: 'MOCKPAYER',
 *      billing_provider: {
 *          taxonomy_code: '207Q00000X',
 *          first_name: 'Jerome',
 *          last_name: 'Aya-Ay',
 *          npi: '1467560003',
 *          address: {
 *              address_lines: [
 *                  '8311 WARREN H ABERNATHY HWY'
 *              ],
 *              city: 'SPARTANBURG',
 *              state: 'SC',
 *              zipcode: '29301'
 *          },
 *          tax_id: '123456789'
 *      },
 *      subscriber: {
 *          first_name: 'Jane',
 *          last_name: 'Doe',
 *          member_id: 'W000000000',
 *          address: {
 *              address_lines: ['123 N MAIN ST'],
 *              city: 'SPARTANBURG',
 *              state: 'SC',
 *              zipcode: '29301'
 *          },
 *          birth_date: '1970-01-01',
 *          gender: 'female'
 *      },
 *      claim: {
 *          total_charge_amount: 60.0,
 *          service_lines: [
 *              {
 *                  procedure_code: '99213',
 *                  charge_amount: 60.0,
 *                  unit_count: 1.0,
 *                  diagnosis_codes: [
 *                      '487.1'
 *                  ],
 *                  service_date: '2014-06-01'
 *              }
 *          ]
 *      }
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the activity id, name and state
 *      console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
 *  });
 *  ```
 */
PokitDok.prototype.claims = function (options, callback) {
    apiRequest(this, {
        path: '/claims/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Get the status of a submitted claim from the specified trading partner. You can specify a specific tracking id if
 * you have one from the original claim.
 * @param {object} options - the claim status query
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // get the status of a claim using a date range and tracking id
 *  pokitdok.claimStatus({
 *      patient: {
 *          birth_date: '1970-01-01',
 *          first_name: 'JANE',
 *          last_name: 'DOE',
 *          id: '1234567890'
 *      },
 *      provider: {
 *          first_name: 'Jerome',
 *          last_name: 'Aya-Ay',
 *          npi: '1467560003',
 *      },
 *      service_date: '2014-01-01',
 *      service_end_date: '2014-01-04',
 *      trading_partner_id: 'MOCKPAYER',
 *      tracking_id: 'ABC12345'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the correlation_id and trading_partner_id of the claim
 *      console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
 *  });
 *  ```
 */
PokitDok.prototype.claimStatus = function (options, callback) {
    apiRequest(this, {
        path: '/claims/status',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Get an eligibility response from a trading partner based on the provided eligibility document (provider, member,
 * cpt code, service_types)
 * @param {object} options - keys: provider, service_types, member, cpt_code, trading_partner_id
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // get general eligibility for a member for a specific provider
 *  pokitdok.eligibility({
 *      member: {
 *          birth_date: '1970-01-01',
 *          first_name: 'Jane',
 *          last_name: 'Doe',
 *          id: 'W000000000'
 *      },
 *      provider: {
 *          first_name: 'JEROME',
 *          last_name: 'AYA-AY',
 *          npi: '1467560003'
 *      },
 *      service_types: ['health_benefit_plan_coverage'],
 *      trading_partner_id: 'MOCKPAYER'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the member eligibility for the specified provider
 *      console.log(res.data);
 *  });
 *  ```
 * @example
 *  ```js
 *  // get eligibility for a member for a specific CPT code
 *  pokitdok.eligibility({
 *      member: {
 *          birth_date: '1970-01-01',
 *          first_name: 'Jane',
 *          last_name: 'Doe',
 *          id: 'W000000000'
 *      },
 *      provider: {
 *          first_name: 'JEROME',
 *          last_name: 'AYA-AY',
 *          npi: '1467560003'
 *      },
 *      cpt_code: '81291',
 *      trading_partner_id: 'MOCKPAYER'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the member eligibility for the specified CPT code
 *      console.log(res.data);
 *  });
 *  ```
 */
PokitDok.prototype.eligibility = function (options, callback) {
    apiRequest(this, {
        path: '/eligibility/',
        method: 'POST',
        json: options
    }, callback);
};
/**
 * Get an enrollment response from a trading partner based on the provided enrollment document (provider, member,
 * cpt code, service_types)
 * @param {object} options - keys: provider, service_types, member, cpt_code, trading_partner_id
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // get general enrollment for a member for a specific provider
 *  pokitdok.enrollment({
 *      member: {
 *          birth_date: '1970-01-01',
 *          first_name: 'Jane',
 *          last_name: 'Doe',
 *          id: 'W000000000'
 *      },
 *      provider: {
 *          first_name: 'JEROME',
 *          last_name: 'AYA-AY',
 *          npi: '1467560003'
 *      },
 *      service_types: ['health_benefit_plan_coverage'],
 *      trading_partner_id: 'MOCKPAYER'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the member enrollment for the specified provider
 *      console.log(res.data);
 *  });
 *  ```
 **/
PokitDok.prototype.enrollment = function (options, callback) {
    // basic file validation
    // encode file for delivery over http
    apiRequest(this, {
        path: '/enrollment/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Submit a raw X12 file to the pokitdok platform for processing
 * @param {FileReadStream} fileReadStream
 * @param {Function} callback
 */
PokitDok.prototype.files = function (fileReadStream, callback) {
    // basic file validation
    // encode file for delivery over http
    fileReadStream.pipe(apiRequest(this, {
        path: '/files/',
        method: 'POST'
    }, callback));
};

/**
 * Get a list of insurance prices for a particular CPT Code in a specific Zip Code
 * @param {object} options - keys: cpt_code, zip_code
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // print the procedure code and price for a particular zip/cpt combination
 *  pokitdok.insurancePrices({
 *          zip_code: '94401',
 *          cpt_code: '90658'
 *      }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the cpt and geo_zip
 *      console.log(res.data.cpt_code + ':' + res.data.geo_zip_area);
 *      // print the average price per payment types
 *      for (var i = 0, ilen = res.data.amounts.length; i < ilen; i++) {
 *          var price = res.data.amounts[i];
 *          console.log(price.payment_type + ':' + price.average);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.insurancePrices = function (options, callback) {
    apiRequest(this, {
        path: '/prices/insurance',
        method: 'GET',
        qs: options
    }, callback);
};

/**
 * Get a list of payers from the API for use in other EDI transactions.
 * @param {function} callback - a callback function that accepts an error and response parameter
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
 * @example
 *  ```js
 *  // print a single trading partner
 *  pokitdok.tradingPartners({id:'MOCKPAYER'}, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      console.log(res.data.name + ':' + res.data.id);
 *  });
 *  ```
 */
PokitDok.prototype.tradingPartners = function(options, callback){
    var token = '';
    if (options instanceof Function) {
        callback = options;
    } else {
        token = options.id || '';
    }
    apiRequest(this, {
        path: '/tradingpartners/' + token,
        method: 'GET'
    }, callback);
};

// expose the constructor
module.exports = PokitDok;
