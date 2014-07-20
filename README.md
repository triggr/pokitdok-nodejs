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
  * [pokitDok.activities(callback)](#PokitDok#activities)
  * [pokitDok.tradingPartners(callback)](#PokitDok#tradingPartners)
  * [pokitDok.payers(callback)](#PokitDok#payers)
  * [pokitDok.providers(options, callback)](#PokitDok#providers)

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
var pokitdok = PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET);
```

**Example**  
```js
// get a connection to the PokitDok Platform for version 3
var PokitDok = require('pokitdok-nodejs');
var pokitdok = PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET, 'v3');
```

<a name="PokitDok#activities"></a>
###pokitDok.activities(callback)
Get a list of activities partners from the API. If an id is passed with the options, get a single activity.

**Params**

- callback 

<a name="PokitDok#tradingPartners"></a>
###pokitDok.tradingPartners(callback)
get a list of trading partners from the API

**Params**

- callback 

<a name="PokitDok#payers"></a>
###pokitDok.payers(callback)
get a list of payers from the API

**Params**

- callback 

<a name="PokitDok#providers"></a>
###pokitDok.providers(options, callback)
Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
404 error is returned. Use any of the other available options to return a list of providers.

**Params**

- options `object` - keys: id, npi, zipcode, radius, first_name, last_name, specialty, organization_name, limit
- callback `function` - a function that accepts an error and response parameter

**Example**  
```js
// get a list of providers based on the filters provided
pokitdok.providers({
    zipcode: 30606,
    radius: '10mi',
    specialty: 'RHEUMATOLOGY',
    limit: 20
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    console.log(res.meta.result_count + ' results');
    // res.data is a list of results
    for(var i=0, ilen=res.data.length; i < ilen; i++) {
        var provider = res.data[i];
        console.log(provider.first_name + ' ' + provider.last_name);
    }
});
```

**Example**  
```js
// get a provider using a npi id
pokitdok.providers({
    npi: '1467560003'
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a single result
    console.log(res.data.first_name + ' ' + res.data.last_name);
});
```

**Example**  
```js
// get a provider using a pokitdok id
pokitdok.providers({
    id: '1234567890ABCDEF'
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a single result
    console.log(res.data.first_name + ' ' + res.data.last_name);
});
```




## License
Copyright (c) 2014 PokitDok Inc. See [LICENSE][] for details.

[license]: LICENSE.txt