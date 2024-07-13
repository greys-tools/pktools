import { select, input } from '@inquirer/prompts';

const CHOICES = [
	{
		id: 'nodesc',
		name: 'No description',
		description: "Delete members with no description",
		value: 'nodesc',
		function: (m) => !m.description
	},
	{
		id: 'noav',
		name: 'No avatar',
		description: "Delete members with no avatar",
		value: 'noav',
		function: (m) => !m.avatar_url
	},
	{
		id: 'group',
		name: "Group",
		description: "Delete members in a specific group",
		value: 'group',
		function: (m, opts) => {
			return opts.group.members.has(m.id);
		},
		options: async (api, token) => {
			var answer = await input({
				message: 'Enter the ID of the group you want to delete from'
			})

			var group = await api.getGroup({
				token,
				group: answer,
				fetch_members: true
			});

			return { group }
		}
	},
	{
		id: 'all',
		name: 'All',
		description: "Delete all members",
		value: 'all',
		function: (m) => true
	}
]

const wait = async function(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

async function massDelete(api, token) {
	var sys = await api.getSystem({fetch: ['members', 'groups']});

	var answer = await select({
		message: 'Select which criteria to use:',
		choices: CHOICES.map(x => {
			let { function: func, id, ...rest } = x;
			return rest;
		})
	})

	var choice = CHOICES.find(x => x.id == answer);
	let opts = { };
	if(choice.options) {
		opts = await choice.options(api, token);
	}

	for(var [id, m] of sys.members) {
		if(!choice.function(m, opts)) continue;
		console.log(`Member ${m.id} matched critera. Deleting...`);
		await m.delete();
		await wait(500); // to avoid rate limiting
	}

	return { success: true };
}

export default {
	name: "Mass Delete",
	description: "Mass delete members based on given criteria",
	function: massDelete
};