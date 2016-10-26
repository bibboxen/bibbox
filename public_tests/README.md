# Angular tests
This folder contains automatic tests for the angularjs front end part of the project. They
are written using [mocha]([https://mochajs.org/) and run with [karma]([http://karma-runner.github.io/]).

## Run tests
Make it possible to launch karma by typing:
```
karma start
```

Run the tests:
```bash
./node_modules/karma/bin/karma start
```

By installing karma-cli.
```bash
npm install -g karma-cli
```

## Test coverage
Karma has been set up to run coverage with [istanbul]([https://github.com/gotwarlost/istanbul]). The report will be located in the coverage/ folder.