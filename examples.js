// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('./index.js');
// var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET);

// get a connection to the PokitDok Platform for version 3
var pokitdokV3 = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET, 'v3');

// cache a list of payers for use in other EDI transactions
var payerList = [];
pokitdok.payers(function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // save the list for later use
    payerList = res.data;
    console.log(payerList);
});

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

// cache a list of trading partners for use in other EDI transactions
var tradingPartnerList = [];
pokitdok.tradingPartners(function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // save the list for later use
    tradingPartnerList = res.data;
    console.log(tradingPartnerList);
});

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

// get a list of providers based on the filters provided
pokitdok.providers({
    zipcode: 94118,
    last_name: 'shen',
    radius: '10mi',
    limit: 2
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a list of results
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var provider = res.data[i].provider;
        console.log(provider.first_name + ' ' + provider.last_name);
    }
});

// get a provider using a npi id
pokitdok.providers({
    npi: '1881692002'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a single result
    console.log(res.data.provider.first_name + ' ' + res.data.provider.last_name);
});


// get a list of activities
pokitdok.activities({}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var activity = res.data[i];
        console.log(activity.id + ':' + activity.name + ':' + activity.state.name);
    }
});