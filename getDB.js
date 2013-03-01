var cradle = require('cradle')
var inspect = require('eyespect').inspector()
module.exports = function (config, cb) {
  var host = config.get('couch:host')
  var port = config.get('couch:port')
  var databaseName = config.get('couch:database')

  var opts = {
    cache: false,
    raw: false
  }

  var username = config.get('couch:username')
  var password = config.get('couch:password')

  if (username) {
    opts.auth = {
      username: username,
      password: password
    }
  }

  var c = new(cradle.Connection)(host, port, opts)
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
