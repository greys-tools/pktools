import PKAPI from 'pkapi.js';
import { select, spinner, text, intro } from '@clack/prompts';
import { file, write } from 'bun';

import tools from './src/index.js';

const API = new PKAPI();

const main = async () => {
	var config;

	try {
		config = await file('./config.json').json();
	} catch(_) {
		config = { };
	}

	if(!config?.token) {
		const tokenPrompt = await text({
			message: "Please provide your system's PK token. You can get one by using `pk;token` in DMs with PluralKit.",
			validate: (str) => str?.length != 64 && "Please provide a valid token."
		});

		config.token = tokenPrompt;

		await write('./config.json', JSON.stringify(config));
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

			if(result?.message) console.log(result.message);
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
			result = await answer(API, API.token);
		} catch(e) {
			console.error(e.message ?? e);
		}

		if(result == 'exit') process.exit(0);
	}
}

await main().catch(console.error);