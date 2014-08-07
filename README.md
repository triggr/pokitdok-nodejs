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
  * [pokitDok.activities(options, callback)](#PokitDok#activities)
  * [pokitDok.cashPrices(options, callback)](#PokitDok#cashPrices)
  * [pokitDok.claims(options, callback)](#PokitDok#claims)
  * [pokitDok.claimStatus(options, callback)](#PokitDok#claimStatus)
  * [pokitDok.eligibility(options, callback)](#PokitDok#eligibility)
  * [pokitDok.enrollment(options, callback)](#PokitDok#enrollment)
  * [pokitDok.files(fileReadStream, callback)](#PokitDok#files)
  * [pokitDok.insurancePrices(options, callback)](#PokitDok#insurancePrices)
  * [pokitDok.payers(callback)](#PokitDok#payers)
  * [pokitDok.providers(options, callback)](#PokitDok#providers)
  * [pokitDok.tradingPartners(callback)](#PokitDok#tradingPartners)

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

<a name="PokitDok#activities"></a>
###pokitDok.activities(options, callback)
Get a list of activities from the API. If an id is passed with the options, get a single activity. You can also
change the state of an activity by passing the desired state (pause, cancel, resume) in the transition key.

**Params**

- options `object` - keys: id, transition  
- callback `function` - a callback function that accepts an error and response parameter  

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

<a name="PokitDok#cashPrices"></a>
###pokitDok.cashPrices(options, callback)
Get a list of cash prices for a particular CPT Code in a specific Zip Code

**Params**

- options `object` - keys: cpt_code, zip_code  
- callback `function` - a callback function that accepts an error and response parameter  

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

<a name="PokitDok#files"></a>
###pokitDok.files(fileReadStream, callback)
Submit a raw X12 file to the pokitdok platform for processing

**Params**

- fileReadStream `FileReadStream`  
- callback `function`  

<a name="PokitDok#insurancePrices"></a>
###pokitDok.insurancePrices(options, callback)
Get a list of insurance prices for a particular CPT Code in a specific Zip Code

**Params**

- options `object` - keys: cpt_code, zip_code  
- callback `function` - a callback function that accepts an error and response parameter  

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

<a name="PokitDok#payers"></a>
###pokitDok.payers(callback)
Get a list of payers from the API for use in other EDI transactions.

**Params**

- callback `function` - a callback function that accepts an error and response parameter  

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

<a name="PokitDok#providers"></a>
###pokitDok.providers(options, callback)
Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
404 error is returned. Use any of the other available options to return a list of providers.

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

<a name="PokitDok#tradingPartners"></a>
###pokitDok.tradingPartners(callback)
Get a list of trading partners from the API for use in other EDI transactions.

**Params**

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



## License
Copyright (c) 2014 PokitDok Inc. See [LICENSE][] for details.

[license]: LICENSE.txt