var assert = require('assert'),
    async = require('async'),
    PokitDok = require('../index.js'),
    clientId = process.env.POKITDOK_CLIENT_ID,
    clientSecret = process.env.POKITDOK_CLIENT_SECRET;

describe('PokitDok', function () {
    var pokitdok = new PokitDok(clientId, clientSecret);

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
                limit: 2
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                assert.equal(res.data.length, 2);
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
            ], function (err, results) {
                done();
            });
        });
    });
});