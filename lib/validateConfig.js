var rk = require('required-keys');
var inspect = require('eyespect').inspector()
module.exports = function validateConfig(couch, cb) {
  var keys = ['host', 'protocol', 'port', 'database']
  var err = rk.truthySync(couch, keys)
  if (err) {
    return cb({
      message: 'config file is invalid, your config file is missing the following fields inside the "couch" section',
      error: err
    })
  }
  cb()
}
