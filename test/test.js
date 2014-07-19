var assert = require('assert'),
    async = require('async'),
    PokitDok = require('../index.js'),
    clientId = process.env.POKITDOK_CLIENT_ID, //'m4mTXVIQ50P8pMIZQ6ge',
    clientSecret = process.env.POKITDOK_CLIENT_SECRET; //'PGDVdl06zF4ZmODPBwZHqeIMLBm5YccVYROtNSNG';

describe('PokitDok', function () {
    var pokitdok = new PokitDok(clientId, clientSecret);
//    describe('#refreshAccessToken()', function () {
//        it('should return a token for a valid id/secret pair', function (done) {
//            pokitdok.refreshAccessToken({}, function (err, res) {
//                assert.equal(null, err);
//                assert.equal(res.token_type, 'bearer');
//                done();
//            });
//        });
//    });

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