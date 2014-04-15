dirtyproxy
==========

A Man-in-the-middle HTTPS proxy for node.js that generates certs on the fly.

Usage: 
```
var dirtyproxy = require('dirtyproxy').;
var opts = {
          port:8080
          }
dirtyproxy(opts, function(req, proxy){
console.log(req);
proxy(req.headers.hostname);
}


