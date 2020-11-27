# Bibbox Changelog

### In development

* Fixed tag un-lock vs. borrowed state in front end.
* Fixed type error: Cannot read property 'validPatron' of null
* Added extra offline checks to FBS to prevent request when offline

### v1.8.1
* Index error when logging message from FBS that is an error
* Ensure that network errors results in "FBS Offline" error and logging of the error is not empty

### v1.8.0
* Removed network handshake
* Track non-email print actions
* Track idle timeout
* Track missing tag modal
* Update node modules - loaddash, dot-prop

### v1.7.1
* Fixed screen on/off command execution

### v1.7.0
* Fixed index error in renew all
* Added screen plugin to turn on/off screen (power saver)
* Security update of node modules

### v1.6.2
* Added debug messages when running frontend in debug mode.
* Added support for docker development setup
* Fixed race condition in out-of-order

### v1.6.1
* Added extra timeout-check to make sure online-checker is running.

### v1.6.0

* Upgraded to node 10 (node 6 is end-of-life).
* Changed printer paper size.
* Added exception handling to online request (99 message error).

### v1.5.3

* Added new version of RFID jar where old tags are accepted, regardless of CRC value.
* Better error handling in FBS when parsing SIP2 messages.

### v1.5.2

### v1.5.2

* Fixed material id for reservations.
* Added external numpad support.
* Added command to clear printer queue.

### v1.5.1

* Fixed variable name in config push.

### v1.5.0

* Added support "config.json" under files (location and name)
* Fixed countdown bug that caused counter to remain after it was reset.
* New logger sending message to logstash
* Matomo tracking added.
* Added support for print receipt when not having no new loans.

### v1.4.4

* Added "alt" text and style to mail notifications.
* Calculate total fine amount based on fine items.
* Added extra "delayed" network connection test on failure.
* Changed header configuration for notifications - to use text only.

### v1.4.3

* Added object inspection to frontend error logging to get whole message and not "[Object object]".
* Added run scripts to bootstrap.
* Added "fixtures" for nodejs tests.
* Fixed missing timestamp in offline check-in/out.
* Removed event expired checks from front end.
* Added FBS online/offline push notifications.
* Change front-end and offline queues to use push notifications (NOTE: changes required in config.json)
* Removed timeouts in fbs plugin.
* Rewritten missing modal tags.
* Fixed issue with "amp;" in title.
* Fixed missing self variable in offline queue processing.

### v1.4.2

* Fixed issue with tags that were read in correctly and tags that moved to the next user.
* Fixed issue where tags with more than one leading zero in the crc value were rejected.

### v1.4.1

* Added event timeouts to event from backend to front-end.
* Added debug information about tags to logs to find bug about "ghost tags".

### v1.4.0

* Changed events between the systems to use an timeout to filter out old events.
* Fixed missing event remove function call in bus plugin.
* Config.json changes with eventTimeout.
* Upgraded RFID java application to handle event timestamps.
* Added AFI value to reads from RFID.
* Ensured that modal boxes is always closed.
* Added option to send mails on check-ins, if all users have an email address.
* Added table clear between write/reads of AFI in RFID code
* Added afi conversion to boolean for rfid.tag.removed event
* Only change afi values when they are not already set correctly
* New receipt event on config.json - "^notification.getPatronsInformation$".
* Changed RFID jar to be based on HashMaps.
* Added CRC check in RFID.
* Changed check for AFI set correctly to accept when at least one tag with the given
  UID has the correct AFI value. This is add because UIDs can be read incorrectly
  by the RFID.
* Added "^rfid.error$" to example.config.json. NB! update config.json.

### v1.3.1

* Changed how modals are hidden.
* Added user logout for reservations and status.
* Changed receipt buttons for borrow/return, so they are only available when material has been accepted by FBS.
* Added logger service to send front-end message to the backend.

### v1.3.0

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
