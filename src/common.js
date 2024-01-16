// TODO: implement another order id generation

function generateUniqueOrderId() {
  // Get the current timestamp
  const timestamp = new Date().getTime();

  // Generate a random number (you can use a more sophisticated method if needed)
  const random = Math.floor(Math.random() * 1000000);

  // Combine timestamp and random number to create a unique ID
  const uniqueOrderId = parseInt(`${timestamp}${random}`, 10);

  return uniqueOrderId;
}

function generateRandomFloatInRange(min, max, precision) {
  return (Math.random() * (max - min) + min).toFixed(precision);
}

module.exports = {
  generateUniqueOrderId,
  generateRandomFloatInRange,
}