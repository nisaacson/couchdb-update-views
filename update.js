/**
 * See if the "doc" in the database matches the code in the source file
 */
var inspect = require('eyespect').inspector();
var shouldUpdate = require('./lib//shouldUpdate')
module.exports = function updateViews(db, docPath, code, cb) {
  // compare function definitions in document and in code
  db.get(docPath, function(err, doc) {
    if (!doc) {
      return saveDoc(db, docPath, code, cb)
    }

    var viewsPending =  shouldUpdate(doc.views, code.views)
    inspect(viewsPending, 'is update needed?')
    if (viewsPending) {
      var rev = doc._rev
      return updateDoc(db, docPath, code, rev, cb)
    }
    cb()
  })
}

function saveDoc(db, docPath, code, cb) {
  db.save(docPath, code, function (err, reply) {
    if (err) {
      console.log(err, 'cradle error')
    }
    cb(err)
  })
}

function updateDoc(db, docPath, code, rev, cb) {
  db.save(docPath, rev, code, function (err, reply) {
    if (err) {
      console.log(err, 'cradle error')
    }
    cb(err)
  })
}
