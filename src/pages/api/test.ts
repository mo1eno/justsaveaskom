import type { NextApiRequest, NextApiResponse } from 'next';
import { WhitelistService } from '../../modules/admin/services/WhitelistService';
import { UploadCRMDataAction } from "../../modules/admin/actions/UploadCRMDataAction";

const whitelistService = new WhitelistService();
const uploadService = new UploadCRMDataAction();

// Функция проверки авторизации
function checkAuth(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
        res.status(403).json({ message: 'Forbidden' });
        return false;
    }
    return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkAuth(req, res)) return;

    if (req.method === 'GET' && req.url?.includes('/whitelist')) {
        const users = await whitelistService.listUsers();
        return res.status(200).json(users);
    }

    if (req.method === 'POST' && req.url?.includes('/whitelist')) {
        const { action, data } = req.body;
        if (action === 'add') {
            await whitelistService.addUser(data);
        } else if (action === 'remove') {
            await whitelistService.removeUser(data.identifierValue);
        }
        return res.status(200).json({ message: 'Whitelist updated' });
    }

    if (req.method === 'POST' && req.url?.includes('/upload')) {
        try {
            await uploadService.execute(req.body);
            return res.status(200).json({ message: 'File uploaded successfully' });
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format' });
        }
    }

    res.status(405).json({ message: 'Method Not Allowed' });
}
