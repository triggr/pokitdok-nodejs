// JSDoc entries will be converted to markdown for documentation. Private functions or comments that should be private
// should not use JSDoc syntax, or they will end up in the README.md file.

/*
 *  @description.
 *
 */


// module globals and imports
var userAgent = 'pokitdok-nodejs@0.0.1',
    baseUrl = 'https://platform.pokitdok.com',
    request = require('request'),
    fs = require('fs'),
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
            'User-Agent': userAgent
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
            context.apiRequest(reqArgs[0], reqArgs[1]);
        }
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
    this.refreshActive = false;
    this.retryQueue = [];
    this.accessToken = null;
};

/**
 * A generic API request that is used by all specific endpoints functions like `pokitdok.activities(...)` and
 * `pokitdok.CashPrices(...)`.
 *
 * @param {object} options - keys: `path`, `method`, `qs`, `json`. The path is the desired API endpoint, such as `/activities` or `/tradingpartners`. Method is the desired `HTTP` request method. qs is the query string containing request paramaters, and json is a json object containing request options.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *     // Get a list of activities using the generic pokitdok.apiRequest(...) function.
 *     // This has the same result as the first pokidtdok.activities(...) example.
 *     pokitdok.apiRequest({
 *         path: '/activities/' + token,
 *         method: (options.transition && options.id) ? 'PUT' : 'GET',
 *         qs: (!options.id) ? options : null,
 *         json: {
 *             transition: options.transition
 *         }
 *     }, function(err, res) {
 *        if (err) {
 *          return console.log(err, res.statusCode);
 *        }
 *        // print the activity name status and id
 *        for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *            var activity = res.data[i];
 *            console.log(activity.id + ':' + activity.name + ':' + activity.state.name);
 *        }
 *     });
 *  ```
 */
PokitDok.prototype.apiRequest = function (options, callback) {
    var self = this;
    // build the default url for the requests
    options.url = baseUrl + '/api/' + self.version + options.path;
    // apply the auth magic
    options.headers = {
        'Authorization': 'Bearer ' + self.accessToken,
        'User-Agent': userAgent
    };

    if ( options.formData ) {
        options.headers['content-type'] = 'multipart/form-data';
    }

    var req = request(options, function (err, res, body) {
        // handle invalid file reqs
        if (!options.json && typeof body == 'string' && body.indexOf('{') === 0) {
            body = JSON.parse(body);
            res.body = JSON.parse(res.body);
        }
        // if a 401 is returned, hit the refresh token process
        if (res.statusCode == 401 || (res.statusCode == 400 && !body.meta)) {
            return refreshAccessToken(self, options, callback);
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
    //
    // if ( options.formData ) {
    //     var form = req.form();
    //     _.each(options.formData, function(value, key) {
    //         form.append(key, value);
    //     });
    // }

    return req;
};

/**
 * Get a list of activities from the API. If an id is passed with the options, get a single activity. You can also
 * change the state of an activity by passing the desired state (pause, cancel, resume) in the transition key.
 * @param {object} options - keys: id, transition
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#activities| See API documentation for more information}
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
    this.apiRequest({
        path: '/activities/' + token,
        method: (options.transition && options.id) ? 'PUT' : 'GET',
        qs: (!options.id) ? options : null,
        json: {
            transition: options.transition
        }
    }, callback);
};

/**
 * The Authorizations resource allows an application to submit a request for the
 * review of health care in order to obtain an authorization for that health care.
 * @param {object} options - the authorizations query
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#authorizations| See API documentation for more information}
 * @example
 *  ```js
 *  // submit an authorizations request
 *  pokitdok.authorizations({
 *      event: {
            category: 'health_services_review',
            certification_type: 'initial',
            delivery: {
                quantity: 1,
                quantity_qualifier: 'visits'
            },
            diagnoses: [
                {
                    code: '789.00',
                    date: '2014-10-01'
                }
            ],
            place_of_service: 'office',
            provider: {
                organization_name: 'KELLY ULTRASOUND CENTER, LLC',
                npi: '1760779011',
                phone: '8642341234'
            },
            services: [
                {
                    cpt_code: '76700',
                    measurement: 'unit',
                    quantity: 1
                }
            ],
            type: 'diagnostic_imaging'
        },
        patient: {
            birth_date: '1970-01-01',
            first_name: 'JANE',
            last_name: 'DOE',
            id: '1234567890'
        },
        provider: {
            first_name: 'JEROME',
            npi: '1467560003',
            last_name: 'AYA-AY'
        },
        trading_partner_id: 'MOCKPAYER'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the correlation_id and trading_partner_id of the authorization
 *      console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
 *  });
 *  ```
 */
PokitDok.prototype.authorizations = function (options, callback) {
    this.apiRequest({
        path: '/authorizations/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Get a list of cash prices for a particular CPT Code in a specific Zip Code
 * @param {object} options - keys: cpt_code, zip_code
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#cash-prices| See API documentation for more information}
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
    this.apiRequest({
        path: '/prices/cash',
        method: 'GET',
        qs: options
    }, callback);
};

/**
 * Submit a claim for processing. The API calls back with an activity object that tracks the state of the claim.
 * @param {object} options - the claim document
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#claims| See API documentation for more information}
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
    this.apiRequest({
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
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#claims-status| See API documentation for more information}
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
    this.apiRequest({
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
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#eligibility| See API documentation for more information}
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
    this.apiRequest({
        path: '/eligibility/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Get an enrollment response from a trading partner based on the provided enrollment document (provider, member,
 * cpt code, service_types)
 *
 * @param {object} options - keys: provider, service_types, member, cpt_code, trading_partner_id
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#enrollment-snapshot| See API documentation for more information}
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
    this.apiRequest({
        path: '/enrollment/',
        method: 'POST',
        json: options
    }, callback);
};

// /**
//  * Submit a raw X12 file to the pokitdok platform for processing
//  * @param {FileReadStream} fileReadStream
//  * @param {Function} callback
//  *
//  * {@link https://platform.pokitdok.com/documentation/v4/#files| See API documentation for more information}
//  * @example
//  *  ```js
//  *  // Basic file validation - encodes file for delivery over http
//  *  pokitdok.files(fileReadStream, function(err,res) {
//  *      if ( err ) {
//  *          console.log(err);
//  *      } else {
//  *          console.log(res);
//  *      }
//  *  });
//  *  ```
//  */
// PokitDok.prototype.files = function (options, callback) {
//     // basic file validation
//     // encode file for delivery over http
//     var readStream = fs.createReadStream(options.path_x12_file);
//     this.apiRequest({
//         path: '/files/',
//         method: 'POST',
//         formData: {
//             file: {
//                 value: readStream,
//                 options: {
//                     filename: 'x12file',
//                     contentType: 'multipart/form-data'
//                 }
//             },
//             trading_partner_id: options.trading_partner_id
//         }
//     }, callback);
// };

// /**
//  * Submit X12 837 file content to convert to a claims API request and map any ICD-9 codes to ICD-10
//  * @param  x12ClaimsFile: a X12 claims file to be submitted to the platform for processing
//  * @param {function} callback - a callback function that accepts an error and response parameter
//  *
//  * {@link https://platform.pokitdok.com/documentation/v4/#claims-convert| See API documentation for more information}
//  * @example
//  * ```js
//  * var text = 'valid x12 claim file content';
//  * pokitdok.claimsConvert(text, function(err, res) {
//  *     if (err) {
//  *          return console.log(err, res.statusCode);
//  *      }
//  *      // print the converted data
//  *      console.log(res.data);
//  * });
//  * ```
//  */
// PokitDok.prototype.claimsConvert = function(pathToX12File, callback) {
//     var readStream = fs.createReadStream(pathToX12File);
//     readStream.pipe(this.apiRequest({
//         path: '/claims/convert',
//         method: 'POST',
//         formData: {},
//     }, callback));
// };


/**
 * The ICD Convert endpoint allows a client application to request ICD-9 to ICD-10
 * mapping information for the specified ICD-9 code.
 * This endpoint retrieves ICD-9 to ICD-10 mapping information.
 *
 * @param {object} options An object containing query parameters. Avaiable keys: code (an ICD-9 code)
 * @param {Function} callback
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#icd-conver| See API documentation for more information}
 * @example
 *  ```js
 *  // Basic ICD-9 to ICD-10 conversion
 *  pokitdok.icdConvert(icd9Code, function(err,res) {
 *      if ( err ) {
 *          console.log(err);
 *      } else {
 *         // Print out the ICD-10 values for the destination scenarios choice list
 *         for ( var i = 0; ilen = res.data.destination_scenarios.choice_lists.length; i < ilen; i++ ) {
 *             console.log(res.data.destination_scenarios.choice_lists[i].value);
 *      }
 *  });
 *  ```
 */
 PokitDok.prototype.icdConvert = function(options, callback) {
     if (options instanceof Function) {
         callback = options;
     }
     if (!options) {
         options = {};
     }
    var token = options.code || ''
    this.apiRequest({
        path: '/icd/convert/' + token,
        method: 'GET',
        json: options
    }, callback);
 };

/**
 * Get a list of insurance prices for a particular CPT Code in a specific Zip Code
 * @param {object} options - keys: cpt_code, zip_code
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#insurance-prices| See API documentation for more information}
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
    this.apiRequest({
        path: '/prices/insurance',
        method: 'GET',
        qs: options
    }, callback);
};

/**
 * Get a list of medical procedure information meeting certain search criteria.
 *
 *  @param {object} options - possible query string parameters or a specific code. Available query paramters: name, description.
 *  @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#medical-procedure-code| See API documentation for more information}
 * @example
 *  ```js
 *  // Print a list of all code names
 *  pokitdok.medicalProcedureCodes({}, function(req, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // Print the list
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          console.log(res.data[i].code.name);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.medicalProcedureCodes = function(options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.code || ''
    this.apiRequest({
        path: '/mpc/' + token,
        method: 'GET',
        qs: (!options.code) ? options : null,
    }, callback);
};

/**
 * Get a list of payers from the API for use in other EDI transactions.
 *
 * @deprecated starting in version 5.0. Use the `/tradingpartners` endpoint in stead
 *
 * @param {function} callback - a callback function that accepts an error and response parameter
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#payers| See API documentation for more information}
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
    this.apiRequest({
        path: '/payers/',
        method: 'GET'
    }, callback);
};

/**
 * Get information about available plans based on parameters given
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#plans| See API documentation for more information}
 * @param {object} options - keys: trading_partner_id, county, state, plan_id, plan_type, plan_name, metallic_level
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // fetch any plan information
 *  pokitdok.plans(function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the plan names and ids
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var plan = res.data[i];
 *          console.log(plan.plan_name + ':' + plan.plan_id);
 *      }
 *  });
 *  ```
 * @example
 *  ```js
 *  // fetch plan information for PPOs in Texas
 *  pokitdok.plans({plan_type:'PPO', state: 'TX'}, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the plan names and ids
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var plan = res.data[i];
 *          console.log(plan.plan_name + ':' + plan.plan_id);
 *      }
 *  });
 *  ```
 */
PokitDok.prototype.plans = function(options, callback){
    if (options instanceof Function) {
        callback = options;
    }
    this.apiRequest({
        path: '/plans/',
        method: 'GET',
        qs: options
    }, callback);
};

/**
 * Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
 * provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
 * 404 error is returned. Use any of the other available options to return a list of providers.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#providers| See API documentation for more information}
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
    this.apiRequest({
        path: '/providers/' + token,
        method: 'GET',
        qs: (!options.npi) ? options : null
    }, callback);
};

/**
 * The Referrals resource allows an application to request approval for a referral to another health care provider.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#referrals| See API documentation for more information}
 * @param {object} options - the authorizations query
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // submit a referral request for approval
 *  pokitdok.referrals({
 *      event: {
            category: 'specialty_care_review',
            certification_type: 'initial',
            delivery: {
                quantity: 1,
                quantity_qualifier: 'visits'
            },
            diagnoses: [
                {
                    code: '384.20',
                    date: '2014-09-30'
                }
            ],
            place_of_service: 'office',
            provider: {
                first_name: 'JOHN',
                npi: '1154387751',
                last_name: 'FOSTER',
                phone: '8645822900'
            },
            type: 'consultation'
        },
        patient: {
            birth_date: '1970-01-01',
            first_name: 'JANE',
            last_name: 'DOE',
            id: '1234567890'
        },
        provider: {
            first_name: 'CHRISTINA',
            last_name: 'BERTOLAMI',
            npi: '1619131232'
        },
        trading_partner_id: 'MOCKPAYER'
 *  }, function (err, res) {
 *      if (err) {
 *          return console.log(err, res.statusCode);
 *      }
 *      // print the correlation_id and trading_partner_id of the referral
 *      console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
 *  });
 *  ```
 */
PokitDok.prototype.referrals = function (options, callback) {


    this.apiRequest({
        path: '/referrals/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Get a list of supported scheduling systems and their UUIDs and descriptions or get a single
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Available keys: scheduler_uuid - A scheduling system's unique ID
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Grab a list of schedulers and print their descriptions
 *  pokitdok.schedulers(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var scheduler = res.data[i];
 *          console.log(scheduler.description);
 *      }
 *  });
 *
 *  ```
 * @example
 *  ```js
 *  // Grab a single scheduler and print the scheduler object
 *  pokitdok.schedulers({
 *      uuid: schedulersList[0].scheduler_uuid
 *      }, function(err, res) {
 *            if (err) {
 *              return console.log(err);
 *            }
 *            console.log();
 *      });
 *
 *  ```
 */
PokitDok.prototype.schedulers = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/schedulers/' + token,
        method: 'GET'
    }, callback);
};

/**
 * Get a list of appointment types, their UUIDs, and descriptions.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Available keys: uuid - An appointment type's unique ID
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Grab a list of appointment types and print their type and descriptions
 *  pokitdok.appointmentTypes(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var appt_type = res.data[i];
 *          console.log(appt_type.type + ' - ' + appt_type.description);
 *      }
 *  });
 *
 *  ```
 * @example
 *  ```js
 *  // Grab a single appointment type and print the appointment type object
 *  pokitdok.appointmentTypes(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      console.log(res.data);
 *  });
 *
 *  ```
 */
PokitDok.prototype.appointmentTypes = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/appointmenttypes/' + token,
        method: 'GET'
    }, callback);
};

/**
 * Query for open appointment slots (using pd_provider_uuid and location) or booked appointments (using patient_uuid) given query parameters.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Available keys: uuid - An appointment type's unique ID, pd_provider_uuid - A provider's unique ID,
                                             patient_uuid - an existing patient's unique ID, and location - location {object} for
                                             a provider or business
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Grab a list of appointment types and print their type and descriptions
 *  pokitdok.appointments(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
 *          var appt = res.data[i];
 *          console.log(appt_type.type + ' - ' + appt_type.description);
 *      }
 *  });
 *
 *  ```
 * @example
 *  ```js
 *  // Grab a single appointment and print the appointment type object
 *  pokitdok.appointments({
 *          uuid: 'ef987691-0a19-447f-814d-f8f3abbf4859'
 *      },
 *      function(err, res) {
 *          if (err) {
 *              return console.log(err);
 *          }
 *          console.log(res.data);
 *      }
 *  });
 *
 *  ```
 */
PokitDok.prototype.appointments = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/appointments/' + token,
        method: 'GET',
        qs: (!options.uuid) ? options : null
    }, callback);
};

/**
 * Book appointment for an open slot or edit its description. Post data contains patient attributes and description.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Required keys: pd_appointment_uuid,
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Delete an appointment slot with the given uuid
 *  pokitdok.deleteAppointmentSlot({
            uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
        }
 *  });
 *
 * ```
 */
PokitDok.prototype.updateAppointment = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/appointments/' + token,
        method: 'PUT',
        options: options
    }, callback);
};

/**
 * Cancel appointment given its {pd_appointment_uuid}.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Required keys: pd_appointment_uuid,
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Delete an appointment slot with the given uuid
 *  pokitdok.deleteAppointmentSlot({
            uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
       }
 *  });
 *
 * ```
 */
PokitDok.prototype.deleteAppointment = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/appointments/' + token,
        method: 'DELETE'
    }, callback);
};

/**
 * Registers an existing PokitDok user as a patient within a provider’s scheduling system.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Required keys: pd_patient_uuid - The PokitDok unique identifier for the user record,
                                             pd_provider_uuid - The PokitDok unique identifier for the provider record.
                                             location - The geo-location of the provider’s physical address.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Grab a list of appointment types and print their type and descriptions
 *  pokitdok.addPatientToSystem(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      console.log(res);
 *  });
    // An example response from this endpoint:
    // {
    //     'uuid': '2773f6ff-00cb-460f-823f-5ff2208511e7',
    //     'email': 'peg@emailprovider.com',
    //     'phone': '5553331122',
    //     'birth_date': '1990-01-13',
    //     'first_name': 'Peg',
    //     'last_name': 'Patient',
    //     'member_id': 'PD20150001'
    // }
 *
 * ```
 */
PokitDok.prototype.addPatientToSystem = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    this.apiRequest({
        path: '/schedule/patient/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Creates an open scheduling slot with the specified start and end times at the specified provider and location.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Required keys:  pd_provider_uuid, location, appointment_type, start_date, end_date
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Grab a list of appointment types and print their type and descriptions
 *  pokitdok.createAppointmentSlot(function(err, res) {
 *      if (err) {
 *          return console.log(err);
 *      }
 *      console.log(res);
 *  });
    // An example response from this endpoint
    // {
    //     'pd_appointment_uuid': 'ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2',
    //     'provider_scheduler_uuid': '8b21efa4-8535-11e4-a6cb-0800272e8da1',
    //     'appointment_id': 'W4MEM00001',
    //     'appointment_type': 'AT1',
    //     'start_date': '2014-12-16T15:09:34.197709',
    //     'end_date': '2014-12-16T16:09:34.197717',
    //     'booked': false
    // }
 *
 * ```
 */
PokitDok.prototype.createAppointmentSlot = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    this.apiRequest({
        path: '/schedule/slots/',
        method: 'POST',
        json: options
    }, callback);
};

/**
 * Deletes an open scheduling slot with the specified uuid.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#scheduling| See API documentation for more information}
 *
 * @param {object} options - Required keys: pd_appointment_uuid.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Delete an appointment slot with the given uuid
 *  pokitdok.deleteAppointmentSlot({
            uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
 *  });
 *
 * ```
 */
PokitDok.prototype.deleteAppointmentSlot = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || '';
    this.apiRequest({
        path: '/schedule/slots/' + token,
        method: 'DELETE'
    }, callback);
};

/**
 * Returns a list containing a single identity resource if a uuid is provided or returns a list containing one
 * or more identity resources meeting search criteria.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#identity-management| See API documentation for more information}
 *
 * @param {object} options - A list of parameters used to create the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Get a single identity resource by providing an uuid
 *  pokitdok.getIdentity({
            uuid: '881bc095-2068-43cb-9783-cce630364122'
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
 *  });
 *
 * ```
 * @example
 *  ```js
 *  // Query the indentity endpoint for an identity resource with the given values for the fields provided
 *  pokitdok.getIdentity({
            first_name: 'Oscar',
            last_name: 'Whitemire',
            gender: 'male'
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
 *  });
 *
 * ```
 */
PokitDok.prototype.getIdentity = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    var token = options.uuid || ''
    var path;
    if ( token != '' ) {
        path = '/identity/' + token
    } else {
        path = '/identity?'
    }
    this.apiRequest({
        path: path,
        method: 'GET',
        qs: (!options.uuid) ? options : null
    }, callback);
};


/**
 * Updates an existing identity resource. Returns the updated resource
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#identity-management| See API documentation for more information}
 *
 * @param {object} options - A list of parameters used to create the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Get a single identity resource by providing an uuid
 *  pokitdok.updateIdentity({
            uuid: '881bc095-2068-43cb-9783-cce630364122'
            prefix: 'Mr.',
            first_name: 'Oscar',
            middle_name: 'Harold',
            last_name: 'Whitmire',
            suffix: 'IV',
            birth_date: '2000-05-01',
            gender: 'male',
            email: 'oscar.whitmire@pokitdok.com',
            phone: '555-555-5555',
            secondary_phone: '333-333-4444',
            address: {
                address_lines: ['1400 Anyhoo Avenue'],
                city: 'Springfield',
                state: 'IL',
                zipcode: '90210'
            },
            identifiers: [
                {
                    location: [-121.93831, 37.53901],
                    provider_uuid: '1917f12b-fb6a-4016-93bc-adeb83204c83',
                    system_uuid: '967d207f-b024-41cc-8cac-89575a1f6fef',
                    value: 'W90100-IG-88'

                }
            ]
        }, function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
 *  });
 *
 * ```
 */
PokitDok.prototype.updateIdentity = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }

    var token = options.uuid;

    this.apiRequest({
        path: '/identity/' + token,
        method: 'PUT'
    }, callback);
};

/**
 * Creates an identity resource. Returns the created resource with a uuid
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#identity-management| See API documentation for more information}
 *
 * @param {object} options - A list of parameteres used to creat the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.
 * @param {function} callback - a callback function that accepts an error and response parameter
 * @example
 *  ```js
 *  // Create a new identity resource with the following information
 *  pokitdok.createIdentity({
            'prefix': 'Mr.',
            'first_name': 'Oscar',
            'middle_name': 'Harold',
            'last_name': 'Whitmire',
            'suffix': 'IV',
            'birth_date': '2000-05-01',
            'gender': 'male',
            'email': 'oscar@pokitdok.com',
            'phone': '555-555-5555',
            'secondary_phone': '333-333-4444',
            'address': {
                'address_lines': ['1400 Anyhoo Avenue'],
                'city': 'Springfield',
                'state': 'IL',
                'zipcode': '90210'
            },
            'identifiers': [
                {
                    'location': [-121.93831, 37.53901],
                    'provider_uuid': '1917f12b-fb6a-4016-93bc-adeb83204c83',
                    'system_uuid': '967d207f-b024-41cc-8cac-89575a1f6fef',
                    'value': 'W90100-IG-88'

                }
            ]
        },function(err, res) {
           if (err) {
               return console.log(err);
           }
           console.log(res);
 *  });
 *
 * ```
 */
PokitDok.prototype.createIdentity = function (options, callback) {
    if (options instanceof Function) {
        callback = options;
    }
    if (!options) {
        options = {};
    }
    this.apiRequest({
        path: '/identity/',
        method: 'POST',
        options: options
    }, callback);
};



/**
 * Get a list of trading partners from the API for use in other EDI transactions.
 *
 * {@link https://platform.pokitdok.com/documentation/v4/#trading-partners| See API documentation for more information}
 * @param {object} options - A object containing some options for the request. Possible keys include: id (a trading partner id)
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
    this.apiRequest({
        path: '/tradingpartners/' + token,
        method: 'GET'
    }, callback);
};

// expose the constructor
module.exports = PokitDok;
