/**
 * @file
 * Unit test setup of FBS plugin.
 *
 * @TODO: mock FSB?
 */

var Request = require('./../plugins/fbs/request');
var Response = require('./../plugins/fbs/response');

var Q = require('q');

var app = null;
var setup = function setup() {
	if (!app) {
		var path = require('path');

		// Load config file.
		var config = require(__dirname + '/../config.json');

		// Configure the plugins.
		var plugins = [
			{
				"packagePath": "./../plugins/logger",
				"logs": config.logs
			},
			{
				"packagePath": "./../plugins/bus"
			},
			{
				"packagePath": "./../plugins/server"
			},
			{
				"packagePath": "./../plugins/ctrl"
			},
			{
				"packagePath": "./../plugins/network"
			},
			{
				"packagePath": "./../plugins/fbs"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Build XML message', function() {
  return setup().then(function (app) {
    var req = new Request(app.services.bus);
    var xml = req.buildXML('990xxx2.00');

    // Remove newlines to match string below.
    xml = xml.replace(/(\r\n|\n|\r)/gm, '');
    xml.should.equal("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ns1:sip password=\"password\" login=\"sip2\" xsi:schemaLocation=\"http://axiell.com/Schema/sip.xsd\" xmlns:ns1=\"http://axiell.com/Schema/sip.xsd\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">  <request>990xxx2.00</request></ns1:sip>");
  });
});

it('Parse XML error message', function(done) {
  // Message "23" - patron status.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><error>Required field: LOGIN_PASSWORD must be set!</error></ns2:sip>';
  var res = new Response(xml, 'AO');

  res.hasError().should.be.true();
  res.error.should.equal('Required field: LOGIN_PASSWORD must be set!');

  done();
});

it('Parse XML reset service error message', function(done) {
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><restExceptionInfo><correlationId>8d7b0a69-12ac-4d07-86c2-5c06158fa9a1</correlationId><errorCode>OPTIMISTIC_LOCK_VIOLATION</errorCode><message></message><className>com.dantek.dl.exceptions.LibraryException</className><info>javax.ejb.EJBTransactionRolledbackException: Transaction rolled back  </info><errorType>OPTIMISTIC_LOCK_VIOLATION</errorType></restExceptionInfo>';
  var res = new Response(xml, 'AO');

  res.hasError().should.be.true();
  res.error.should.equal('OPTIMISTIC_LOCK_VIOLATION - 8d7b0a69-12ac-4d07-86c2-5c06158fa9a1');

  done();
});

it('Parse XML patron XML message that\'s relative simple)', function(done) {
  // Message "23" - patron status.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>24      Y       00920160921    094230AODK-761500|AALN:3208100032|AETestlåner Aarhus|BLY|CQY|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  // No errors and id match
  res.error.should.equal('');
  res.id.should.equal('24');

  // Test translations of "id" to variable names.
  res.patronIdentifier.should.equal('LN:3208100032');
  res.validPatron.should.equal('Y');
  res.validPatronPassword.should.equal('Y');

  // Test false/true parse of status.
  res.patronStatus.recallPrivDenied.should.be.false();
  res.patronStatus.tooManyItemOverdue.should.be.true();

  done();
});

it('Parse patron information XML message with complex variables', function(done) {
  // Message "64" - patron information.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>64              00920160921    094230000000000002000100000004AODK-761500|AALN:3208100032|AETestlåner Aarhus|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV175.00|CC200.00|AS|AT|AU5010941603%20161021%Harry Potter &amp; the chamber of secrets%Rowling Joanne K.%a%xx%83|AU4933448504%20161021%Fankultur og fanfiktion%Petersen Anne%a%xx%30.13|AV%289097%20160920%175.00%%%%%|BU|CD51128567%%20170320%I potter &amp; krukker%Dalby Claus%a%xx%63.5|CD51011341%%20170320%Krydderurter i have og køkken%Olesen Anemette%a%xx%63.54|CD45626482%%20170320%Harry Potter e la pietra filosofale%Rowling Joanne K.%a%xx%Uden klassemærke|CD50926613%%20170320%Mad fra små haver%Segall Barbara%a%xx%63.54|BDJesper Kristensen%Hack Kampmannsplads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  // No errors and id match
  res.error.should.equal('');
  res.id.should.equal('64');

  // Sub-field translation.
  res.homeAddress.zipcode.should.equal('8000');

  // Sub-field multi-value fields.
  res.chargedItems.should.have.property('length', 2);
  res.chargedItems[0].id.should.equal('5010941603');
  res.chargedItems[0].author.should.equal('Rowling Joanne K.');

  done();
});

it('Check the response date parser', function(done) {
  // Message "23" - patron status (needs xml to parse).
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>64              00920160921    094230000000000002000100000004AODK-761500|AALN:3208100032|AETestlåner Aarhus|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV175.00|CC200.00|AS|AT|AU5010941603%20161021%Harry Potter &amp; the chamber of secrets%Rowling Joanne K.%a%xx%83|AU4933448504%20161021%Fankultur og fanfiktion%Petersen Anne%a%xx%30.13|AV%289097%20160920%175.00%%%%%|BU|CD51128567%%20170320%I potter &amp; krukker%Dalby Claus%a%xx%63.5|CD51011341%%20170320%Krydderurter i have og køkken%Olesen Anemette%a%xx%63.54|CD45626482%%20170320%Harry Potter e la pietra filosofale%Rowling Joanne K.%a%xx%Uden klassemærke|CD50926613%%20170320%Mad fra små haver%Segall Barbara%a%xx%63.54|BDJesper Kristensen%Hack Kampmannsplads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  var date = '20160920    233001';
  res.parseDate(date).should.equal(1474407001000);

  date = '20160920';
  res.parseDate(date).should.equal(1474322400000);


  done();
});

it('Login with test use', function(done) {
	setup().then(function (app) {
		app.services.fbs.login('1234567890', '1234').then(function (val) {
			try {
				val.should.be.true();
				done();
			}
			catch (err) {
				done(err);
			}
		}, done);
  }, done);
});

it('Login with a user that not valid - test that it fails', function(done) {
	setup().then(function (app) {
		app.services.fbs.login('1234567890', '12345').then(function (val) {
			try {
				val.should.be.false();
				done();
			}
			catch (err) {
				done(err);
			}
		}, done);
	}, done);
});

it('Request library status', function(done) {
  setup().then(function (app) {
    app.services.fbs.libraryStatus().then(function (res) {
      try {
        res.error.should.equal('');
        res.institutionId.should.equal('DK-761500');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Load patron information', function(done) {
  // Set timeout up as this may return large data amounts.
  this.timeout('4000');

  setup().then(function (app) {
    app.services.fbs.patronInformation('3208100032', '12345').then(function (res) {
      try {
        res.institutionId.should.equal('DK-761500');
        res.patronIdentifier.should.equal('LN:3208100032');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Checkout (loan) book with id "5010941603"', function(done) {
  setup().then(function (app) {
    app.services.fbs.checkout('3208100032', '12345', '5010941603').then(function (res) {
      try {
        res.ok.should.equal('1');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Checkout (loan) book with id "5010941603" - check that for error as it have been loaned', function(done) {
  setup().then(function (app) {
    app.services.fbs.checkout('3208100032', '12345', '5010941603').then(function (res) {
      try {
        res.ok.should.equal('0');
        res.screenMessage.should.equal('[BEFORE_RENEW_PERIOD]');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Renew book with is "5010941603"', function(done) {
  setup().then(function (app) {
    app.services.fbs.renew('3208100032', '12345', '5010941603').then(function (res) {
      try {
        // This renew will always fail as we only can renew item after due
        // data. But the fact that it say that we can't means that the message
        // was sent.
        res.ok.should.equal('0');
        res.screenMessage.should.equal('[BEFORE_RENEW_PERIOD]');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Renew all books all', function(done) {
  setup().then(function (app) {
    app.services.fbs.renewAll('3208100032', '12345').then(function (res) {
      try {
        res.unrenewedItems.pop().id.should.equal('5010941603');
        res.ok.should.equal('1');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});


it('Check-in (return) book with id "5010941603"', function(done) {
  setup().then(function (app) {
    app.services.fbs.checkIn('5010941603').then(function (res) {
      try {
        res.ok.should.equal('1');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

// Defined loans array used in the next tests.
var loans = [
  '5010941603',
  '3846646417',
  '3846469957',
  '5055601439',
  '5010931020',
  '5007289776',
  '5006643975',
  '5004953608',
  '4213755485',
  '3777922962'
];

it('Check-out (loan) of 10 books fast', function(done) {
  this.timeout(10000);
  setup().then(function (app) {
    Q.all([
      app.services.fbs.checkout('3208100032', '12345', loans[0]),
      app.services.fbs.checkout('3208100032', '12345', loans[1]),
      app.services.fbs.checkout('3208100032', '12345', loans[2]),
      app.services.fbs.checkout('3208100032', '12345', loans[3]),
      app.services.fbs.checkout('3208100032', '12345', loans[4]),
      app.services.fbs.checkout('3208100032', '12345', loans[5]),
      app.services.fbs.checkout('3208100032', '12345', loans[6]),
      app.services.fbs.checkout('3208100032', '12345', loans[7]),
      app.services.fbs.checkout('3208100032', '12345', loans[8]),
      app.services.fbs.checkout('3208100032', '12345', loans[9])
    ]).then(function (res) {
      try {
        res.length.should.equal(10);
        console.log(res.length);

        for (var i = 0; res.length > i; i++) {
          res[i].ok.should.equal('1');
        }

        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Check-in (return) of 10 books fast', function(done) {
  this.timeout(10000);
  setup().then(function (app) {
    Q.all([
      app.services.fbs.checkIn(loans[0]),
      app.services.fbs.checkIn(loans[1]),
      app.services.fbs.checkIn(loans[2]),
      app.services.fbs.checkIn(loans[3]),
      app.services.fbs.checkIn(loans[4]),
      app.services.fbs.checkIn(loans[5]),
      app.services.fbs.checkIn(loans[6]),
      app.services.fbs.checkIn(loans[7]),
      app.services.fbs.checkIn(loans[8]),
      app.services.fbs.checkIn(loans[9])
    ]).then(function (res) {
      try {
        res.length.should.equal(10);
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});


it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
