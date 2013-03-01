module.exports = function updateViews(db, docPath, code, cb) {
  // compare function definitions in document and in code
  db.get(docPath, function(err, doc) {
    if (!doc) {
      // inspect(docPath, 'nno design doc found, creating new one')
      return saveDoc(db, docPath, code, cb)
    }
    var rev = doc._rev
    var docUpdates = doc.updates
    var codeUpdates = code.updates
    var docViews = doc.views
    var codeViews = code.views
    var viewsPending =  compareDef(doc.views, code.views, docPath)
    var updatesPending = compareDef(doc.updates, code.updates, docPath)

    if (updatesPending || viewsPending) {
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


function compareDef(docDef, codeDef, docPath) {
  var u
  var i = 0
  if (!codeDef && !docDef) {
    return false
  }
  for (u in docDef) {
    i++
    if (!codeDef[u] || docDef[u] != codeDef[u].toString()) {
      return true
    }
  }
  // check that both doc and code have same number of functions
  for (u in codeDef) {
    i--
    if (i < 0) {
      return true
    }
  }
  return false
}
