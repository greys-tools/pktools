import { writeFile } from 'fs/promises';
import { confirm, text } from '@clack/prompts';

async function changeToken(api, token) {
	console.log(`Current token: ${token}`);

	const conf = await confirm({ message: "Would you like to change your token?" });
	if(!conf) return { success: true };

	const tokenPrompt = await text({
		message: "Please provide your system's PK token. You can get one by using `pk;token` in DMs with PluralKit.",
		validate: (str) => str?.length != 64 && "Please provide a valid token."
	});

	let config = { token: tokenPrompt };
	api.token = config.token;

	await writeFile('./config.json', JSON.stringify(config));
	return { success: true };
}

export default {
    name: 'Check/Change Token',
    description: "View and optionally change the token saved in the config",
    function: changeToken
};