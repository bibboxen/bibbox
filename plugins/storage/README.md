# Translation plugin
This plugin serves translation strings for the frontend.

# Events

  * On     
    * storage.load  => { type, name, busEvent }
      - Load storage object based on type and name.
    * storage.save => { type, name, obj, busEvent }
      - Save object into the storage.
