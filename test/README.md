# NodeJs tests
This folder contains automatic tests for the NodeJS part of the project. They
are written using [mocha]([https://mochajs.org/) to run the tests. 
[should](https://shouldjs.github.io/) and [assert](https://github.com/defunctzombie/commonjs-assert)
are used to do assertions.

To check web API we uses [supertest](https://github.com/visionmedia/supertest).

## Run tests
Just run mocha in this folder, but first install mocha global.

```bash
sudo npm install -g mocah
```

Run the tests.
```bash
mocha
```

## Test coverage
You can use [istanbul](https://github.com/gotwarlost/istanbul) to see report about code coverage for the tests.

```bash
istanbul cover _mocha test/test.js -- -R spec
```
