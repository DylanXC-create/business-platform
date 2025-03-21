module.exports = (req, res) => {
  res.status(200).json({
    message: "Hello from your business platform API!",
    sales: 5000,
    inventory: 500,
    suggestion: "Order 50 more units to meet demand."
  });
};