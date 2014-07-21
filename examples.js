// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('./index.js');
// var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET);

// get a connection to the PokitDok Platform for version 3
var pokitdokV3 = new PokitDok(process.env.POKITDOK_CLIENT_ID, process.env.POKITDOK_CLIENT_SECRET, 'v3');

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

// get a single activity
pokitdok.activities({
    id: '5317f51527a27620f2ec7533'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});

// cancel an  activity
pokitdok.activities({
    id: '5317f51527a27620f2ec7533',
    transition: 'cancel'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});

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
        console.log(price.cpt_code + ':' + price.geo_zip_area + ':' + price.average);
    }
});

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