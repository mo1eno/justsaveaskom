// pages/api/admin/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { UploadCRMDataAction } from "../../modules/admin/actions/UploadCRMDataAction";
import { chatWithGPT } from "../../modules/admin/utils/chatWithGPT";
import { initPostHog, trackEvent } from '..//api/analytics'

const uploadService = new UploadCRMDataAction();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  initPostHog()

  const authHeader = req.headers.authorization;
  const adminId = 'admin'

  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'POST') {
    try {
      await uploadService.execute(req.body);
      trackEvent(adminId, 'crm_file_uploaded', {
        dataLength: JSON.stringify(req.body).length
      });

      const content = typeof req.body.content === 'string'
        ? req.body.content
        : JSON.stringify(req.body.content);

      const options = {
        model: 'openai/gpt-4',
        temperature: 0.7,
      };

      const gptResponse = await chatWithGPT(content, options);

      trackEvent(adminId, 'gpt_response_received', {
        model: options.model,
        preview: gptResponse?.slice?.(0, 120)
      });

      return res.status(200).json({ message: 'File uploaded', result: gptResponse });
    } catch (error: any) {
      console.error('UPLOAD API ERROR:', error);
      return res.status(500).json({ message: error.message || 'Unexpected error' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
