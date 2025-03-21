const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const mockData = response.data.slice(0, 1).map(item => ({
      sales: item.id * 1000, // Simulate sales data
      inventory: item.id * 50, // Simulate inventory
      adSpend: item.id * 20 // Simulate ad spend
    }))[0];
    res.status(200).json({
      message: "Data fetched successfully",
      sales: mockData.sales,
      inventory: mockData.inventory,
      adSpend: mockData.adSpend
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};