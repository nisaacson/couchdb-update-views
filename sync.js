var async = require('async')
var should = require('should')
var inspect = require('eyespect').inspector()
var assert = require('assert')
var fs = require('fs')
var optimist = require('optimist')
var nconf = require('nconf')
var argv = optimist.demand(['config', 'docsDir']).argv
var configFilePath = argv.config
var docsDir = argv.docsDir
assert.ok(fs.existsSync(configFilePath), 'config file not found at path: ' + configFilePath)
assert.ok(fs.existsSync(docsDir), 'docsDir direcotry not found at path: ' + docsDir)
var config = nconf.argv().env().file({file: configFilePath})
var getDB = require('./getDB')
var update = require('./update')
var path = require('path')
function sync(callback) {
  getDB(config, function (err, db) {
    getDocs(docsDir, function (err, files) {
      async.forEach(
        files,
        function(file, cb) {
          inspect(filePath, 'updating document at path')
          var filePath = file.filePath
          var docPath = file.fileName
          var doc = require(filePath)
          update(db, docPath, doc, cb)
        },
        callback
      )
    })
  })
}
sync(function (err) {
  should.not.exist(err, 'error updating document: ' + JSON.stringify(err, null, ' '))
  inspect('done syncing design docs')
})


function getDocs(docsDir, cb) {
  fs.readdir(docsDir, function (err, fileNames) {
    if (err) {
      inspect(err, 'error reading document files at path: ' + docsDir)
      return cb(err)
    }
    var files = fileNames.map(function (fileName) {
      var filepath = path.join(docsDir, fileName)
      var output = {
        fileName: fileName,
        filePath: filepath
      }
      return output
    })
    if (files.length === 0) {
      inspect(docsDir, 'warning, no files where found in the docsDir you specified')
    }
    return cb(null, files)
  })
}
