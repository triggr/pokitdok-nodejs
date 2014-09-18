var assert = require('assert'),
    async = require('async'),
    PokitDok = require('../index.js'),
    clientId = process.env.POKITDOK_CLIENT_ID,
    clientSecret = process.env.POKITDOK_CLIENT_SECRET;

describe('PokitDok', function () {
    var pokitdok = new PokitDok(clientId, clientSecret);

    describe('#activities()', function () {
        var activityList = [];

        it('should return a list of activities', function (done) {
            pokitdok.activities(function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                activityList = res.data;
                done();
            });
        });

        it('should return a single activity', function (done) {
            pokitdok.activities({
                id: activityList[0]._id
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data._id == activityList[0]._id, true);
                done();
            });
        });

        it('should cancel a single activity', function (done) {
            pokitdok.activities({
                id: activityList[0]._id,
                transition: 'cancel'
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data._id == activityList[0]._id, true);
                done();
            });
        });
    });

    describe('#cashPrices()', function () {
        it('should return a list prices', function (done) {
            pokitdok.cashPrices({
                cpt_code: '90658',
                zip_code: '94401'
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                assert.equal(res.data[0].cpt_code == '90658', true);
                assert.equal(res.data[0].geo_zip_area == '944', true);
                assert.equal(res.data[0].average_price == 62.15272966703196, true);
                done();
            });
        });
    });

    describe('#claims()', function () {
        it('should return an activity', function (done) {
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
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });
    });

    describe('#claimStatus()', function () {
        it('should return a status response', function (done) {
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
                    npi: '1467560003'
                },
                service_date: '2014-01-01',
                service_end_date: '2014-01-04',
                trading_partner_id: 'MOCKPAYER',
                tracking_id: 'ABC12345'
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });
    });

    describe('#insurancePrices()', function () {
        it('should return a single price', function (done) {
            pokitdok.insurancePrices({
                cpt_code: '90658',
                zip_code: '94401'
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data.cpt_code == '90658', true);
                assert.equal(res.data.geo_zip_area == '944', true);
                assert.equal(res.data.amounts instanceof Array, true);
                done();
            });
        });
    });

    describe('#payers()', function () {
        it('should return a list of payers', function (done) {
            pokitdok.payers(function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                done();
            });
        });
    });

    describe('#providers()', function () {
        it('should return a list of providers', function (done) {
            pokitdok.providers({
                zipcode: 94118,
                last_name: 'shen',
                radius: '10mi',
                limit: 3
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                assert.equal(res.data.length, 3);
                done();
            });
        });

        it('should return a single provider when using a npi id', function (done) {
            pokitdok.providers({
                npi: '1881692002'
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data.provider.npi, 1881692002);
                done();
            });
        });
    });

    describe('#tradingPartners()', function () {
        it('should return a list of trading partners', function (done) {
            pokitdok.tradingPartners(function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                done();
            });
        });

        it('should return a single trading partners', function (done) {
            pokitdok.tradingPartners({id: 'MOCKPAYER'}, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });
    });

    describe('#plans()', function () {
        it('should return a general list of plans', function (done) {
            pokitdok.plans({}, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                done();
            });
        });

        it('should return a list of plans in TX', function (done) {
            pokitdok.plans({state: 'TX', plan_type: 'PPO'}, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                done();
            });
        });
    });

    describe('#eligibility()', function () {
        it('general eligibility for a member for a specific provider should return a status response', function (done) {
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
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });

        it('get general eligibility for a member for a specific provider using a CPT code should return a status response', function (done) {
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
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });
    });

    describe('#enrollment()', function () {
        it('enrollment for a member for a specific provider should return a status response', function (done) {
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
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                done();
            });
        });
    });
});

describe('AsyncPokitDok', function () {
    var pokitdok = new PokitDok(clientId, clientSecret);
    describe('#retryQueue()', function () {
        it('should automatically refresh the token and retry', function (done) {
            async.parallel([
                function (callback) {
                    pokitdok.tradingPartners(function (err, res) {
                        assert.equal(null, err);
                        assert.equal(res.meta instanceof Object, true);
                        assert.equal(res.data instanceof Array, true);
                        callback();
                    });
                },
                function (callback) {
                    pokitdok.tradingPartners(function (err, res) {
                        assert.equal(null, err);
                        assert.equal(res.meta instanceof Object, true);
                        assert.equal(res.data instanceof Array, true);
                        callback();
                    });
                },
                function (callback) {
                    pokitdok.tradingPartners(function (err, res) {
                        assert.equal(null, err);
                        assert.equal(res.meta instanceof Object, true);
                        assert.equal(res.data instanceof Array, true);
                        callback();
                    });
                },
                function (callback) {
                    pokitdok.tradingPartners(function (err, res) {
                        assert.equal(null, err);
                        assert.equal(res.meta instanceof Object, true);
                        assert.equal(res.data instanceof Array, true);
                        callback();
                    });
                }
            ], function (err, res) {
                done();
            });
        });
    });
});
