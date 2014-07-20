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

## Quick Start
```javascript
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
change the state of an activity by passing the

**Params**

- options `object` - keys: id
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

<a name="PokitDok#payers"></a>
###pokitDok.payers(callback)
Get a list of payers from the API for use in other EDI transactions.

**Params**

- callback `function` - a callback function that accepts an error and response parameter

**Example**  
```js
// cache a list of payers for use in other EDI transactions
var payerList = [];
pokitdok.payers(function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // save the list for later use
    payerList = res.data;
    console.log(payerList);
});
```

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
// cache a list of trading partners for use in other EDI transactions
var tradingPartnerList = [];
pokitdok.tradingPartners(function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // save the list for later use
    tradingPartnerList = res.data;
    console.log(tradingPartnerList);
});
```

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