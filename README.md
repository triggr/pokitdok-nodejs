pokitdok-nodejs
=============

PokitDok Platform API Client for NodeJS

![alt tag](https://pbs.twimg.com/profile_images/1557833527/alwaysbetonjs.png)

## Resources
* [Read the PokitDok API docs][apidocs]
* [View the pokitdok-nodejs API Reference](#PokitDok)
* [View Source on GitHub][code]
* [Report Issues on GitHub][issues]

[apidocs]: https://platform.pokitdok.com/documentation/v4#/
[code]: https://github.com/PokitDok/pokitdok-nodejs
[issues]: https://github.com/PokitDok/pokitdok-nodejs/issues

## Installation
```bash
npm install pokitdok-nodejs
```

## Supported NodeJS versions
This library aims to support and is tested against these NodeJS versions, using travis-ci:
* 0.8.x
* 0.9.x
* 0.10.x

## API Reference
<a name="PokitDok"></a>
##class: PokitDok
**Members**

* [class: PokitDok](#PokitDok)
  * [new PokitDok(clientId, clientSecret, version)](#new_PokitDok)
  * [pokitDok.apiRequest(options, callback)](#PokitDok#apiRequest)
  * [pokitDok.activities(options, callback)](#PokitDok#activities)
  * [pokitDok.authorizations(options, callback)](#PokitDok#authorizations)
  * [pokitDok.cashPrices(options, callback)](#PokitDok#cashPrices)
  * [pokitDok.claims(options, callback)](#PokitDok#claims)
  * [pokitDok.claimStatus(options, callback)](#PokitDok#claimStatus)
  * [pokitDok.eligibility(options, callback)](#PokitDok#eligibility)
  * [pokitDok.enrollment(options, callback)](#PokitDok#enrollment)
  * [pokitDok.icdConvert(options, callback)](#PokitDok#icdConvert)
  * [pokitDok.insurancePrices(options, callback)](#PokitDok#insurancePrices)
  * [pokitDok.medicalProcedureCodes(options, callback)](#PokitDok#medicalProcedureCodes)
  * [~~pokitDok.payers(callback)~~](#PokitDok#payers)
  * [pokitDok.plans(options, callback)](#PokitDok#plans)
  * [pokitDok.providers(options, callback)](#PokitDok#providers)
  * [pokitDok.referrals(options, callback)](#PokitDok#referrals)
  * [pokitDok.schedulers(options, callback)](#PokitDok#schedulers)
  * [pokitDok.appointmentTypes(options, callback)](#PokitDok#appointmentTypes)
  * [pokitDok.appointments(options, callback)](#PokitDok#appointments)
  * [pokitDok.updateAppointment(options, callback)](#PokitDok#updateAppointment)
  * [pokitDok.deleteAppointment(options, callback)](#PokitDok#deleteAppointment)
  * [pokitDok.addPatientToSystem(options, callback)](#PokitDok#addPatientToSystem)
  * [pokitDok.createAppointmentSlot(options, callback)](#PokitDok#createAppointmentSlot)
  * [pokitDok.deleteAppointmentSlot(options, callback)](#PokitDok#deleteAppointmentSlot)
  * [pokitDok.getIdentity(options, callback)](#PokitDok#getIdentity)
  * [pokitDok.updateIdentity(options, callback)](#PokitDok#updateIdentity)
  * [pokitDok.createIdentity(options, callback)](#PokitDok#createIdentity)
  * [pokitDok.tradingPartners(options, callback)](#PokitDok#tradingPartners)

<a name="new_PokitDok"></a>
###new PokitDok(clientId, clientSecret, version)
Create a connection to the pokitdok API. The version defaults to v4. You must enter your client ID and client secret
or all requests made with your connection will return errors.

**Params**

- clientId `string` - The client id of your PokitDok App  
- clientSecret `string` - The client secret of your PokitDok App  
- version `string` - the version of the API the connection should use  

**Example**  
```js
// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET);
```

**Example**  
```js
// get a connection to the PokitDok Platform for version 3
var PokitDok = require('pokitdok-nodejs');
var pokitdokV3 = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET, 'v3');
```

<a name="PokitDok#apiRequest"></a>
###pokitDok.apiRequest(options, callback)
A generic API request that is used by all specific endpoints functions like `pokitdok.activities(...)` and
`pokitdok.CashPrices(...)`.

**Params**

- options `object` - keys: `path`, `method`, `qs`, `json`. The path is the desired API endpoint, such as `/activities` or `/tradingpartners`. Method is the desired `HTTP` request method. qs is the query string containing request paramaters, and json is a json object containing request options.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
   // Get a list of activities using the generic pokitdok.apiRequest(...) function.
   // This has the same result as the first pokidtdok.activities(...) example.
   pokitdok.apiRequest({
       path: '/activities/' + token,
       method: (options.transition && options.id) ? 'PUT' : 'GET',
       qs: (!options.id) ? options : null,
       json: {
           transition: options.transition
       }
   }, function(err, res) {
      if (err) {
        return console.log(err, res.statusCode);
      }
      // print the activity name status and id
      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
          var activity = res.data[i];
          console.log(activity.id + ':' + activity.name + ':' + activity.state.name);
      }
   });
```

<a name="PokitDok#activities"></a>
###pokitDok.activities(options, callback)
Get a list of activities from the API. If an id is passed with the options, get a single activity. You can also
change the state of an activity by passing the desired state (pause, cancel, resume) in the transition key.

**Params**

- options `object` - keys: id, transition  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#activities)  

**Example**  
```js
// get a list of activities
pokitdok.activities({}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var activity = res.data[i];
        console.log(activity.id + ':' + activity.name + ':' + activity.state.name);
    }
});
```

**Example**  
```js
// get a single activity
pokitdok.activities({
    id: '5317f51527a27620f2ec7533'
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});
```

**Example**  
```js
// cancel an  activity
pokitdok.activities({
    id: '5317f51527a27620f2ec7533',
    transition: 'cancel'
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});
```

<a name="PokitDok#authorizations"></a>
###pokitDok.authorizations(options, callback)
The Authorizations resource allows an application to submit a request for the
review of health care in order to obtain an authorization for that health care.

**Params**

- options `object` - the authorizations query  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#authorizations)  

**Example**  
```js
// submit an authorizations request
pokitdok.authorizations({
    event: {
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
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the correlation_id and trading_partner_id of the authorization
    console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
});
```

<a name="PokitDok#cashPrices"></a>
###pokitDok.cashPrices(options, callback)
Get a list of cash prices for a particular CPT Code in a specific Zip Code

**Params**

- options `object` - keys: cpt_code, zip_code  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#cash-prices)  

**Example**  
```js
// print the procedure code and price for a particular zip/cpt combination
pokitdok.cashPrices({
        zip_code: '94401',
        cpt_code: '90658'
    }, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the cpt, geo_zip and average price
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var price = res.data[i];
        console.log(price.cpt_code + ':' + price.geo_zip_area +  ':' + price.average);
    }
});
```

<a name="PokitDok#claims"></a>
###pokitDok.claims(options, callback)
Submit a claim for processing. The API calls back with an activity object that tracks the state of the claim.

**Params**

- options `object` - the claim document  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#claims)  

**Example**  
```js
// submit a claim document
pokitdok.claims({
    transaction_code: 'chargeable',
    trading_partner_id: 'MOCKPAYER',
    billing_provider: {
        taxonomy_code: '207Q00000X',
        first_name: 'Jerome',
        last_name: 'Aya-Ay',
        npi: '1467560003',
        address: {
            address_lines: [
                '8311 WARREN H ABERNATHY HWY'
            ],
            city: 'SPARTANBURG',
            state: 'SC',
            zipcode: '29301'
        },
        tax_id: '123456789'
    },
    subscriber: {
        first_name: 'Jane',
        last_name: 'Doe',
        member_id: 'W000000000',
        address: {
            address_lines: ['123 N MAIN ST'],
            city: 'SPARTANBURG',
            state: 'SC',
            zipcode: '29301'
        },
        birth_date: '1970-01-01',
        gender: 'female'
    },
    claim: {
        total_charge_amount: 60.0,
        service_lines: [
            {
                procedure_code: '99213',
                charge_amount: 60.0,
                unit_count: 1.0,
                diagnosis_codes: [
                    '487.1'
                ],
                service_date: '2014-06-01'
            }
        ]
    }
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity id, name and state
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});
```

<a name="PokitDok#claimStatus"></a>
###pokitDok.claimStatus(options, callback)
Get the status of a submitted claim from the specified trading partner. You can specify a specific tracking id if
you have one from the original claim.

**Params**

- options `object` - the claim status query  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#claims-status)  

**Example**  
```js
// get the status of a claim using a date range and tracking id
pokitdok.claimStatus({
    patient: {
        birth_date: '1970-01-01',
        first_name: 'JANE',
        last_name: 'DOE',
        id: '1234567890'
    },
    provider: {
        first_name: 'Jerome',
        last_name: 'Aya-Ay',
        npi: '1467560003',
    },
    service_date: '2014-01-01',
    service_end_date: '2014-01-04',
    trading_partner_id: 'MOCKPAYER',
    tracking_id: 'ABC12345'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the correlation_id and trading_partner_id of the claim
    console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
});
```

<a name="PokitDok#eligibility"></a>
###pokitDok.eligibility(options, callback)
Get an eligibility response from a trading partner based on the provided eligibility document (provider, member,
cpt code, service_types)

**Params**

- options `object` - keys: provider, service_types, member, cpt_code, trading_partner_id  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#eligibility)  

**Example**  
```js
// get general eligibility for a member for a specific provider
pokitdok.eligibility({
    member: {
        birth_date: '1970-01-01',
        first_name: 'Jane',
        last_name: 'Doe',
        id: 'W000000000'
    },
    provider: {
        first_name: 'JEROME',
        last_name: 'AYA-AY',
        npi: '1467560003'
    },
    service_types: ['health_benefit_plan_coverage'],
    trading_partner_id: 'MOCKPAYER'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the member eligibility for the specified provider
    console.log(res.data);
});
```

**Example**  
```js
// get eligibility for a member for a specific CPT code
pokitdok.eligibility({
    member: {
        birth_date: '1970-01-01',
        first_name: 'Jane',
        last_name: 'Doe',
        id: 'W000000000'
    },
    provider: {
        first_name: 'JEROME',
        last_name: 'AYA-AY',
        npi: '1467560003'
    },
    cpt_code: '81291',
    trading_partner_id: 'MOCKPAYER'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the member eligibility for the specified CPT code
    console.log(res.data);
});
```

<a name="PokitDok#enrollment"></a>
###pokitDok.enrollment(options, callback)
Get an enrollment response from a trading partner based on the provided enrollment document (provider, member,
cpt code, service_types)

**Params**

- options `object` - keys: provider, service_types, member, cpt_code, trading_partner_id  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#enrollment-snapshot)  

**Example**  
```js
// get general enrollment for a member for a specific provider
pokitdok.enrollment({
    member: {
        birth_date: '1970-01-01',
        first_name: 'Jane',
        last_name: 'Doe',
        id: 'W000000000'
    },
    provider: {
        first_name: 'JEROME',
        last_name: 'AYA-AY',
        npi: '1467560003'
    },
    service_types: ['health_benefit_plan_coverage'],
    trading_partner_id: 'MOCKPAYER'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the member enrollment for the specified provider
    console.log(res.data);
});
```

<a name="PokitDok#icdConvert"></a>
###pokitDok.icdConvert(options, callback)
The ICD Convert endpoint allows a client application to request ICD-9 to ICD-10
mapping information for the specified ICD-9 code.
This endpoint retrieves ICD-9 to ICD-10 mapping information.

**Params**

- options `object` - An object containing query parameters. Avaiable keys: code (an ICD-9 code)  
- callback `function` - [ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#icd-conver)  

**Example**  
```js
// Basic ICD-9 to ICD-10 conversion
pokitdok.icdConvert(icd9Code, function(err,res) {
    if ( err ) {
        console.log(err);
    } else {
       // Print out the ICD-10 values for the destination scenarios choice list
       for ( var i = 0; ilen = res.data.destination_scenarios.choice_lists.length; i < ilen; i++ ) {
           console.log(res.data.destination_scenarios.choice_lists[i].value);
    }
});
```

<a name="PokitDok#insurancePrices"></a>
###pokitDok.insurancePrices(options, callback)
Get a list of insurance prices for a particular CPT Code in a specific Zip Code

**Params**

- options `object` - keys: cpt_code, zip_code  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#insurance-prices)  

**Example**  
```js
// print the procedure code and price for a particular zip/cpt combination
pokitdok.insurancePrices({
        zip_code: '94401',
        cpt_code: '90658'
    }, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the cpt and geo_zip
    console.log(res.data.cpt_code + ':' + res.data.geo_zip_area);
    // print the average price per payment types
    for (var i = 0, ilen = res.data.amounts.length; i < ilen; i++) {
        var price = res.data.amounts[i];
        console.log(price.payment_type + ':' + price.average);
    }
});
```

<a name="PokitDok#medicalProcedureCodes"></a>
###pokitDok.medicalProcedureCodes(options, callback)
Get a list of medical procedure information meeting certain search criteria.

**Params**

- options `object` - possible query string parameters or a specific code. Available query paramters: name, description.  
- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#medical-procedure-code)  

**Example**  
```js
// Print a list of all code names
pokitdok.medicalProcedureCodes({}, function(req, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // Print the list
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        console.log(res.data[i].code.name);
    }
});
```

<a name="PokitDok#payers"></a>
###~~pokitDok.payers(callback)~~
Get a list of payers from the API for use in other EDI transactions.

**Params**

- callback `function` - a callback function that accepts an error and response parameter

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#payers)  

***Deprecated***  
**Example**  
```js
// print the trading partner id's, used to identify a payer for other EDI transaction
pokitdok.payers(function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the name and trading_partner_id of each payer
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var payer = res.data[i];
        console.log(payer.payer_name + ':' + payer.trading_partner_id);
    }
});
```

<a name="PokitDok#plans"></a>
###pokitDok.plans(options, callback)
Get information about available plans based on parameters given

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#plans)

**Params**

- options `object` - keys: trading_partner_id, county, state, plan_id, plan_type, plan_name, metallic_level  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// fetch any plan information
pokitdok.plans(function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the plan names and ids
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var plan = res.data[i];
        console.log(plan.plan_name + ':' + plan.plan_id);
    }
});
```

**Example**  
```js
// fetch plan information for PPOs in Texas
pokitdok.plans({plan_type:'PPO', state: 'TX'}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the plan names and ids
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var plan = res.data[i];
        console.log(plan.plan_name + ':' + plan.plan_id);
    }
});
```

<a name="PokitDok#providers"></a>
###pokitDok.providers(options, callback)
Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
404 error is returned. Use any of the other available options to return a list of providers.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#providers)

**Params**

- options `object` - keys: npi, zipcode, radius, first_name, last_name, specialty, organization_name, limit  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// get a list of providers based on the filters provided
pokitdok.providers({
    zipcode: 94118,
    last_name: 'shen',
    radius: '10mi',
    limit: 2
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a list of results
    for(var i=0, ilen=res.data.length; i < ilen; i++) {
        var provider = res.data[i].provider;
        console.log(provider.first_name + ' ' + provider.last_name);
    }
});
```

**Example**  
```js
// get a provider using a npi id
pokitdok.providers({
    npi: '1881692002'
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a single result
    console.log(res.data.provider.first_name + ' ' + res.data.provider.last_name);
});
```

<a name="PokitDok#referrals"></a>
###pokitDok.referrals(options, callback)
The Referrals resource allows an application to request approval for a referral to another health care provider.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#referrals)

**Params**

- options `object` - the authorizations query  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// submit a referral request for approval
pokitdok.referrals({
    event: {
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
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the correlation_id and trading_partner_id of the referral
    console.log(res.data.correlation_id + ':' + res.data.trading_partner_id);
});
```

<a name="PokitDok#schedulers"></a>
###pokitDok.schedulers(options, callback)
Get a list of supported scheduling systems and their UUIDs and descriptions or get a single

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Available keys: scheduler_uuid - A scheduling system's unique ID  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Grab a list of schedulers and print their descriptions
pokitdok.schedulers(function(err, res) {
    if (err) {
        return console.log(err);
    }
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var scheduler = res.data[i];
        console.log(scheduler.description);
    }
});

```

**Example**  
```js
// Grab a single scheduler and print the scheduler object
pokitdok.schedulers({
    uuid: schedulersList[0].scheduler_uuid
    }, function(err, res) {
          if (err) {
            return console.log(err);
          }
          console.log();
    });

```

<a name="PokitDok#appointmentTypes"></a>
###pokitDok.appointmentTypes(options, callback)
Get a list of appointment types, their UUIDs, and descriptions.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Available keys: uuid - An appointment type's unique ID  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Grab a list of appointment types and print their type and descriptions
pokitdok.appointmentTypes(function(err, res) {
    if (err) {
        return console.log(err);
    }
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var appt_type = res.data[i];
        console.log(appt_type.type + ' - ' + appt_type.description);
    }
});

```

**Example**  
```js
// Grab a single appointment type and print the appointment type object
pokitdok.appointmentTypes(function(err, res) {
    if (err) {
        return console.log(err);
    }
    console.log(res.data);
});

```

<a name="PokitDok#appointments"></a>
###pokitDok.appointments(options, callback)
Query for open appointment slots (using pd_provider_uuid and location) or booked appointments (using patient_uuid) given query parameters.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Available keys: uuid - An appointment type's unique ID, pd_provider_uuid - A provider's unique ID,
                                             patient_uuid - an existing patient's unique ID, and location - location {object} for
                                             a provider or business  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Grab a list of appointment types and print their type and descriptions
pokitdok.appointments(function(err, res) {
    if (err) {
        return console.log(err);
    }
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var appt = res.data[i];
        console.log(appt_type.type + ' - ' + appt_type.description);
    }
});

```

**Example**  
```js
// Grab a single appointment and print the appointment type object
pokitdok.appointments({
        uuid: 'ef987691-0a19-447f-814d-f8f3abbf4859'
    },
    function(err, res) {
        if (err) {
            return console.log(err);
        }
        console.log(res.data);
    }
});

```

<a name="PokitDok#updateAppointment"></a>
###pokitDok.updateAppointment(options, callback)
Book appointment for an open slot or edit its description. Post data contains patient attributes and description.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Required keys: pd_appointment_uuid,  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Delete an appointment slot with the given uuid
pokitdok.deleteAppointmentSlot({
           uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
       },function(err, res) {
          if (err) {
              return console.log(err);
          }
          console.log(res);
       }
});

```

<a name="PokitDok#deleteAppointment"></a>
###pokitDok.deleteAppointment(options, callback)
Cancel appointment given its {pd_appointment_uuid}.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Required keys: pd_appointment_uuid,  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Delete an appointment slot with the given uuid
pokitdok.deleteAppointmentSlot({
           uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
       },function(err, res) {
          if (err) {
              return console.log(err);
          }
          console.log(res);
      }
});

```

<a name="PokitDok#addPatientToSystem"></a>
###pokitDok.addPatientToSystem(options, callback)
Registers an existing PokitDok user as a patient within a provider’s scheduling system.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Required keys: pd_patient_uuid - The PokitDok unique identifier for the user record,
                                             pd_provider_uuid - The PokitDok unique identifier for the provider record.
                                             location - The geo-location of the provider’s physical address.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Grab a list of appointment types and print their type and descriptions
pokitdok.addPatientToSystem(function(err, res) {
    if (err) {
        return console.log(err);
    }
    console.log(res);
});
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

```

<a name="PokitDok#createAppointmentSlot"></a>
###pokitDok.createAppointmentSlot(options, callback)
Creates an open scheduling slot with the specified start and end times at the specified provider and location.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Required keys:  pd_provider_uuid, location, appointment_type, start_date, end_date  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Grab a list of appointment types and print their type and descriptions
pokitdok.createAppointmentSlot(function(err, res) {
    if (err) {
        return console.log(err);
    }
    console.log(res);
});
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

```

<a name="PokitDok#deleteAppointmentSlot"></a>
###pokitDok.deleteAppointmentSlot(options, callback)
Deletes an open scheduling slot with the specified uuid.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#scheduling)

**Params**

- options `object` - Required keys: pd_appointment_uuid.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Delete an appointment slot with the given uuid
pokitdok.deleteAppointmentSlot({
           uuid: ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2
       },function(err, res) {
          if (err) {
              return console.log(err);
          }
          console.log(res);
});

```

<a name="PokitDok#getIdentity"></a>
###pokitDok.getIdentity(options, callback)
Returns a list containing a single identity resource if a uuid is provided or returns a list containing one
or more identity resources meeting search criteria.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#identity-management)

**Params**

- options `object` - A list of parameters used to create the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Get a single identity resource by providing an uuid
pokitdok.getIdentity({
           uuid: '881bc095-2068-43cb-9783-cce630364122'
       },function(err, res) {
          if (err) {
              return console.log(err);
          }
          console.log(res);
});

```

**Example**  
```js
// Query the indentity endpoint for an identity resource with the given values for the fields provided
pokitdok.getIdentity({
           first_name: 'Oscar',
           last_name: 'Whitemire',
           gender: 'male'
       },function(err, res) {
          if (err) {
              return console.log(err);
          }
          console.log(res);
});

```

<a name="PokitDok#updateIdentity"></a>
###pokitDok.updateIdentity(options, callback)
Updates an existing identity resource. Returns the updated resource

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#identity-management)

**Params**

- options `object` - A list of parameters used to create the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Get a single identity resource by providing an uuid
pokitdok.updateIdentity({
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
});

```

<a name="PokitDok#createIdentity"></a>
###pokitDok.createIdentity(options, callback)
Creates an identity resource. Returns the created resource with a uuid

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#identity-management)

**Params**

- options `object` - A list of parameteres used to creat the identity resource. Avaiable keys include: address.adddress_lines,
                             address.city, address.state, address.zipcode, birth_date, email, first_name, gender, identifiers, last_name,
                             member_id, middle_name, phone, prefix, secondary_phone ssn, suffix, uuid.  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// Create a new identity resource with the following information
pokitdok.createIdentity({
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
});

```

<a name="PokitDok#tradingPartners"></a>
###pokitDok.tradingPartners(options, callback)
Get a list of trading partners from the API for use in other EDI transactions.

[ See API documentation for more information](https://platform.pokitdok.com/documentation/v4/#trading-partners)

**Params**

- options `object` - A object containing some options for the request. Possible keys include: id (a trading partner id)  
- callback `function` - a callback function that accepts an error and response parameter  

**Example**  
```js
// print the trading partner id's, used to identify a payer for other EDI transaction
pokitdok.tradingPartners(function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the name and trading_partner_id of each trading partner
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var tradingPartner = res.data[i];
        console.log(tradingPartner.name + ':' + tradingPartner.id);
    }
});
```

**Example**  
```js
// print a single trading partner
pokitdok.tradingPartners({id:'MOCKPAYER'}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    console.log(res.data.name + ':' + res.data.id);
});
```



## License
Copyright (c) 2014 PokitDok Inc. See [LICENSE][] for details.

[license]: LICENSE.txt