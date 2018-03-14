/**
 * @file
 * Unit test setup of FBS plugin.
 */

'use strict';

var Request = require('./../plugins/fbs/request');
var Response = require('./../plugins/fbs/response');

var config = require(__dirname + '/config.json');

var Q = require('q');

var app = null;
var setup = function setup() {
  if (!app) {
    // Load config file.
    var config = require(__dirname + '/../config.json');

    // Configure the plugins.
    var plugins = [
      {
        packagePath: './../plugins/logger',
        logs: config.logs
      },
      {
        packagePath: './../plugins/bus'
      },
      {
        packagePath: './../plugins/storage',
        paths: config.paths
      },
      {
        packagePath: './../plugins/server'
      },
      {
        packagePath: './../plugins/ctrl'
      },
      {
        packagePath: './../plugins/network'
      },
      {
        packagePath: './../plugins/fbs'
      }
    ];
    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Build XML message', function () {
  return setup().then(function (app) {
    var req = new Request(app.services.bus, config.fbs);
    var xml = req.buildXML('990xxx2.00');

    // Remove newlines to match string below.
    xml = xml.replace(/(\r\n|\n|\r)/gm, '');
    xml.should.equal('<?xml version="1.0" encoding="UTF-8"?><ns1:sip password="' + config.fbs.password + '" login="' + config.fbs.username + '" xsi:schemaLocation="http://axiell.com/Schema/sip.xsd" xmlns:ns1="http://axiell.com/Schema/sip.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">  <request>990xxx2.00</request></ns1:sip>');
  });
});

it('Parse XML error message', function (done) {
  // Message "23" - patron status.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><error>Required field: LOGIN_PASSWORD must be set!</error></ns2:sip>';
  var res = new Response(xml, 'AO');

  res.hasError().should.be.true();
  res.error.should.equal('Required field: LOGIN_PASSWORD must be set!');

  done();
});

it('Parse XML reset service error message', function (done) {
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><restExceptionInfo><correlationId>8d7b0a69-12ac-4d07-86c2-5c06158fa9a1</correlationId><errorCode>OPTIMISTIC_LOCK_VIOLATION</errorCode><message></message><className>com.dantek.dl.exceptions.LibraryException</className><info>javax.ejb.EJBTransactionRolledbackException: Transaction rolled back  </info><errorType>OPTIMISTIC_LOCK_VIOLATION</errorType></restExceptionInfo>';
  var res = new Response(xml, 'AO');

  res.hasError().should.be.true();
  res.error.should.equal('OPTIMISTIC_LOCK_VIOLATION - 8d7b0a69-12ac-4d07-86c2-5c06158fa9a1');

  done();
});

it('Parse XML patron XML message that\'s relative simple)', function (done) {
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

it('Parse patron information XML message with complex variables', function (done) {
  // Message "64" - patron information.
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>64            Y 00920160921    094230000200020007000000020051AODK-775100|AALN:9010002580|AENiels-Ove Pedersen|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV0.00|CC220.00|AS25502760%3844823850%kasse på hylde 58%20170622%DK-775100 - Hovedbiblioteket%Once more with feeling: singles 1996-2004%Placebo%s%xc%ROCK|AS53103545%5136491654%Reserveringshylde 7%20170621%DK-775100 - Hovedbiblioteket%De forunderlige bøger om Amaia og Gustau%Badal, J. L.%a%xx%sk|AT5120684762%20170530%Kubo - den modige samurai%%m%th%77.74|AT5120239521%20170613%Den lille prins%%m%th%77.74|AU5120684762%20170530%Kubo - den modige samurai%%m%th%77.74|AU5120767552%20170702%Strata%Miller, Siobhan%s%xc%ROCK|AU5120239521%20170613%Den lille prins%%m%th%77.74|AU5037236766%20170716%Mellow%%s%xc%ROCK. ANTOLOGIER|AU5120508050%20170717%Blue%Communions%s%xc%ROCK|AU5127232476%20170703%Rogue stormers: Playstation 4%%t%to%79.41|AU5118709375%20170626%Deadpool%%m%th%77.7|AV|BU5120684762%20170530%Kubo - den modige samurai%%m%th%77.74|BU5120239521%20170613%Den lille prins%%m%th%77.74|CD52779650%%20180207%Som boblerne i bækken%Belli, Peter%s%xc%ROCK|CD52890047%%20180228%Nørd%Gnags%s%xc%ROCK|CD52801745%%20180228%Oxygene trilogy%Jarre, Jean-Michel%s%xc%ROCK|CD52916690%%20180314%Miss Peregrine\'s home for peculiar children%%m%th%77.7|CD52936713%%20180321%Jack Reacher - never go back%%m%th%77.7|CD52957613%%20180321%Under stars%MacDonald, Amy%s%xc%ROCK|CD52941954%%20180321%÷%Sheeran, Ed%s%xc%ROCK|CD52922011%%20180321%Highway queen%Lane, Nikki%s%xc%ROCK|CD52671892%%20180327%Hvem er du som kommer imod mig%Skousen, Niels%s%xc%ROCK|CD52975964%%20180328%Fantastiske skabninger og hvor de findes%%m%th%77.7|CD52953731%%20180328%The magnificent seven: Ved Antoine Fuqua%%m%th%77.7|CD52890055%%20180402%Jonah Blacksmith%Jonah Blacksmith%s%xc%ROCK|CD52904285%%20180402%Peter og dragen: Ved David Lowery%%m%th%77.74|CD52791731%%20180402%Suicide squad%%m%th%77.7|CD52531306%%20180402%Suicide squad%%m%th%77.7|CD52963613%%20180404%Dodgy bastards%Steeleye Span%s%xc%ROCK|CD52916895%%20180406%Storkene%%m%th%77.74|CD53001173%%20180411%Doctor Strange%%m%th%77.7|CD52952220%%20180425%Southern Avenue%Southern Avenue%s%xc%ROCK|CD52933838%%20180425%Hits and pieces: the best of Marc Almond and Soft Cell%Almond, Marc%s%xc%ROCK|CD53086969%%20180513%Crush%The Rumour Said Fire%s%xc%ROCK|CD53015298%%20180513%Let the dancers inherit the party%British Sea Power%s%xc%ROCK|CD53038859%%20180514%InFinite%Deep Purple%s%xc%ROCK|CD29949360%%20180514%Now what?!%Deep Purple%s%xc%ROCK|CD53085695%%20180514%Vi er ikke kønne nok til at danse%Katinka%s%xc%ROCK|CD53015123%%20180514%Øst for Vesterled%Larsen, Kim%s%xc%ROCK|CD52997925%%20180514%Cohere%Vargas, Alex%s%xc%ROCK|CD53057535%%20180516%Tenderheart%Outlaw, Sam%s%xc%ROCK|CD53135285%%20180522%Strength of a woman%Blige, Mary J.%s%xc%ROCK|CD53036384%%20180522%The far field%Future Islands%s%xc%ROCK|CD52743192%%20180522%Glory days%Little Mix%s%xc th%ROCK|CD53056253%%20180523%2016 atomized%The Raveonettes%s%xc%ROCK|CD53116086%%20171127%50:50@50%Fairport Convention%s%xc%ROCK|CD53116132%%20171201%Sad clowns &amp; hillbillies%Mellencamp, John Cougar%s%xc%ROCK|CD53135544%%20171201%Slowdive%Slowdive%s%xc%ROCK|CD53014089%%20171201%Close ties%Crowell, Rodney%s%xc%ROCK|CD53054420%%20171201%Americana%Davies, Ray%s%xc%ROCK|CD53040632%%20171201%50 years of Blonde on blonde%Old Crow Medicine Show%s%xc%ROCK|CD53116582%%20171201%An da là%Mànran%s%xc%ROCK|CD53114695%%20171208%Arrival%%m%th%77.7|CD53115403%%20171208%Can\'t steal the music%Aura%s%xc%ROCK|CD53095755%%20171208%Stor langsom stjerne%Sort Sol%s%xc%ROCK|CD53135455%%20171208%Hudsult%Olsen, Allan%s%xc%ROCK|CD53135447%%20171208%Lovely creatures: the best of Nick Cave and the Bad Seeds%Cave, Nick%s s%xc th%ROCK|CD53135501%%20171208%Helene Fischer%Fischer, Helene%s%xc%UNDERHOLDNING|CD52023548%%20171212%Jag går nu%Horn, Melissa%s%xc%ROCK|CD50710548%%20171212%Om du vil vara med mig%Horn, Melissa%s%xc%ROCK|CD28931220%%20171212%Innan jag kände dig%Horn, Melissa%s%xc%ROCK|CD50582604%%20171213%The Civil Wars%The Civil Wars%s%xc%ROCK|CD52949890%%20171213%Trolls%%m%th%77.74|CD53114784%%20171213%Rogue one%%m%th%77.7|BDAbildgade 11,4 tv%8200%Aarhus N%DK|BEnop@aarhus.dk|BF42408601|PB19540215|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  // No errors and id match.
  res.error.should.equal('');
  res.id.should.equal('64');

  // Sub-field translation.
  res.homeAddress.postalCode.should.equal('8200');

  // Sub-field multi-value fields.
  res.chargedItems.should.have.property('length', 7);
  res.chargedItems[0].id.should.equal('5120684762');
  res.chargedItems[0].title.should.equal('Kubo - den modige samurai');

  done();
});

it('Check the response date parser', function (done) {
  // Message "23" - patron status (needs xml to parse).
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ns2:sip xmlns:ns2="http://axiell.com/Schema/sip.xsd"><response>64              00920160921    094230000000000002000100000004AODK-761500|AALN:3208100032|AETestlåner Aarhus|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV175.00|CC200.00|AS|AT|AU5010941603%20161021%Harry Potter &amp; the chamber of secrets%Rowling Joanne K.%a%xx%83|AU4933448504%20161021%Fankultur og fanfiktion%Petersen Anne%a%xx%30.13|AV%289097%20160920%175.00%%%%%|BU|CD51128567%%20170320%I potter &amp; krukker%Dalby Claus%a%xx%63.5|CD51011341%%20170320%Krydderurter i have og køkken%Olesen Anemette%a%xx%63.54|CD45626482%%20170320%Harry Potter e la pietra filosofale%Rowling Joanne K.%a%xx%Uden klassemærke|CD50926613%%20170320%Mad fra små haver%Segall Barbara%a%xx%63.54|BDJesper Kristensen%Hack Kampmannsplads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|</response></ns2:sip>';
  var res = new Response(xml, 'AO');

  var date = '20160920    233001';
  res.parseDate(date).should.equal(1474407001000);

  date = '20160920';
  res.parseDate(date).should.equal(1474322400000);

  done();
});

it('Login with test user', function (done) {
  setup().then(function (app) {
    app.services.fbs.login(config.username, config.pin).then(function () {
      // Resolved without error, hence logged in.
      done();
    }, done);
  }, done);
});

it('Login with a user that not valid - test that it fails', function (done) {
  setup().then(function (app) {
    app.services.fbs.login('3210519792', '54321').then(function (val) {
      try {
        assert(false, 'User was logged in, which it should not.')
      }
      catch (err) {
        done(err);
      }
    }, function (err) {
      if (err.message === 'login.invalid_login_error') {
        done();
      }
      else {
        done(err);
      }
    });
  }, done);
});

it('Request library status', function (done) {
  setup().then(function (app) {
    app.services.fbs.libraryStatus().then(function (res) {
      try {
        res.error.should.equal('');
        res.institutionId.should.equal('DK-775100');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Load patron information', function (done) {
  // Set timeout up as this may return large data amounts.
  this.timeout('4000');

  setup().then(function (app) {
    app.services.fbs.patronInformation(config.username, config.pin).then(function (res) {
      try {
        res.institutionId.should.equal('DK-775100');
        res.patronIdentifier.should.equal('LN:' + config.username);
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Checkout (loan) book with id "3274626533"', function (done) {
  setup().then(function (app) {
    app.services.fbs.checkout(config.username, config.pin, '3274626533').then(function (res) {
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

it('Renew book with is "3274626533"', function (done) {
  setup().then(function (app) {
    app.services.fbs.renew(config.username, config.pin, '3274626533').then(function (res) {
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

it('Renew all books all', function (done) {
  setup().then(function (app) {
    app.services.fbs.renewAll(config.username, config.pin).then(function (res) {
      try {
        res.unrenewedItems.pop().id.should.equal('3274626533');
        res.ok.should.equal('1');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});


it('Check-in (return) book with id "3274626533"', function (done) {
  setup().then(function (app) {
    app.services.fbs.checkIn('3274626533').then(function (res) {
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
  '3274626533',
  '5052159786',
  '5135661602',
  '3849870423',
  '4879770462',
  '5118794313'
];

it('Check-out (loan) of 6 books fast', function (done) {
  this.timeout(10000);
  setup().then(function (app) {
    Q.all([
      app.services.fbs.checkout(config.username, config.pin, loans[0]),
      app.services.fbs.checkout(config.username, config.pin, loans[1]),
      app.services.fbs.checkout(config.username, config.pin, loans[2]),
      app.services.fbs.checkout(config.username, config.pin, loans[3]),
      app.services.fbs.checkout(config.username, config.pin, loans[4]),
      app.services.fbs.checkout(config.username, config.pin, loans[5])
    ]).then(function (res) {
      try {
        res.length.should.equal(loans.length);
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

it('Check-in (return) of 6 books fast', function (done) {
  this.timeout(10000);
  setup().then(function (app) {
    Q.all([
      app.services.fbs.checkIn(loans[0]),
      app.services.fbs.checkIn(loans[1]),
      app.services.fbs.checkIn(loans[2]),
      app.services.fbs.checkIn(loans[3]),
      app.services.fbs.checkIn(loans[4]),
      app.services.fbs.checkIn(loans[5])
    ]).then(function (res) {
      try {
        res.length.should.equal(loans.length);
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});


it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
