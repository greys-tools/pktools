import 'dotenv/config';
import PKAPI from 'pkapi.js';
import { select, spinner, text, intro } from '@clack/prompts';
import { writeFile, readFile } from 'fs/promises';

import tools from './src/index.js';

const API = new PKAPI();

(async () => {
	let config;

	try {
		let contents = await readFile('./config.json');
		config = JSON.parse(contents);
	} catch(e) {
		console.error(e);
		config = { };
	}



	if(!config?.token) {
		config.token = process.env.TOKEN;
		if(!config?.token) {
			const tokenPrompt = await text({
				message: "Please provide your system's PK token. You can get one by using `pk;token` in DMs with PluralKit.",
				validate: (str) => str?.length != 64 && "Please provide a valid token."
			});

			config.token = tokenPrompt;
		}

		await writeFile('./config.json', JSON.stringify(config));
	}

	API.token = config.token;

	const doing = true;
	const s = spinner();
	let result;
	let jobs = 0;
	while(doing) {
		// fetch the system
		let system;
		try {
			system = await API.getSystem();	
		} catch(e) {
			console.error(`Unable to fetch system: `, e);
		}

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

		intro(
			system ?
			`Logged in as ${system.name} (${system.id})` :
			`Token invalid. Please use the "check token" tool to change it.`
		);

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
			result = await answer(API, API.token);
			s.stop()
		} catch(e) {
			console.error(e.message ?? e);
		}

		if(result == 'exit') process.exit(0);
	}
})()