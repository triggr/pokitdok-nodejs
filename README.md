[![Build Status](https://travis-ci.org/pokitdok/pokitdok-java.svg?branch=master)](https://travis-ci.org/pokitdok/pokitdok-java)
[![Dependency Freshness](https://www.versioneye.com/user/projects/538e498b46c4739edd0000ee/badge.svg)](https://www.versioneye.com/user/projects/538e498b46c4739edd0000ee)


pokitdok-java
=============

PokitDok Platform API Client for Java

## Resources
* [Read the PokitDok API docs][apidocs]
* [View Source on GitHub][code]
* [Report Issues on GitHub][issues]

[apidocs]: https://platform.pokitdok.com/documentation/v4#/
[code]: https://github.com/PokitDok/pokitdok-java
[issues]: https://github.com/PokitDok/pokitdok-java/issues

## Installation

### Manual Install
You can download pokitdok-java-0.1.jar from [this site](https://github.com/pokitdok/pokitdok-java/raw/master/target/pokitdok-java-0.1.jar) and include it on your classpath, like any other JAR.
A few other JAR requirements need to be on your classpath as well. They are:
* Apache HTTPCore and HTTPClient, available from [http://hc.apache.org/downloads.cgi](http://hc.apache.org/downloads.cgi)
* Apache Commons Codec, available from [http://commons.apache.org/proper/commons-codec/download_codec.cgi](http://commons.apache.org/proper/commons-codec/download_codec.cgi)
* Apache Commons Logging, available from [http://commons.apache.org/proper/commons-logging/download_logging.cgi](http://commons.apache.org/proper/commons-logging/download_logging.cgi)
* json-simple, available from [https://code.google.com/p/json-simple/downloads/detail?name=json-simple-1.1.1.jar](https://code.google.com/p/json-simple/downloads/detail?name=json-simple-1.1.1.jar)

Future versions will be deployed to the Maven central repository, to automate installation and the management of these dependencies.

## Quick Start
```java
import com.pokitdok;
import org.json.simple.JSONValue;

public class PokitDokTest {
  public static void main(String args[]) {
    PokitDok pd = new PokitDok("your_client_id", "your_client_secret");
    
    /* Retrieve provider information by NPI */
    Map npiQuery = new HashMap<String, String>();
    npiQuery.put("npi", "1467560003")
    pd.providers(npiQuery);

    /* Search providers by name (individuals) */
    Map nameQuery = new HashMap<String, String>();
    nameQuery.put("first_name", "JEROME");
    nameQuery.put("last_name", "AYA-AY")
    pd.providers(nameQuery);

    /* Search providers by name (organizations) */
    Map orgQuery = new HashMap<String, String>();
    orgQuery.put("name", "Qliance");
    pd.providers(orgQuery);

    /* Search providers by location and/or specialty */
    Map providerQuery = new HashMap<String, String>();
    providerQuery.put("zipcode", "29307");
    providerQuery.put("radius", "10mi");
    providerQuery.put("specialty", "RHEUMATOLOGY");
    pd.providers(providerQuery);

    /*
      Eligibility endpoint example. This example uses the SimpleJSON library
      to parse a string called "eligibility", containing JSON, into a Map,
      which is then passed into the Eligibility endpoint. You can create this
      Map in any way you prefer - loading it from a JSON string is done for
      succintness of discussion. The contents of the string are as follows:

      {
        "member": {
            "birth_date": "1970-01-01",
            "first_name": "Jane",
            "last_name": "Doe",
            "id": "W000000000"
        },
        "provider": {
            "first_name": "JEROME",
            "last_name": "AYA-AY",
            "npi": "1467560003"
        },
        "service_types": ["health_benefit_plan_coverage"],
        "trading_partner_id": "MOCKPAYER"
      }
    */

    Map eligibilityQuery = JSONValue.parse(eligibility);
    pd.eligibility(eligibilityQuery);

    /*
      Claim endpoint example. This example parses a JSON string similarly to the
      above Eligibility example. The JSON is as follows:

      {
        "transaction_code": "chargeable",
        "trading_partner_id": "MOCKPAYER",
        "billing_provider": {
          "taxonomy_code": "207Q00000X",
          "first_name": "Jerome",
          "last_name": "Aya-Ay",
          "npi": "1467560003",
          "address": {
            "address_lines": ["8311 WARREN H ABERNATHY HWY"],
            "city": "SPARTANBURG",
            "state": "SC",
            "zipcode": "29301"
          },
          "tax_id": "123456789"
        },
        "subscriber": {
          "first_name": "Jane",
          "last_name": "Doe",
          "member_id": "W000000000",
          "address": {
            "address_lines": ["123 N MAIN ST"],
            "city": "SPARTANBURG",
            "state": "SC",
            "zipcode": "29301"
          },
          "birth_date": "1970-01-01",
          "gender": "female"
        },
        "claim": {
          "total_charge_amount": 60.0,
          "service_lines": [
            {
              "procedure_code": "99213",
              "charge_amount": 60.0,
              "unit_count": 1.0,
              "diagnosis_codes": ["487.1"],
              "service_date": "2014-06-01"
            }
          ]
        }
      }
    */

    Map claimJSON = JSONValue.parse(claim);
    pd.claim(claimJSON);

    /*
      Check the status of a Claim. The JSON looks like this:
      
      {
          "patient": {
              "birth_date": "1970-01-01",
              "first_name": "JANE",
              "last_name": "DOE",
              "id": "1234567890"
          },
          "provider": {
              "first_name": "Jerome",
              "last_name": "Aya-Ay",
              "npi": "1467560003",
          },
          "service_date": "2014-01-01",
          "trading_partner_id": "MOCKPAYER"
      }
    */

    Map claimStatusQuery = JSONValue.parse(claimStatus);
    pd.claimStatus(claimStatusQuery);

    /* Retrieve an index of activities */
    pd.activities();

    /* Check on a specific activity */
    Map activityQuery = new HashMap<String, String>();
    activityQuery.put("activity_id", "5362b5a064da150ef6f2526c");
    pd.activities(activityQuery);

    /* Check on a batch of activities */
    Map batchQuery = new HashMap<String, String>();
    batchQuery.put("parent_id", "537cd4b240b35755f5128d5c");
    pd.activities(batchQuery);

    /* Upload an EDI file */
    pd.files("trading_partner_id", "path/to/a_file.edi");

    /* Get cash prices */
    Map cashQuery = new HashMap<String, String>();
    cashQuery.put("cpt_code", "87799");
    cashQuery.put("zip_code", "75201");
    pd.cashPrices(cashQuery);

    /* Get insurance prices */
    Map insuranceQuery = new HashMap<String, String>();
    cashQuery.put("cpt_code", "87799");
    cashQuery.put("zip_code", "29403");
    pd.insurancePrices(insuranceQuery);
  }
}
    
```

This version of pokitdok-java supports, and defaults to using, the new
PokitDok v4 API. If you"d like to continue using the previous v3 API,
instantiate the PokitDok object like this:

```
PokitDok pd = new PokitDok("my_client_id", "my_client_secret", "v3")
```

## Supported Java versions
This library aims to support and is tested against these Java versions, 
using travis-ci:

* Oracle: Java SE 8, Java SE 7
* OpenJDK: OpenJDK 7, OpenJDK 6

## License
Copyright (c) 2014 PokitDok Inc. See [LICENSE][] for details.

[license]: LICENSE.txt