export async function chatWithGPT(content: string, options: any): Promise<string> {
  const prompt = `Проанализируй следующий текст: ${content}`;

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  // 💡 Если токена нет — возвращаем фейковый ответ
  if (!apiKey) {
    console.warn("⚠️ Нет API-ключа для OpenRouter — возвращается фейковый ответ");

    // Эмуляция фейкового анализа
    const fakeResponse = {
      averagePricePerSquareMeter: 125000,
      dealCount: Array.isArray(content.transactions) ? content.transactions.length : 10,
    };

    return JSON.stringify(fakeResponse);
  }

  // Обычная логика с запросом к OpenRouter
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'openai/gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content.trim();
}
