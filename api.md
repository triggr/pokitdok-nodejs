#Index


**Classes**

* [class: PokitDok](#PokitDok)
  * [new PokitDok(clientId, clientSecret, version)](#new_PokitDok)
  * [pokitDok.apiRequest(options, callback)](#PokitDok#apiRequest)
  * [pokitDok.activities(callback)](#PokitDok#activities)
  * [pokitDok.tradingPartners(callback)](#PokitDok#tradingPartners)
  * [pokitDok.payers(callback)](#PokitDok#payers)
  * [pokitDok.providers(options, callback)](#PokitDok#providers)

**Vars**

* [userAgent](#userAgent)


<a name="PokitDok"></a>
#class: PokitDok
**Members**

* [class: PokitDok](#PokitDok)
  * [new PokitDok(clientId, clientSecret, version)](#new_PokitDok)
  * [pokitDok.apiRequest(options, callback)](#PokitDok#apiRequest)
  * [pokitDok.activities(callback)](#PokitDok#activities)
  * [pokitDok.tradingPartners(callback)](#PokitDok#tradingPartners)
  * [pokitDok.payers(callback)](#PokitDok#payers)
  * [pokitDok.providers(options, callback)](#PokitDok#providers)

<a name="new_PokitDok"></a>
##new PokitDok(clientId, clientSecret, version)
Create a connection to the pokitdok API. The version defaults to v4. You must enter your client ID and client secret
or all requests made with your connection will return errors.

**Params**

- clientId `string` - The client id of your PokitDok App
- clientSecret `string` - The client secret of your PokitDok App
- version `string` - the version of the API the connection should use

<a name="PokitDok#apiRequest"></a>
##pokitDok.apiRequest(options, callback)
Make a request to the platform api. Handle 401's so that the access token is automatically created/refreshed.

**Params**

- options 
- callback 

<a name="PokitDok#activities"></a>
##pokitDok.activities(callback)
Get a list of activities partners from the API. If an id is passed with the options, get a single activity.

**Params**

- callback 

<a name="PokitDok#tradingPartners"></a>
##pokitDok.tradingPartners(callback)
get a list of trading partners from the API

**Params**

- callback 

<a name="PokitDok#payers"></a>
##pokitDok.payers(callback)
get a list of payers from the API

**Params**

- callback 

<a name="PokitDok#providers"></a>
##pokitDok.providers(options, callback)
Search health care providers in the PokitDok directory. When an id is specified in the options object, a single
provider or a 404 error response is returned.  When a npi is specified on the options object, a single provider or
404 error is returned. Use any of the other available options to return a list of providers.

**Params**

- options `object` - accepts: id, npi, zipcode, radius, first_name, last_name, specialty, organization_name, limit
- callback `function` - a function that accepts an error and response parameter

**Example**  
refine a provider search
```javascript
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(clientId, clientSecret);
pokitdok.providers({
    zipcode: 30606,
    radius: '10mi',
    first_name: 'Cliff',
    last_name: 'Wicklow',
    specialty: 'RHEUMATOLOGY',
    organization_name='Athens Regional Hospital',
    limit: 20
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    console.log(res.meta.result_count + ' results');
    for(i in res.data) {
        console.log(i.first_name + ' ' + i.last_name);
    }
});
```

**Example**  
get a provider using a npi id
```javascript
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(clientId, clientSecret);
pokitdok.providers({
    npi: 1467560003
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    console.log(res.data.first_name + ' ' + res.data.last_name);
});
```

**Example**  
get a provider by using a pokitdok id
```javascript
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(clientId, clientSecret);
pokitdok.providers({
    id: 1234567890ABCDEF
}, function(err, res){
    if(err) {
        return console.log(err, res.statusCode);
    }
    console.log(res.data.first_name + ' ' + res.data.last_name);
});
```

<a name="userAgent"></a>
#userAgent

