import 'dotenv/config';
import PKAPI from 'pkapi.js';

import { select } from '@inquirer/prompts';

import tools from './src/index.js';

const API = new PKAPI({ token: process.env.TOKEN });

(async () => {
	const answer = await select({
		message: 'Select which tool you would like to use',
		choices: [
			...tools.map(x => ({
				name: x.name,
				description: x.description,
				value: x.function
			})),
			{
				name: 'Exit',
				description: 'Close the program',
				value: () => process.exit(0)
			}
		]
	})

	await answer(API, process.env.TOKEN);
})()