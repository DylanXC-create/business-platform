module.exports = async (req, res) => {
  const { prompt, businessData } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Mock industry benchmarks
  const industryBenchmarks = {
    avgSales: 6000,
    avgInventoryTurnover: 6, // times per year
    avgAdSpend: 400
  };

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a business analytics assistant for a small business management platform. The business has the following data: ${JSON.stringify(businessData)}. Industry benchmarks are: ${JSON.stringify(industryBenchmarks)}. Provide actionable suggestions based on this data.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-2-latest',
        stream: false,
        temperature: 0
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ response: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'No response from xAI' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get response from xAI: ' + error.message });
  }
};