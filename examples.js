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
    id: '53cd98fbfe60f32092d920ba'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});

// cancel an  activity
pokitdok.activities({
    id: '53cd98fbfe60f32092d920ba',
    transition: 'cancel'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the activity name status and id
    console.log(res.data.id + ':' + res.data.name + ':' + res.data.state.name);
});

//// print the procedure code and price for a particular zip/cpt combination
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
        console.log(price.cpt_code + ':' + price.geo_zip_area + ':' + price.average_price);
    }
});

//// submit a claim document
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

//// get the status of a claim using a date range and tracking id
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
    assert.equal(null, err);
    assert.equal(res.meta instanceof Object, true);
    assert.equal(res.data instanceof Object, true);
    done();
});

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
    assert.equal(null, err);
    assert.equal(res.meta instanceof Object, true);
    assert.equal(res.data instanceof Object, true);
    done();
});

//// get general eligibility for a member for a specific provider
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
    // print the member eligibility
    console.log(res.data);
});

//// get enrollment for a member for a specific provider
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
    // print the member enrollment
    console.log(res.data);
});

// get general eligibility for a member for a specific provider using a CPT code
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

//// print the procedure code and price for a particular zip/cpt combination
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

//// get a provider using a npi id
pokitdok.providers({
    npi: '1881692002'
}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // res.data is a single result
    console.log(res.data.provider.first_name + ' ' + res.data.provider.last_name);
});

//// print the trading partner id's, used to identify a payer for other EDI transaction
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

//// print a single trading partner name : id pair from a specific query
pokitdok.tradingPartners({id: 'MOCKPAYER'}, function (err, res) {
    if (err) {
        return console.log(err, res.statusCode);
    }
    // print the info received
    console.log("Single Trading Partner query for 'MOCKPAYER'")
    console.log(res.data.name + ':' + res.data.id);
});

//// fetch any plan information
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

//// fetch plan information for PPOs in Texas
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
