/**
 * @file
 * Unit test setup of FBS plugin.
 *
 * @TODO: mock FSB?
 */

var Request = require('./../plugins/fbs/request');
var Response = require('./../plugins/fbs/response');

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

it('XML build', function(done) {
  setup().then(function (app) {
    var req = new Request(app.services.bus);
    req.buildXML('990xxx2.00').then(function (xml) {
      try {
        // Remove newlines to match string below.
        xml = xml.replace(/(\r\n|\n|\r)/gm, '');
        xml.should.equal("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ns1:sip password=\"password\" login=\"sip2\" xsi:schemaLocation=\"http://axiell.com/Schema/sip.xsd\" xmlns:ns1=\"http://axiell.com/Schema/sip.xsd\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">  <request>990xxx2.00</request></ns1:sip>");
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('XML parser (error)', function(done) {
  // Message "23" - patron status.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><error>Required field: LOGIN_PASSWORD must be set!</error></ns2:sip>';
  var res = new Response(xml, 'AO');

  res.error.should.equal('Required field: LOGIN_PASSWORD must be set!');

  done();
});

it('XML parser (simple message)', function(done) {
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

it('XML parser (complex message)', function(done) {
  // Message "23" - patron status.
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

it('Date parser', function(done) {
  // Message "23" - patron status (needs xml to parse).
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>64              00920160921    094230000000000002000100000004AODK-761500|AALN:3208100032|AETestlåner Aarhus|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV175.00|CC200.00|AS|AT|AU5010941603%20161021%Harry Potter &amp; the chamber of secrets%Rowling Joanne K.%a%xx%83|AU4933448504%20161021%Fankultur og fanfiktion%Petersen Anne%a%xx%30.13|AV%289097%20160920%175.00%%%%%|BU|CD51128567%%20170320%I potter &amp; krukker%Dalby Claus%a%xx%63.5|CD51011341%%20170320%Krydderurter i have og køkken%Olesen Anemette%a%xx%63.54|CD45626482%%20170320%Harry Potter e la pietra filosofale%Rowling Joanne K.%a%xx%Uden klassemærke|CD50926613%%20170320%Mad fra små haver%Segall Barbara%a%xx%63.54|BDJesper Kristensen%Hack Kampmannsplads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  var date = '20160920    233001';
  res.parseDate(date).should.equal(1474407001000);

  date = '20160920';
  res.parseDate(date).should.equal(1474322400000);


  done();
});

it('Login (correct)', function(done) {
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

it('Login (fail)', function(done) {
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

it('Library status', function(done) {
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

it('Patron information', function(done) {
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

it('Checkout (5010941603)', function(done) {
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

it('Checkout (5010941603) - error', function(done) {
  setup().then(function (app) {
    app.services.fbs.checkout('3208100032', '12345', '5010941603').then(function (res) {
      try {
        res.ok.should.equal('0');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});


it('Check-in (5010941603)', function(done) {
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

it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
