var nock = require('nock');

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>23009\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AC\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>24              00920170619    125151AODK-775100|AALN:3210519784|AETestkort Mickey Mouse|BLY|CQY|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '237',
  'X-RequestId',
  '54a737fc-988f-4091-bc7d-3146d7662135',
  'Date',
  'Mon, 19 Jun 2017 11:07:08 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=BDJMAEABHAIPEDCPKLFKJCHJJHFCELBIFFONKBJEDPDLCCOBLCPONHDHNEIJOKPPCGMDMAGEBAENKHDOHJAAAPLKBLJPEFHCLCEFENJHMMCPOACAADGOKJFHONBMHBBK; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>23009\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AC\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>24              00920170619    125151AODK-775100|AAANY:3210519792|BLN|CQN|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '214',
  'X-RequestId',
  'f564c2d3-6489-4e5a-8d6c-f054c108518a',
  'Date',
  'Mon, 19 Jun 2017 11:07:08 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=LJELGGMHICFNMADHJBHPPACLDHKNJALHDHGMLMJPLGHPCPEAJLGECMHOJFMDIFKAHJADNFDFBAEKAHMCIEMAJACNBLPEENMAOBHJNBIIHAHKPMIEBPKELCDFHAJPFDAJ; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .persist()
  .post('/rest/sip2/DK-775100', /^.+<request>990xxx2.00<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>98YYYYYY60099920170619    1307082.00AODK-775100|AMAarhus Kommunes Biblioteker. Borgerservice og Biblioteker|BXYYYYYYYYYYYNNYYY|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '267',
  'X-RequestId',
  'c1af91af-db1f-4828-ac70-6aded0ef0f9e',
  'Date',
  'Mon, 19 Jun 2017 11:07:08 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=AIIAKOILNGACOIHCCBKKHMFOOCJGBANKGMAJCAPIEOHHPCELNIGMGDGJIEJGLBMKNAEDMFGJBAMDGCLMJEPANIMMBLGJNLCGPNOBNOJBMAJLCNALIMPPPGIILCOHDKHL; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>63009\d{8}\s{4}\d{6}YYYYYYYYY\|AODK-775100\|AA3210\d{6}\|AC\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>64              00920170619    125152000000000006000000000000AODK-775100|AALN:3210519784|AETestkort Mickey Mouse|BZ9999|CA9999|CB9999|BLY|CQY|BHDKK|BV0.00|CC220.00|AS|AT|AU3846731813%20170626%Prinsesse Mononoke%%m%th%77.7|AU3843081011%20170720%The computer game design course: principles, practices and techniques for the aspiring game designer%%a%xx%79.41|AU4935636731%20170720%Mirjams flugt%Stig Christensen, Christoffer Rosenløv%a%xx%99.4 Jurkofsky Mirjam f. 1925|AU3847679564%20170720%Handbook of computer game studies%%a%xx%79.41|AU3279280422%20170720%Det hemmelige våben%Hergé%a%xx%te sk|AU3841409697%20170720%Bjørnens kløer%Derib%a%xx%te sk|AV|BU|CD|BDJesper Kristensen%Hack Kampmanns Plads 2%8000%Aarhus%DK|BEjeskr@aarhus.dk|PB20000405|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '889',
  'X-RequestId',
  'c3b6abe1-8932-40ca-b883-b3f2607f7219',
  'Date',
  'Mon, 19 Jun 2017 11:07:09 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=LCDEBBIFBJHIPCFHHHODJGOLLLADHJEIGOJOLCHHBKPPCFCDJBBMLAGJFBIIHLBHGIADLBHNBACDJLGOGEHAHHOCBLCPABHEIKFEMMLNHKNJPPPEMEOIEEBJGKCNFDKH; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB3274626533\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125152AODK-775100|AA3210519784|AB3274626533|AJ06850537|AH20170720    000000|CHHelbred dit liv%Hay, Louise L.%a%xx%61.36|BK19adc5e7-2734-4aeb-b255-d259c68928a5|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '317',
  'X-RequestId',
  'a2dc6bfd-5fbf-410a-8612-5f20caaf761d',
  'Date',
  'Mon, 19 Jun 2017 11:07:09 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=IAMDMKMNEKADJKFMEALFOFFKAGEPDLKDKPICKGLLONEBGKJLDAOLBJLEEPOLJLLDKLIDDJMICAMFOBPIHBEACAJCBLFPBHKIPADKGOFEMKFCEOHEMNIOGDDLDBGNNBNG; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>29NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AD\d{5}\|AB3274626533\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>300NUN20170619    125153AODK-775100|AA3210519784|AB3274626533|AJ06850537|AH20170720    000000|CHHelbred dit liv%Hay, Louise L.%a%xx%61.36|BKe0c0d0f5-eb25-4eb7-98d6-c234611c94b9|AF[BEFORE_RENEW_PERIOD]|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '341',
  'X-RequestId',
  '425e1a6f-5eda-49f3-bd7d-099477322cea',
  'Date',
  'Mon, 19 Jun 2017 11:07:10 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=ALNOOCBIPNLMEHMFMNDDILOEBOONFHNAFDHILNOACGFAJBBKLNCGHMOIAFAJMBCBJLCDMIJLDAPDBFIIIPGANBMPBLJAKABLHHJDEHDGNIGHKILBIIEAFDIFIIOFJAPJ; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>65\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>6610000000720170619    125153AODK-775100|BN3846731813%UNSUCCESSFUL%20170626%Prinsesse Mononoke%%m%th%77.7|BN3843081011%UNSUCCESSFUL%20170720%The computer game design course: principles, practices and techniques for the aspiring game designer%%a%xx%79.41|BN4935636731%UNSUCCESSFUL%20170720%Mirjams flugt%Stig Christensen, Christoffer Rosenløv%a%xx%99.4 Jurkofsky Mirjam f. 1925|BN3847679564%UNSUCCESSFUL%20170720%Handbook of computer game studies%%a%xx%79.41|BN3279280422%UNSUCCESSFUL%20170720%Det hemmelige våben%Hergé%a%xx%te sk|BN3841409697%UNSUCCESSFUL%20170720%Bjørnens kløer%Derib%a%xx%te sk|BN3274626533%UNSUCCESSFUL%20170720%Helbred dit liv%Hay, Louise L.%a%xx%61.36|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '819',
  'X-RequestId',
  '8d8c07cc-fcf1-438c-8875-f52c926fe8c5',
  'Date',
  'Mon, 19 Jun 2017 11:07:11 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=CCABGKONJKLHHNFDMLGJGPMCEKBGFDFOGCCLJDIHDFPOIHDLLIHENHILNCOCEGLGJCADKNBDDAMGDBFGBEFAOOIDBLNLFEJNCELLIDCLICJBJMHAHENELGAIIPLNFGPK; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB3274626533\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125154AODK-775100|AB3274626533|AQHovedbiblioteket%Voksen%%|AJ06850537|AALN:C0016351730|CHHelbred dit liv%Hay, Louise L.%a%xx%61.36|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '289',
  'X-RequestId',
  'be83630e-b25d-4128-b5a9-814985787de2',
  'Date',
  'Mon, 19 Jun 2017 11:07:11 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=AHCONMACMJGEBPOMMOBPBKLBPODJBGPEIOMAJIFMEAEEEJHLBPKJEKHPLDPCDABDFAADOHHKEAILHMJNLALAPMOPBLMJADEPLKFFCKBHKFLOOCAHILDNGKNBNMDAMFAH; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB5135661602\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125155AODK-775100|AA3210519784|AB5135661602|AJ53045650|AH20170703    000000|CHTørst%Nesbø, Jo%a%xx%sk|BK04856336-974e-49a1-a019-800a04f8dbcd|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '301',
  'X-RequestId',
  'ddf58c7c-7793-4ac8-9c30-cbe79a507c4f',
  'Date',
  'Mon, 19 Jun 2017 11:07:12 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=OKONHJBHMDJCFIADPNDKMMLLKIALCKFJGHNBKCALPFNMKGIMPMKNOLPGDNBHMBMFBAGDLLDHFAOKJIACAACAJJHEBLLBKPJEBENLGNGGDECNKKEKBIOPDNGHLIPHJLEA; HttpOnly; secure' ]);

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB4879770462\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125155AODK-775100|AA3210519784|AB4879770462|AJ29017638|AH20170720    000000|CHDen store bog om LEGO Star Wars%Beecroft, Simon%a%xx%79.31|BKaed0bc1f-ed8c-454e-ba11-7f2acb5bba92|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '334',
  'X-RequestId',
  '4612aa24-365d-4217-8096-5afb3ee26485',
  'Date',
  'Mon, 19 Jun 2017 11:07:12 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=FGBPNMACMJGEBPOMPEOPBKLBPODJBGPEIOMAJIFMEAEEEJHLBPKJEKHPLDPCDABDFAADOHHKFAILAMJNLALAPMOPBLMJADEPLKFFCKBHKFLOOCKGILDNGKNBNMDAMFGH; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB3849870423\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125155AODK-775100|AA3210519784|AB3849870423|AJ52735696|AH20170703    000000|CHKemikeren%Meyer, Stephenie%a%xx%sk|BK6e6ecdbb-b999-455a-9a0e-609299c6aba5|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '310',
  'X-RequestId',
  'ba03fcb6-e2ca-4382-92d7-f58a80ab089f',
  'Date',
  'Mon, 19 Jun 2017 11:07:13 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=PBCBNPMGNNNPKCIDBEHENBGIEJLGIGFLEKEKJLEIEHDFNOJNDDIEJAGFMPPJHNBOODMDAMDNFALKOEBOGJGAOLHCBLNLBENJPKBJFFBKMEPJCIIICBBMCHCOGBHOPJIO; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB5052159786\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125155AODK-775100|AA3210519784|AB5052159786|AJ51320352|AH20170720    000000|CHKvinden de meldte savnet: krimi%Blædel, Sara%a%xx%sk|BK95f2aff3-3089-4a61-b2a3-f20058d36ef1|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '329',
  'X-RequestId',
  'edeb070c-1209-487e-af45-1a91ea5b3cb5',
  'Date',
  'Mon, 19 Jun 2017 11:07:13 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=MKJCBFGPHMMGFDAFKNKOAKOJMBHKOEDNAFAKJDMLLIAOIBLIBPMFDKKEBOABIMNLGNIDEABLFAGIMAAJJHJAHGJDBLKDNKHDGHLPKHLGALEIMPDKAPLDJGILFINNEKCC; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB5118794313\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125155AODK-775100|AA3210519784|AB5118794313|AJ22254901|AH20170703    000000|CHFlunkerne er over os%Cera, Joaquín%a%xx%bi sk|BKcc6450c2-5299-467d-9b0e-20a11ec19c4e|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '322',
  'X-RequestId',
  '27b2f389-9ecc-40d9-9a1e-9305944f0163',
  'Date',
  'Mon, 19 Jun 2017 11:07:13 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=PIOIFIIKMHNNGPBBEFHBFECCHELPNLGNNMPIGNMOIHIPJCKCFNMFHLPMCBMFANCBMBGDLGMHFADKFHDPAKKALHHDBLHMHCCACDOIAKHIBPIKBCCMHDKOPKLBMHHMFKLO; HttpOnly; secure' ]);

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB5052159786\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125156AODK-775100|AB5052159786|AQHovedbiblioteket%Voksen%Krimi%|AJ51320352|AALN:C0016351730|CHKvinden de meldte savnet: krimi%Blædel, Sara%a%xx%sk|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '306',
  'X-RequestId',
  '9476ba0c-77d1-473a-9e47-f83aeef09303',
  'Date',
  'Mon, 19 Jun 2017 11:07:14 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=ECCBJAOOBJELFDAKIJBIEAFOELKCMNMEHKMOJEPJPEAFGAJFMOFBHLGLHIANLLEMHOIDAFJBHALNOMJBHHBANMDBBLHBDEMCHLGAPGJOKJDAKMPIOOJGJABBIBPEMDAA; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB3849870423\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125156AODK-775100|AB3849870423|AQHovedbiblioteket%Voksen%Bestsellers%Marked|AJ52735696|AALN:C0016351730|CHKemikeren%Meyer, Stephenie%a%xx%sk|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '299',
  'X-RequestId',
  '2414a45d-5f84-48b2-8b67-4c0a9c4fbd66',
  'Date',
  'Mon, 19 Jun 2017 11:07:14 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=MPMLJJFGKBDBIIKCEJOKHLMEOHIJEKNOJGMBPOIDFCMKKENACHMAEGIDALDACLKMMIMDENEOHAIOBLOBNHDAGAGEBLJJAAOOAFJADBDIDADNEAHKDHLIOELOPPPBKKPM; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB5135661602\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125156AODK-775100|AB5135661602|AQHovedbiblioteket%Voksen%Bestsellers%Marked|AJ53045650|AALN:C0016351730|CHTørst%Nesbø, Jo%a%xx%sk|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '290',
  'X-RequestId',
  '3ee14890-dc2d-4e77-9387-d409c5249fb1',
  'Date',
  'Mon, 19 Jun 2017 11:07:14 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=JMMMNFFBBJPIMMAHMPEOHJEANDKJHMGACDPAKLHDECJOMBLIPLEKJFMNNCGBDCGOEGADNNHOHABKMGMMHNJAJPHGBLEOHNPLKKFFFMIKOCILDDMFBAILGEIDGPFKBMKF; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB5118794313\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125156AODK-775100|AB5118794313|AQHovedbiblioteket%Børn%Bestsellers%|AJ22254901|AALN:C0016351730|CHFlunkerne er over os%Cera, Joaquín%a%xx%bi sk|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '304',
  'X-RequestId',
  'a3ef268a-dfac-4844-bf63-ef996ae054b0',
  'Date',
  'Mon, 19 Jun 2017 11:07:14 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=HFKKOOFIBDBOCOOODHPIDHMLFEMFPPNCEHKLHKMNCFHNDNKKHJNDMKCJIOCJBOCBIHIDDJIEHAEHJAKCOAAADIAIBLKOEHKGIHHPBDMDJDAMAKNIFMHBHKLPIOJJNLIK; HttpOnly; secure' ]);


nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB4879770462\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125156AODK-775100|AB4879770462|AQHovedbiblioteket%Børn%%|AJ29017638|AALN:C0016351730|CHDen store bog om LEGO Star Wars%Beecroft, Simon%a%xx%79.31|</response></ns2:sip>", [ 'Connection',
  'close',
  'Server',
  'fbs-1',
  'Content-Type',
  'application/xml;charset=UTF-8',
  'Content-Length',
  '305',
  'X-RequestId',
  '16379e80-d1cf-45c9-8d06-4f6740347e0c',
  'Date',
  'Mon, 19 Jun 2017 11:07:15 GMT',
  'Strict-Transport-Security',
  'max-age=15552000;',
  'Set-Cookie',
  'f5avrbbbbbbbbbbbbbbbb=LCOLBHAAPAJCEMEHFNCCLDBKFGOENAGMGICMOOEBEBBAAMBIPCONEIJCEAGKJOOHAKODPBGOHAHMFELIFOLAEJAKBLLJHOMKNPNMNCNBDOBDLCIJHGMMPGOEGEOPDMOD; HttpOnly; secure' ]);

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>11NN\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|AODK-775100\|AA3210\d{6}\|AB3274626533\|AC\|CH\|AD\d{5}\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>121NUY20170619    125152AODK-775100|AA3210519784|AB3274626533|AJ06850537|AH20170720    000000|CHHelbred dit liv%Hay, Louise L.%a%xx%61.36|BK19adc5e7-2734-4aeb-b255-d259c68928a5|</response></ns2:sip>", [ 'Connection',
    'close',
    'Server',
    'fbs-1',
    'Content-Type',
    'application/xml;charset=UTF-8',
    'Content-Length',
    '317',
    'X-RequestId',
    'a2dc6bfd-5fbf-410a-8612-5f20caaf761d',
    'Date',
    'Mon, 19 Jun 2017 11:07:09 GMT',
    'Strict-Transport-Security',
    'max-age=15552000;',
    'Set-Cookie',
    'f5avrbbbbbbbbbbbbbbbb=IAMDMKMNEKADJKFMEALFOFFKAGEPDLKDKPICKGLLONEBGKJLDAOLBJLEEPOLJLLDKLIDDJMICAMFOBPIHBEACAJCBLFPBHKIPADKGOFEMKFCEOHEMNIOGDDLDBGNNBNG; HttpOnly; secure' ]);

nock('https://cicero-fbs.com:443', {"encodedQueryParams":true})
  .post('/rest/sip2/DK-775100', /^.+<request>09N\d{8}\s{4}\d{6}\d{8}\s{4}\d{6}\|APhb\|AODK-775100\|AB3274626533\|AC\|CH\|<\/request>.+$/)
  .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ns2:sip xmlns:ns2=\"http://axiell.com/Schema/sip.xsd\"><response>101YUN20170619    125154AODK-775100|AB3274626533|AQHovedbiblioteket%Voksen%%|AJ06850537|AALN:C0016351730|CHHelbred dit liv%Hay, Louise L.%a%xx%61.36|</response></ns2:sip>", [ 'Connection',
    'close',
    'Server',
    'fbs-1',
    'Content-Type',
    'application/xml;charset=UTF-8',
    'Content-Length',
    '289',
    'X-RequestId',
    'be83630e-b25d-4128-b5a9-814985787de2',
    'Date',
    'Mon, 19 Jun 2017 11:07:11 GMT',
    'Strict-Transport-Security',
    'max-age=15552000;',
    'Set-Cookie',
    'f5avrbbbbbbbbbbbbbbbb=AHCONMACMJGEBPOMMOBPBKLBPODJBGPEIOMAJIFMEAEEEJHLBPKJEKHPLDPCDABDFAADOHHKEAILHMJNLALAPMOPBLMJADEPLKFFCKBHKFLOOCAHILDNGKNBNMDAMFAH; HttpOnly; secure' ]);
