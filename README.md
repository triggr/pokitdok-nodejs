pokitdok-nodejs
=============

PokitDok Platform API Client for NodeJS

## Resources
* [Read the PokitDok API docs][apidocs]
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

This version of pokitdok-nodejs supports, and defaults to using, the new
PokitDok v4 API. If you"d like to continue using the previous v3 API,
instantiate the PokitDok object like this:

```javascript
var pokitdok = new PokitDok('my_client_id', 'my_client_secret', 'v3')
```

## Supported NodeJS versions
This library aims to support and is tested against these NodeJS versions, 
using travis-ci:

* 0.8.x
* 0.9.x
* 0.10.x

## License
Copyright (c) 2014 PokitDok Inc. See [LICENSE][] for details.

[license]: LICENSE.txt