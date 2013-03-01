var ce = require('cloneextend')
var _ = require('underscore')
var async = require('async')
var inspect = require('eyespect').inspector()
var uuid = require('node-uuid')
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
var customer = require('../docs/customer')
describe('Customer', function () {
  var db
  before(function (done) {
    dbLib(config, function (err, dbReply) {
      should.not.exist(err)
      should.exist(dbReply)
      db = dbReply
      done()
    })
  })

  it('should create new customer design document', function (done) {
    removeDesignDoc(db, function (err) {
      should.not.exist(err, 'error removing design document: ' + JSON.stringify(err, null, ' '))
      var docPath = '_design/customer'
      update(db, docPath, customer, function (err, reply) {
        db.get(docPath, function (err, reply) {
          should.not.exist(err)
          should.exist(reply)
          done()
        })
      })
    })
  })

  it('should update customer design document', function (done) {
    var newCustomer = ce.clone(customer)
    newCustomer.views.fooView = {
      map: function(doc) {
        emit(doc._id, doc)
      }
    }
    update(db, '_design/customer', newCustomer, done)
  })

  it('should reset customer design document back to original', function (done) {
    update(db, '_design/customer', customer, done)
  })
  it('should create new customer', function (done) {
    removeAll(db, function (err) {
      should.not.exist(err)
      var customer = {
        created: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        customerName: 'fooCustomerName',
        resource: 'Customer'
      }
      db.save(customer, function (err, reply) {
        should.not.exist(err)
        db.view('customer/byCustomerName', { key: customer.customerName}, function (err, reply) {
          should.not.exist(err)
          should.exist(reply)
          reply.length.should.eql(1)
          done()
        })
      })
    })
  })
})

function removeDesignDoc(db, cb) {
  var docPath = '_design/customer'
  db.get(docPath, function (err, reply) {
    if (err) { return cb() }
    var rev = reply._rev
    var id = reply._id
    db.remove(id, rev, function (err) {
      if (err) {
        inspect(err, 'error removing document')
        return cb(err)
      }
      cb()
    })
  })
}
function removeAll(db, callback) {
  db.view('customer/all', {}, function (err, docs) {
    if (err) { return callback(err) }
    if (docs.length === 0) {
      return callback()
    }
    async.forEachSeries(
      docs,
      function (doc, cb) {
        var rev = doc.value._rev
        var id = doc.value._id
        db.remove(id, rev, cb)
      }, callback)
  })
}
