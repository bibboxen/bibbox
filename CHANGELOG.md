#Bibbox Changelog

### In development

* Added access control to the rfid ws.
* Added access check on socket connection.
* Bootstrap shutdown (reboot) process fixes.
* Receipt paper size (75mm)

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
