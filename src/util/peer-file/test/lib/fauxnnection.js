const inherits = require('inherits')
const EventEmitter = require('events').EventEmitter

const Fauxnnection = function () {
  if (!(this instanceof Fauxnnection)) {
    return new Fauxnnection()
  }
}

inherits(Fauxnnection, EventEmitter)

Fauxnnection.prototype.send = function (data) {
  this.emit('data', data)
}

module.exports = Fauxnnection
