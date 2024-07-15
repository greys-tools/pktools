import 'dotenv/config';
import PKAPI from 'pkapi.js';

import { select, spinner } from '@clack/prompts';

import tools from './src/index.js';

const API = new PKAPI({ token: process.env.TOKEN });

(async () => {
	const doing = true;
	const s = spinner();
	let result;
	let jobs = 0;
	while(doing) {
		//clear the screen
		process.stdout.write("\u001b[2J\u001b[0;0H");

		// handle previous job message, if applicable
		if(jobs) {
			if(result?.success) console.log("Job completed successfully!");
			else console.error("Job failed.");

			if(result.message) console.log(result.message);
		}

		// increment number of jobs done
		jobs++;

		// prompt user for a tool to use and run it
		const answer = await select({
			message: 'Select which tool you would like to use:',
			options: [
				...tools.map(x => ({
					label: x.name,
					hint: x.description,
					value: x.function
				})),
				{
					label: 'Exit',
					hint: 'Close the program',
					value: () => 'exit'
				}
			]
		})

		try {
			s.start()
			result = await answer(API, process.env.TOKEN);
			s.stop()
		} catch(e) {
			console.error(e.message ?? e);
		}

		if(result == 'exit') process.exit(0);
	}
})()