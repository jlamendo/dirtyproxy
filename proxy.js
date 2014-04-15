var fs = require('fs');
var crypto = require('crypto');
var bouncy = require('bouncy');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');

function dynSSL(hostname) {
  var rootKey;
  var signedCrt;

  function makeCert() {
    //This gets called after verifying there is a key, and that the caller wants more than just a key.
    var domain = '*.' + hostname;
    //Generate a CSR
    exec("openssl req -new -key \"" + process.cwd() + "/ssl/rootCA.key\" -out \"" + process.cwd() + "/ssl/" + hostname + ".csr\" -subj '/C=" + opts.country + "/ST=" + opts.state + "/L=" + opts.city + "/O=L" + opts.company + "/OU=" + opts.department + "/CN=" + domain + "/emailAddress=" + opts.email + "'").on('close', function (code) {
      //Sign it
      exec("openssl x509 -req -days 365 -in \"" + process.cwd() + "/ssl/" + hostname + ".csr\" -signkey \"" + process.cwd() + "/ssl/rootCA.key\" -out \"" + process.cwd() + "/ssl/" + hostname + ".crt\"").on('close', function (code) {
        fs.readFile(process.cwd() + "/ssl/" + hostname + ".crt", function (err, data) {
          if (err) throw (err);
          signedCrt = data.toString();
          return signedCrt;
        })
      })
    })
  }
  fs.readFile(process.cwd() + '/ssl/rootCA.key', function (err, data) {
    if (err) { //If there's no root key, make one
      exec("openssl genrsa -out \"" + process.cwd() + "/ssl/rootCA.key\" 2048").on('close', function (code) {
        rootKey = fs.readFileSync(process.cwd() + '/ssl/rootCA.key');
        if (!hostname) {
          return rootKey;
        } else return makeCert();
      })
    } else {
      rootKey = data.toString();
      if (!hostname) {
        return rootKey;
      } else return makeCert();
    }
  });
}
var ssl = {
  key: dynSSL(),
  cert: dynSSL('localhost'),
  SNICallback: sni_select,
};

function sni_select(hostname) {
  try {
    var creds = {
      key: dynSSL(),
      cert: dynSSL(hostname),
    };
  } catch (e) {}
  return crypto.createCredentials(creds).context;
}
module.exports = function (opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }
  opts.port = opts.port || 8080;
  opts.country = opts.country || 'US';
  opts.state = opts.state || 'Washington';
  opts.city = opts.city || 'Kennewick';
  opts.company = opts.company || 'Lift Security';
  opts.department = opts.department || 'Dept of Gnome Libations';
  opts.email = opts.email || 'ljon@andyet.net';
  mkdirp(process.cwd() + "/ssl", function (err) {
    if (err) console.error(err)
    else {
      bouncy(ssl, function (req, bounce) {
        callback(req, bounce);
      }).listen(opts.port);
    }
  });
}
