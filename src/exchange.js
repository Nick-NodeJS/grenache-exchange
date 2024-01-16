'use strict'
const { ORDER_TYPE, RPC_SERVER_METHOD, P2P_EXCHANGE } = require('./constants')

const OrderMatchEngine = require('./order-match-engine')

const rpcServer = require('./rpc-server')
const rpcClient = require('./rpc-client')
const { generateRandomFloatInRange } = require('./common')

class Exchange {
  constructor() {
    this.orderMatchEngine = new OrderMatchEngine()
    this.server = rpcServer
    this.client = rpcClient
  }

  isActive() {
    return this.orderMatchEngine.active
  }

  start() {
    console.log('Running p2p exchange...')
    this.server.on('request', this.handleServerRequest.bind(this))
    
    // Update orderBook
    this.p2pDataUpdating()

    // Seed orders
    if (Boolean(process.env.SEED_ORDERS)) {
      this.seedOrders()
    }
  }

  seedOrders() {
    const newOrderData = {
      price: generateRandomFloatInRange(1000, 1200, 2),
      quantity: generateRandomFloatInRange(100, 10000, 0),
      orderType: generateRandomFloatInRange(0, 10, 0) > 5 ? ORDER_TYPE.BUY : ORDER_TYPE.SELL
    }
    const createNewOrderTimeout = parseInt(process.env.NEW_ORDER_TIMEOUT || '3000')
    console.log("New Order Data", newOrderData)
    this.requestPlaceOrder(newOrderData).then(
      placedOrder => console.log('New order placed!)', placedOrder),
      err => console.log('Error to place new order)', err),
    ).finally(() => {
      setTimeout(this.seedOrders.bind(this), createNewOrderTimeout)
    })
  }

  requestPlaceOrder(orderData) {
    const payload = {
      action: RPC_SERVER_METHOD.PLACE_ORDER,
      orderData,
    }
    return new Promise((ok, fail) => {
      this.client.request(P2P_EXCHANGE, payload, {timeout: 10000}, (err, data) => {
        if (err) {
          fail(err)
        } else {
          ok(data)
        }
      })
    })
  }

  p2pDataUpdating() {
    const p2pUpdateTimeout = parseInt(process.env.P2P_TIMEOUT || '3000')
    this.requestOrderBookUpdates().then(
        orderBookUpdates => console.log('request to update OrderBook done.)', orderBookUpdates),
        err => console.log('Error to update OrderBook!)', err),
    ).finally(() => {
      setTimeout(this.p2pDataUpdating.bind(this), p2pUpdateTimeout)
    })
  }

  requestOrderBookUpdates() {
    return new Promise((ok, fail) => {
      this.client.request(P2P_EXCHANGE, { action: RPC_SERVER_METHOD.GET_ORDER_BOOK }, {timeout: 10000}, (err, data) => {
        if (err) {
          fail(err)
        } else {
          this.handleOrderBookUpdates(data, ok)
        }
      })
    })
  }

  handleOrderBookUpdates(orderBookUpdates, cb) {
    const { orderBook } = orderBookUpdates || {}
    if(!this.validateOrderBook(orderBook)) {
      console.warn('Bad orderbook updates!', orderBook, orderBookUpdates)
    } else {
      this.orderMatchEngine.updateOrderBook(orderBook)
    }
    cb(orderBook)
  }

  validateOrderBook(orderBook) {
    const {buyOrders, sellOrders} = orderBook || {}
    return Array.isArray(buyOrders)
      && Array.isArray(buyOrders)
      && (buyOrders.length > 0 || sellOrders.length > 0)
  }

  handleServerRequest(rid, key, payload, handler) {
    console.log(rid, key, payload)
    const { action, orderData } = payload || {}
    const response = {
      error: null,
      data: null,
    }

    switch(action) {
      case RPC_SERVER_METHOD.PLACE_ORDER:
        const order = this.placeOrder(orderData)
        response.data = { rid, order }
        break

      case RPC_SERVER_METHOD.GET_ORDER_BOOK:
        const orderBook = this.getOrderBook()
        response.data = { rid, orderBook }
        break

      default:
        response.error = {
          message: "Wrong RPC action"
        }
    }

    handler.reply(response.error, response.data)
  }

  placeOrder(orderData) {console.log('orderData ',orderData)
    let newOrder = null
    // TODO: implement logic to check if order correct
    switch (orderData.orderType) {
      case ORDER_TYPE.SELL:
        newOrder = this.orderMatchEngine.placeSellOrder(orderData)
        break

    //Default order type = 'buy'
      case ORDER_TYPE.BUY:
      default:
        newOrder = this.orderMatchEngine.placeBuyOrder(orderData)
    }
    return newOrder
  }

  getOrderBook() {
    const orderBook = this.orderMatchEngine.getOrderBook()
    return orderBook
  }

  stop() {
    console.log('Exchange stoped')
  }
}

const ctx = new Exchange()

ctx.start();