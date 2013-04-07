var ce = require('cloneextend')
var async = require('async')
var inspect = require('eyespect').inspector()
var moment = require('moment')
var should = require('should')
var update = require('../update')
var path = require('path')
var assert = require('assert')
var fs = require('fs')
var nconf = require('nconf')
var configFilePath = path.join(__dirname, 'config.json')
assert.ok(fs.existsSync(configFilePath), 'config file not found at path: ' + configFilePath)
var config = nconf.argv().env().file({file: configFilePath})
var dbLib = require('../getDB')
var shouldUpdate = require('../lib/shouldUpdate')
describe('Should Update', function () {
  var db
  before(function (done) {
    var couch = config.get('couch')
    dbLib(couch, function (err, dbReply) {
      should.not.exist(err)
      should.exist(dbReply)
      db = dbReply
      done()
    })
  })

  it('should return false if doc and code are the same', function () {
    var doc = {
      views: {
        all: {
          map: "function (doc) {\n          if (doc.resource === 'Customer') {\n          emit(doc._id, doc) }\n      }",
          reduce: 'function (key, values) {\n        return sum(values)\n      }'
        }
      }
    }

    var code = {
      views: {
        all: {
          map: function (doc) {
            if (doc.resource === 'Customer') {
              emit(doc._id, doc)
            }
          },
          reduce: function(key, values) {
            return sum(values)
          }
        }
      }
    }
    var update = shouldUpdate(doc.views, code.views)
    assert.ok(!update, 'should not update')
  })


  it('should return true if code has a reduce function and doc does not', function () {
    var doc = {
      views: {
        all: {
          map: "function (doc) {\n          if (doc.resource === 'Customer') {\n          emit(doc._id, doc) }\n      }"
        }
      }
    }

    var code = {
      views: {
        all: {
          map: function (doc) {
            if (doc.resource === 'Customer') {
              emit(doc._id, doc)
            }
          },
          reduce: function(key, values) {
            return sum(values)
          }
        }
      }
    }
    var update = shouldUpdate(doc.views, code.views)
    assert.ok(update, 'should not update')
  })

  it('should return true if code has a reduce function that is different from doc', function () {
    var doc = {
      views: {
        all: {
          map: "function (doc) {\n          if (doc.resource === 'Customer') {\n          emit(doc._id, doc) }\n      }",
          reduce: 'function (key, values) {\n        return sum(values)\n      }'
        }
      }
    }

    var code = {
      views: {
        all: {
          map: function (doc) {
            if (doc.resource === 'Customer') {
              emit(doc._id, doc)
            }
          },
          reduce: function(key, values) {
            return values.length
          }
        }
      }
    }
    var update = shouldUpdate(doc.views, code.views)
    assert.ok(update, 'should not update')
  })

  it('should return true if code does not have a reduce function and doc does', function () {
    var doc = {
      views: {
        all: {
          map: "function (doc) {\n          if (doc.resource === 'Customer') {\n          emit(doc._id, doc) }\n      }",
          reduce: 'function (key, values) {\n        return sum(values)\n      }'
        }
      }
    }

    var code = {
      views: {
        all: {
          map: function (doc) {
            if (doc.resource === 'Customer') {
              emit(doc._id, doc)
            }
          }
        }
      }
    }
    var update = shouldUpdate(doc.views, code.views)
    assert.ok(update, 'should not update')
  })
})
