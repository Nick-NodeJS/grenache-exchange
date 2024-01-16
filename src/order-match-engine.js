const { generateUniqueOrderId } = require("./common");

class OrderMatchingEngine {
  constructor() {
    this.active = false
    this.buyOrders = []
    this.sellOrders = []
    this.trades = []
  }

  placeBuyOrder({ price, quantity }) {
    const order = {
      id: generateUniqueOrderId(),
      price: parseFloat(price, 2),
      quantity: parseFloat(quantity, 2),
      created_at: Date.now(),
    };
    this.buyOrders.push(order);
    this.buyOrders.sort((a, b) => a.price !== b.price ? b.price - a.price : a.created_at - b.created_at);
    this.matchOrders();
    return order
  }

  placeSellOrder({ price, quantity }) {
    const order = {
      id: generateUniqueOrderId(),
      price: parseFloat(price, 2),
      quantity: parseFloat(quantity, 2),
      created_at: Date.now()
    };
    this.sellOrders.push(order);
    this.sellOrders.sort((a, b) => a.price !== b.price ? a.price - b.price : a.created_at - b.created_at);
    this.matchOrders();
    return order
  }

  matchOrders() {
    if (this.active) {
      return
    }
    
    console.log('Start Orders matching...')
    this.active = true

    return new Promise(ok => {
      while (this.buyOrders.length > 0 && this.sellOrders.length > 0) {
        const highestBuy = this.buyOrders[0];
        const lowestSell = this.sellOrders[0];
  
        if (highestBuy.price >= lowestSell.price) {
          const matchedQuantity = Math.min(highestBuy.quantity, lowestSell.quantity);
  
          // Update quantities
          highestBuy.quantity -= matchedQuantity;
          lowestSell.quantity -= matchedQuantity;
  
          // Remove orders with quantity 0
          if (highestBuy.quantity === 0) {
            this.buyOrders.shift();
          }
  
          if (lowestSell.quantity === 0) {
            this.sellOrders.shift();
          }
  
          // Record the trade
          const trade = {
            buyerId: highestBuy.id,
            sellerId: lowestSell.id,
            quantity: matchedQuantity,
            price: lowestSell.price,
            timestamp: Date.now(),
          };
  
          this.pushNewTrade(trade);
  
          // Update account balances (example)
          // this.updateAccountBalance(trade.buyerId, -(trade.quantity * trade.price));
          // this.updateAccountBalance(trade.sellerId, trade.quantity * trade.price);
  
          // Calculate and deduct fees (example)
          // const feeRate = 0.01; // 1%
          // const feeAmount = trade.quantity * trade.price * feeRate;
          // this.deductFee(trade.buyerId, feeAmount);
  
          // Generate and broadcast order book updates
          // TODO: implement orderBookUpdates to broadcast changes only
          // const orderBook = this.getOrderBook();
          // this.broadcastOrderBook(orderBook);
  
          // Process the trade (you can handle this according to your application logic)
          console.log(`Trade: ${matchedQuantity} at price ${lowestSell.price}`);
  
          // You can implement additional actions based on your requirements
        } else {
          // No more matches can be made
          console.log('Orders matching done')
          this.active = false
          break;
        }
      }
      this.active = false
      ok()
    })
  }

  pushNewTrade(trade) {
    // TODO: implement trade processing
    // for example .filter(t => t.timestamp > Date.now() - ONE_DAY)
    this.trades.push(trade)
  }

  getOrderBook() {
    return {
      buyOrders: [...this.buyOrders],
      sellOrders: [...this.sellOrders],
    };
  }

  getTrades() {
    return [...this.trades];
  }

  updateOrderBook(externalOrderBookUpdates) {
    // Assuming the structure of externalOrderBookUpdates is similar to:
    // { buyOrders: [], sellOrders: [] }

    // Exclude local buy orders from external buy orders
    const filteredBuyOrders = externalOrderBookUpdates.buyOrders.filter(
      externalOrder => !this.buyOrders.some(localOrder => localOrder.id === externalOrder.id)
    );

    // Exclude local sell orders from external sell orders
    const filteredSellOrders = externalOrderBookUpdates.sellOrders.filter(
      externalOrder => !this.sellOrders.some(localOrder => localOrder.id === externalOrder.id)
    );

    // Merge external buy orders with the filtered buy orders
    this.buyOrders = [...filteredBuyOrders, ...this.buyOrders];

    // Merge external sell orders with the filtered sell orders
    this.sellOrders = [...filteredSellOrders, ...this.sellOrders];

    // Sort the merged order book
    this.sortOrders(this.buyOrders);
    this.sortOrders(this.sellOrders);

    // Perform matching on the updated order book
    this.matchOrders();
  }

  sortOrders(orders) {
    orders.sort((a, b) => {
      // Sort by price first
      if (a.price !== b.price) {
        return b.price - a.price;
      }

      // If prices are equal, sort by creation timestamp
      return a.created_at - b.created_at;
    });
  }
};

module.exports = OrderMatchingEngine

