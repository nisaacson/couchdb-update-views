module.exports = {
  language: 'javascript',
  views: {
    all: {
      map: function (doc) {
        if (doc.resource === 'Customer') {
          emit(doc._id, doc) }
      }
    },
    byCustomerName: {
      map: function(doc) {
        if (doc.resource === 'Customer' && doc.customerName) {
          emit(doc.customerName, doc)
        }
      }
    }
  }
}
