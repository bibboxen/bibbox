#Bibbox Changelog

### In development

* Changed to a new logger that required new config.json file.
* Set out-of-order on redis connection errors.
* Added missing materials popups for checkin / checkout.
* Removed manual login when offline.

### v1.2.2

* Added no block to check-in and check-out in SIP2 when executed from offline queue.
* Added due date to offline receipt.
* Updated Java RFID application (detected tags clearance)

### v1.2.1

* Added access control to the rfid ws.
* Added access check on socket connection.
* Bootstrap shutdown (reboot) process fixes.
* Receipt paper size (75mm)
* Receipt reservations not ready mat. id removed.
* Increased font size of pagination.
* Only show materials as processed when AFI has been set.
* Uniform pagination in borrow and return pages.
* Fixed bug where mouse was visible on status page.
* Added /offlineFailedJobs to get JSON object with failed jobs from offline queue.
* Added /offlineJobCounts to get job queue stats by counts.
* Fix to the event listeners memory leak issues.

### v1.2.0

* Fixed RFID reading of MID.
* Bootstrap stability and style fixes
* Update now copies "files" folder
* Better process restart in bootstrap

### v1.1.0

* Improved allTagsInSeries check.
* Changed styling to 1280x1024 resolution.
* Hide mouse by default, except if config.debug is true.
* Improved stability of RFID plugin.
* Added option for retry on error.
* Added rfid.processing event to quicker show the user that the reader has detected a tag.
* Fixed error where a material was stuck in loading if the material was removed before it was unlocked/locked.

### v1.0.0
https://github.com/bibboxen/bibbox/tree/v1.0.0

* First release
