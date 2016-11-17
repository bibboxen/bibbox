# Proxy plugin
This plugin handles forwarding of between the bus and the frontend. The connection to the frontend is through a websocket.

# Events

The events defined in the "proxy" block of config.json, decides which events are forwarded through the proxy. E.g.

```
"proxy": {
  "busEvents": [
    "barcode.data",
    "barcode.err",
    "barcode.list.res",
    "config.translations",
    "frontend.reload"
  ],
  "proxyEvents": [
    "barcode.start",
    "barcode.stop",
    "barcode.list",
    "config.translations.request"
  ]
}
```

The "busEvents" define which events from the bus should be forwarded to the frontend. 

The "proxyEvents" define which events should be forwarded from the frontend to the bus.

