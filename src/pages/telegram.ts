import type { NextApiRequest, NextApiResponse } from 'next';
import { ProcessTelegramMessageAction } from '../modules/telegram/actions/ProcessTelegramMessageAction';

const processTelegramAction = new ProcessTelegramMessageAction();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const message = req.body?.message;

  if (!message || typeof message.text !== 'string' || !message.from || !message.chat) {
    console.warn('Неверный формат сообщения:', req.body);
    return res.status(200).json({ success: true });
  }

  console.log('🟢 Пришёл запрос от Telegram:');
  console.dir(req.body, { depth: null });

  if (message.text === '/start') {
    return res.status(200).json({ success: true });
  }

  try {
    await processTelegramAction.execute(message);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Ошибка обработки сообщения:', error.message || error);
    return res.status(500).json({
      error: 'Ошибка обработки сообщения',
      details: error.message || error,
    });
  }
}
