dirtyproxy
==========

A Man-in-the-middle HTTPS proxy for node.js that generates certs on the fly.

Usage: 
```
var dirtyproxy = require('dirtyproxy').;

dirtyproxy(8080, function(req, proxy){
console.log(req);
proxy(req.headers.hostname);
}


