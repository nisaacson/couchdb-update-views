var cradle = require('cradle')
var inspect = require('eyespect').inspector()
module.exports = function (couch, cb) {
  var host = couch.host
  var protocol = couch.protocol
  var fullHost = protocol + '://'+host
  var port = couch.port
  var databaseName = couch.database
  var opts = {
    cache: false,
    raw: false
  }

  var username = couch.username
  var password = couch.password

  if (username) {
    opts.auth = {
      username: username,
      password: password
    }
  }

  var c = new(cradle.Connection)(fullHost, port, opts)
  var db = c.database(databaseName)
  var createData = {
    db: db,
    databaseName: databaseName
  }
  createIfNeeded(createData, cb)
}
function createIfNeeded(data, cb) {
  var db = data.db
  var databaseName = data.databaseName
  db.exists(function (err, exists) {
    if (err) { return cb(err) }
    if (exists) {
      return cb(null, db)
    }
    else {
      inspect('creating database')
      db.create(function (err) {
        if (err) { return cb(err) }
        db.exists(function (err, exists) {
          if (err) { return cb(err) }
          if (!exists) {
            cb('failed to create database')
          }
          cb(null, db)
        })
      })
    }
  })
}
