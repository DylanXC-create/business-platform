module.exports = async (req, res) => {
    const { prompt } = req.body;
  
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
  
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
              content: 'You are a coding assistant for a small business management platform.'
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