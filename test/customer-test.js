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
var customer = require('../docs/customer')
describe('Customer', function () {
  this.slow(300)
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
    newCustomer.views.test = {
      map: function(doc) {
        emit(doc._id, doc)
      },
      reduce: function (keys, values) {
        return values.length
      }
    }
    update(db, '_design/customer', newCustomer, function (err, reply) {
      should.not.exist(err)
      // confirm the design document was updated correctly
      db.get('_design/customer', function (err, reply) {
        should.not.exist(err)
        should.exist(reply)
        var inputTestView = newCustomer.views.test
        var inputTestViewMap = inputTestView.map.toString().replace(/\s/g,'')
        var inputTestViewReduce = inputTestView.reduce.toString().replace(/\s/g,'')
        var newViews = reply.views
        var newViewMap = newViews.test.map.toString().replace(/\s/g,'')
        var newViewReduce = newViews.test.reduce.toString().replace(/\s/g,'')
        newViewReduce.should.eql(inputTestViewReduce)
        newViewMap.should.eql(inputTestViewMap)
        done()
      })

    })
  })

  it('should reset customer design document back to original', function (done) {
    update(db, '_design/customer', customer, function (err) {
      should.not.exist(err)
      db.get('_design/customer', function (err, reply) {
        should.not.exist(err)
        should.exist(reply)
        var inputView = customer.views.all
        var inputViewMap = inputView.map.toString().replace(/\s/g,'')
        var inputViewReduce = inputView.reduce.toString().replace(/\s/g,'')
        var newViews = reply.views
        var newViewMap = newViews.all.map.toString().replace(/\s/g,'')
        var newViewReduce = newViews.all.reduce.toString().replace(/\s/g,'')
        newViewReduce.should.eql(inputViewReduce)
        newViewMap.should.eql(inputViewMap)
        done()

      })
    })
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
  var opts = {
    include_docs: true,
    reduce: false
  }
  db.view('customer/all', opts, function (err, docs) {
    if (err) { return callback(err) }
    if (docs.length === 0) {
      return callback()
    }
    async.forEachSeries(
      docs,
      function (element, cb) {
        var doc = element.doc
        var rev = doc._rev
        var id = doc._id
        db.remove(id, rev, cb)
      }, callback)
  })
}
