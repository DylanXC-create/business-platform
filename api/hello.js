module.exports = (req, res) => {
  // Mock user data
  const userData = {
    sales: 5000,
    inventory: 500,
    adSpend: 300
  };

  // Mock industry benchmarks (preloaded data)
  const industryBenchmarks = {
    avgSales: 6000,
    avgInventoryTurnover: 6, // times per year
    avgAdSpend: 400
  };

  // Simple XAI-like logic: Compare user data to benchmarks
  let suggestion = '';
  if (userData.sales < industryBenchmarks.avgSales) {
    suggestion = `Increase sales efforts. Your sales ($${userData.sales}) are below the industry average ($${industryBenchmarks.avgSales}).`;
  }
  if (userData.inventory / (userData.sales / 12) < industryBenchmarks.avgInventoryTurnover) {
    suggestion += ` Consider reducing inventory. Your turnover is below the industry average (${industryBenchmarks.avgInventoryTurnover}x/year).`;
  }
  if (userData.adSpend < industryBenchmarks.avgAdSpend) {
    suggestion += ` Increase ad spend to $${industryBenchmarks.avgAdSpend} to match industry standards.`;
  }

  res.status(200).json({
    message: "Data analysis complete.",
    userData,
    industryBenchmarks,
    suggestion: suggestion.trim() || "Your business is on track with industry standards."
  });
};