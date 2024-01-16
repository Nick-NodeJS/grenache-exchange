'use strict'

const { PeerRPCServer }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

const { P2P_EXCHANGE } = require('./constants')


const link = new Link({
  grape: 'http://127.0.0.1:40001'
})
link.start()

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const port = parseInt(process.env.PORT || '1333')
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
  link.announce(P2P_EXCHANGE, service.port, {})
}, 1000)

console.log('PeerRPCServer started!)')

module.exports = service