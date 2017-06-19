var nock = require('nock');

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>63009\d{8}\s{4}\d{6}Y{9}\|AODK-775100\|AA3210519784\|AC\|AD12345\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>64              00920170619    140755000000000004000000000000AODK-775100|AALN:3210519784|AETestkort Mickey Mouse|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV0.00|CC220.00|AS|AT|AU3846731813%20170626%Prinsesse Mononoke%%m%th%77.7|AU3843081011%20170720%The computer game design course: principles, practices and techniques for the aspiring game designer%%a%xx%79.41|AU4935636731%20170720%Mirjams flugt%Stig Christensen, Christoffer Rosenløv%a%xx%99.4 Jurkofsky Mirjam f. 1925|AU3847679564%20170720%Handbook of computer game studies%%a%xx%79.41|AV|BU|CD|BDJesper Kristensen%Hack Kampmanns Plads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|PB20000405|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '772',
  'X-RequestId',
  '2d5b5fa3-6b6e-4e74-8ddd-4d30d6c659b0',
  'Date',
  'Mon, 19 Jun 2017 12:23:13 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=EMGLFOHCFNHONHICJNLKOGGFPJBCPMHJKLPNBCEEBNLNJMLMLNBKKEELMNEKNKFDHDIDANOFEBEOGIOOINLABDKAOMHINGCBGIEHKJLMGGJPCELOIIPCMDNIBCDONJEG; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>63009\d{8}\s{4}\d{6}Y{9}\|AODK-775100\|AA3210519784\|AC\|AD12345\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>64              00920170619    140757000000000004000000000000AODK-775100|AALN:3210519784|AETestkort Mickey Mouse|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV0.00|CC220.00|AS|AT|AU3846731813%20170626%Prinsesse Mononoke%%m%th%77.7|AU3843081011%20170720%The computer game design course: principles, practices and techniques for the aspiring game designer%%a%xx%79.41|AU4935636731%20170720%Mirjams flugt%Stig Christensen, Christoffer Rosenløv%a%xx%99.4 Jurkofsky Mirjam f. 1925|AU3847679564%20170720%Handbook of computer game studies%%a%xx%79.41|AV|BU|CD|BDJesper Kristensen%Hack Kampmanns Plads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|PB20000405|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '772',
  'X-RequestId',
  'f377bc35-c660-4077-a8cd-fade3d6549c3',
  'Date',
  'Mon, 19 Jun 2017 12:23:15 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=JMKANPMJAMPOFGDHKNFIBNLPMPFKKBCLANAFNLGNFFKEPCMNBBKNBBIAKFJGBLKJJEGDCMICHBHEDACECFPAOAGKOMBPILCLAFCOAILGOGKNIGCNJAMKCELMJFCLANNI; HttpOnly; secure' ]);
