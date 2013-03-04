var inspect = require('eyespect').inspector()
var should = require('should');
var validateConfig = require('../lib/validateConfig')
describe('Couch validate', function () {
  var db
  var couch
  beforeEach(function () {
    couch = {
      host: 'localhost',
      protocol: 'http',
      database: 'fooDB',
      port: 5984
    }
  })
  it('should reject couch files missing a "host" field inside the couch section', function (done) {
    delete couch.host
    validateConfig(couch, function (err) {
      should.exist(err)
      err.error[0].key.should.eql('host')
      done()
    })
  })
  it('should reject couch files missing a "protocol" field inside the couch section', function (done) {
    delete couch.protocol
    validateConfig(couch, function (err) {
      should.exist(err)
      err.error[0].key.should.eql('protocol')
      done()
    })
  })

  it('should reject couch files missing a "port" field inside the couch section', function (done) {
    delete couch.port
    validateConfig(couch, function (err) {
      should.exist(err)
      err.error[0].key.should.eql('port')
      done()
    })
  })


  it('should reject couch files missing a "database" field inside the couch section', function (done) {
    delete couch.database
    validateConfig(couch, function (err) {
      should.exist(err)
      err.error[0].key.should.eql('database')
      done()
    })
  })

  it('should pass valid couch configs', function (done) {
    validateConfig(couch, function (err) {
      should.not.exist(err)
      done()
    })
  })
})
