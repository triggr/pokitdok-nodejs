var assert = require('assert'),
    async = require('async'),
    fs = require('fs'),
    PokitDok = require('../index.js'),
    // clientId = '9P10N4H2F7ZbaAU6RYct',
    // clientSecret = 'gOFzgJiIUoqnUhjaZezDxUf7ugPF6FsRAPy2tWDT';
    clientId = 'NhZovpBF59tvdrkFyEQz', //process.env.POKITDOK_CLIENT_ID,
    clientSecret = 'c3dl2ygjWHSF5PcRMRMSPqHKWFz383OYCnvKiwCk'; //process.env.POKITDOK_CLIENT_SECRET;

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
                id: activityList[0].id
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

    describe('#authorizations()', function () {
        it('should return a status response', function (done) {
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

    // describe('#claimsConvert()', function () {
    //     it('should convert a valid x12 claims file', function (done) {
    //         var pathToX12File = 'test_claim.837';
    //         pokitdok.claimsConvert(pathToX12File, function (err, res) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log(res.statusCode);
    //             }
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Object, true);
    //             done();
    //         });
    //     });
    // });
    //
    // describe('#files()', function () {
    //     it('should receive and convert a raw x12 file', function (done) {
    //         var pathToX12File = 'test_claim.837';
    //         pokitdok.files({
    //             path_x12_file: pathToX12File,
    //             trading_partner_id: 'MOCKPAYER'
    //         },  function (err, res) {
    //             assert.equal(null, err);
    //             assert.equal(res.body != 'Unauthorized');
    //             done();
    //         });
    //     });
    // });

    describe('#icdConvert()', function () {
        it('should receive an ICD-9 code and respond with ICD-10 mapping information', function (done) {
            pokitdok.icdConvert({
                code: '250.12'
            }, function(err, res) {
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

    describe('#medicalProcedureCodes()', function () {
        var mpcList = [];

        it('should return a list of mpc codes', function (done) {
            pokitdok.medicalProcedureCodes(function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                mpcList = res.data;
                done();
            });
        });

        it('should return a single mpc', function (done) {
            pokitdok.medicalProcedureCodes({
                code: mpcList[2].code
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data.code === mpcList[2].code, true);
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
                limit: 4
            }, function (err, res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                assert.equal(res.data.length, 4);
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

    describe('#schedulers()', function() {
        var schedulersList = [];

        it('should return a list of schedulers', function(done) {
            pokitdok.schedulers(function(err, res){
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                schedulersList = res.data;
                done()
            })
        })
        it('should return a single scheduler', function(done) {
            pokitdok.schedulers({
                uuid: schedulersList[0].scheduler_uuid
            }, function(err, res){
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data.length, 1);
                assert.equal(res.data[0].scheduler_uuid == schedulersList[0].scheduler_uuid, true);
                done();
            })
        })
    });

    describe('#appointmentTypes()', function() {
        var apptTypesList = [];

        it('should return a list of appointment types', function(done) {
            pokitdok.appointmentTypes(function(err, res){
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                apptTypesList = res.data;
                done()
            })
        })
        it('should return a single appointment type', function(done) {
            pokitdok.appointmentTypes({
                uuid: apptTypesList[0].appointment_type_uuid
            }, function(err, res){
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Object, true);
                assert.equal(res.data.length, 1);
                assert.equal(res.data[0].appointment_type_uuid == apptTypesList[0].appointment_type_uuid, true);
                done();
            })
        })
    });

    describe('#appointments()', function() {
        it('should return a single appointment', function(done) {
            pokitdok.appointments({
                uuid: 'ef987691-0a19-447f-814d-f8f3abbf4859'
            }, function(err, res){
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                assert.equal(res.data instanceof Array, true);
                assert.equal(res.data.length, 1);
                done();
            });
        });
    });

    // describe('#updateAppointment()', function() {
    //     it('should update an appointment given a certain appointment_uuid', function(done) {
    //         pokitdok.updateAppointment({
    //             uuid: 'ef987691-0a19-447f-814d-f8f3abbf4859',
    //             description: 'Welcome to M0d3rN Healthcare'
    //         }, function(err, res) {
    //             if (err) {
    //                 console.log(err);
    //             }
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             done();
    //         });
    //     });
    // });

    describe('#deleteAppointment()', function() {
        it('should delete an appointment given a certain appointment_uuid', function(done) {
            pokitdok.deleteAppointment({
                uuid: 'ef987691-0a19-447f-814d-f8f3abbf4859'
            }, function(err, res) {
                if (err) {
                    console.log(err);
                }
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                done();
            });
        });
    });


    // describe('#addPatientToSystem()', function() {
    //
    //     it('should add a patient to a scheduling system and return that newly created patients', function(done) {
    //         pokitdok.addPatientToSystem({
    //             pd_patient_uuid: '2773f6ff-00cb-460f-823f-5ff2208511e7',
    //             pd_provider_uuid: 'b691b7f9-bfa8-486d-a689-214ae47ea6f8',
    //             location: [32.788110, -79.932364]
    //         }, function(err, res){
    //             if ( err ) {
    //                 return console.log(err);
    //             }
    //             // An example response contains the following fields:
    //             // {
    //             //    'uuid': '2773f6ff-00cb-460f-823f-5ff2208511e7',
    //             //    'email': 'peg@emailprovider.com',
    //             //    'phone': '5553331122',
    //             //    'birth_date': '1990-01-13',
    //             //    'first_name': 'Peg',
    //             //    'last_name': 'Patient',
    //             //    'member_id': 'PD20150001'
    //             // }
    //             console.log(res);
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Array, true);
    //             assert.equal(res.data.length, 1);
    //             done();
    //         })
    //     })
    // });

    // describe('#createAppointmentSlot()', function() {
    //     it('should create an appointment slot for the given start and end time at the given provider location', function(done) {
    //         pokitdok.createAppointmentSlot({
    //             pd_provider_uuid: 'b691b7f9-bfa8-486d-a689-214ae47ea6f8',
    //             location: [32.788110, -79.932364],
    //             appointment_type: 'AT1',
    //             start_date: '2014-12-16T15:09:34.197709',
    //             end_date: '2014-12-16T16:09:34.197717'
    //         }, function(err,res) {
    //             if (err) {
    //                 console.log(err.data);
    //             }
    //             // An example response contains the following fields
    //             // {
    //             //     'pd_appointment_uuid': 'ab21e95b-8fa6-41d4-98b9-9a1f6fcff0d2',
    //             //     'provider_scheduler_uuid': '8b21efa4-8535-11e4-a6cb-0800272e8da1',
    //             //     'appointment_id': 'W4MEM00001',
    //             //     'appointment_type': 'AT1',
    //             //     'start_date': '2014-12-16T15:09:34.197709',
    //             //     'end_date': '2014-12-16T16:09:34.197717',
    //             //     'booked': false
    //             // }
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Array, true);
    //             done();
    //         });
    //     });
    // });

    describe('#deleteAppointmentSlot()', function() {
        it('should delete an appointment slot given a certain appointment uuid', function(done) {
            pokitdok.deleteAppointmentSlot({
                uuid: 'ef987691-0a19-447f-814d-f8f3abbf4860'
            }, function(err,res) {
                assert.equal(null, err);
                assert.equal(res.meta instanceof Object, true);
                done();
            });
        });
    });

    // describe('#createIdentity()', function() {
    //     it('should create an identity resource with the given parameters and return it with a uuid', function(done) {
    //         pokitdok.createIdentity({
    //             prefix: 'Mr.',
    //             first_name: 'Oscar',
    //             middle_name: 'Harold',
    //             last_name: 'Whitmire',
    //             suffix: 'IV',
    //             birth_date: '2000-05-01',
    //             gender: 'male',
    //             email: 'oscar@pokitdok.com',
    //             phone: '555-555-5555',
    //             secondary_phone: '333-333-4444',
    //             address: {
    //                 address_lines: ['1400 Anyhoo Avenue'],
    //                 city: 'Springfield',
    //                 state: 'IL',
    //                 zipcode: '90210'
    //             },
    //             identifiers: [
    //                 {
    //                     location: [-121.93831, 37.53901],
    //                     provider_uuid: '1917f12b-fb6a-4016-93bc-adeb83204c83',
    //                     system_uuid: '967d207f-b024-41cc-8cac-89575a1f6fef',
    //                     value: 'W90100-IG-88'
    //                 }
    //             ]
    //         }, function(err, res) {
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Object, true);
    //             done();
    //         });
    //     });
    // });
    //
    // describe('#updateIdentity()', function() {
    //     it('should create an identity resource with the given parameters and return it with a uuid', function(done) {
    //         pokitdok.createIdentity({
    //             prefix: 'Mr.',
    //             first_name: 'Oscar',
    //             middle_name: 'Harold',
    //             last_name: 'Whitmire',
    //             suffix: 'IV',
    //             birth_date: '2000-05-01',
    //             gender: 'male',
    //             email: 'oscar@pokitdok.com',
    //             phone: '555-555-5555',
    //             secondary_phone: '333-333-4444',
    //             address: {
    //                 address_lines: ['1400 Anyhoo Avenue'],
    //                 city: 'Springfield',
    //                 state: 'IL',
    //                 zipcode: '90210'
    //             },
    //             identifiers: [
    //                 {
    //                     location: [-121.93831, 37.53901],
    //                     provider_uuid: '1917f12b-fb6a-4016-93bc-adeb83204c83',
    //                     system_uuid: '967d207f-b024-41cc-8cac-89575a1f6fef',
    //                     value: 'W90100-IG-88'
    //                 }
    //             ]
    //         }, function(err, res) {
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Object, true);
    //             done();
    //         });
    //     });
    // });
    //
    // describe('#getIdentity()', function() {
    //     it('should return a single identity resource given a specific uuid', function(done) {
    //         pokitdok.getIdentity({
    //             uuid: '881bc095-2068-43cb-9783-cce630364122'
    //         }, function(err, res) {
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Array, true);
    //             done();
    //         });
    //     });
    //     it('should return a list of identity resources that much the supplied set of query parameters', function(done) {
    //         pokitdok.getIdentity({
    //             first_name: 'Oscar',
    //             last_name: 'Whitemire',
    //             gender: 'male'
    //         }, function(err, res) {
    //             assert.equal(null, err);
    //             assert.equal(res.meta instanceof Object, true);
    //             assert.equal(res.data instanceof Array, true);
    //             done();
    //         });
    //     });
    // });

    describe('#referrals()', function () {
        it('should return a status response', function (done) {
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
            pokitdok.plans(function (err, res) {
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

}); // end PokitDok() tests

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
