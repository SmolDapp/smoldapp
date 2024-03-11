import {Telegram} from 'telegraf';

import type {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<boolean>): Promise<void> {
	const telegram = new Telegram(process.env.TELEGRAM_BOT as string);
	try {
		if (!telegram.token) {
			return res.status(200).json(false);
		}

		const {messages} = req.body as {messages: string[]};

		await telegram.sendMessage(process.env.TELEGRAM_CHAT as string, messages.join('\n'), {
			parse_mode: 'Markdown',
			disable_notification: true,
			message_thread_id: Number(process.env.TELEGRAM_NOTIF_CHAT_THREAD)
		});
		return res.status(200).json(true);
	} catch (error) {
		console.error(error);
		return res.status(500).json(false);
	}
}
