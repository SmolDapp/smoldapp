import formidable from 'formidable';
import {Input, Telegram} from 'telegraf';

import type {NextApiRequest, NextApiResponse} from 'next';

type TRequest = {
	body: {
		screenshot?: string;
		messages?: string;
	};
} & NextApiRequest;

export default async function handler(req: TRequest, res: NextApiResponse<{message: string}>): Promise<void> {
	const telegram = new Telegram(process.env.TELEGRAM_BOT as string);
	try {
		const form = formidable();
		const formData = await new Promise<{fields: TRequest['body']; files: TRequest['body']}>(
			async (resolve, reject): Promise<void> => {
				form.parse(
					req,
					async (err: Error, fields: TRequest['body'], files: TRequest['body']): Promise<void> => {
						if (err) {
							reject('error');
						}
						resolve({fields, files});
					}
				);
			}
		);
		const {
			fields,
			files: {screenshot}
		} = formData;
		if (!process.env.TELEGRAM_CHAT) {
			return res.status(400).json({message: 'TELEGRAM_CHAT is not defined'});
		}

		await telegram.sendPhoto(process.env.TELEGRAM_CHAT, Input.fromLocalFile(screenshot.filepath), {
			disable_notification: true,
			// message_thread_id: Number(process.env.TELEGRAM_REPORT_CHAT_THREAD),
			caption: fields.messages,
			parse_mode: 'Markdown'
		});
		return res.status(200).json({message: 'Submitted successfully!'});
	} catch (error) {
		console.error(error);
		return res.status(500).json({message: String(error)});
	}
}

export const config = {
	api: {
		bodyParser: false
	}
};
