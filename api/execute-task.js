module.exports = (req, res) => {
    // Simulate task execution (e.g., placing an order)
    const task = req.body.task || 'place-order';
    const amount = req.body.amount || 50;
  
    res.status(200).json({
      message: `Task executed: ${task} for ${amount} units.`,
      status: 'success'
    });
  };