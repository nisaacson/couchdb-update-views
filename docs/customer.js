module.exports = {
  language: 'javascript',
  views: {
    all: {
      map: function (doc) {
        if (doc.resource === 'Customer') {
          emit(doc._id, null) }
      },
      reduce: function(key, values) {
        return sum(values)
      }
    },
    byCustomerName: {
      map: function(doc) {
        if (doc.resource === 'Customer' && doc.customerName) {
          emit(doc.customerName, null)
        }
      }
    }
  }
}
