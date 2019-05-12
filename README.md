# [ F ] - NodeJs Framework

[![Build Status](https://travis-ci.org/blacknred/node-framework-experiment.svg?branch=master)](https://travis-ci.org/blacknred/node-framework-experiment)

## The goal of this project is to implement a minimal web framework for educational purposes

### Example

```$
yarn run example:advanced
curl -d "name=volvo xc90" -X POST http://localhost:3000/api/cars
curl http://localhost:3000/api/cars
curl http://localhost:3000/api/cars/prices
```

### TODO

* Default or route specific responseSchema
* Route pre & after hooks