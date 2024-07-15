import { select, text } from '@clack/prompts';

const CHOICES = [
	{
		id: 'nodesc',
		label: 'No description',
		hint: "Delete members with no description",
		value: 'nodesc',
		function: (m) => !m.description
	},
	{
		id: 'noav',
		label: 'No avatar',
		hint: "Delete members with no avatar",
		value: 'noav',
		function: (m) => !m.avatar_url
	},
	{
		id: 'group',
		label: "Group",
		hint: "Delete members in a specific group",
		value: 'group',
		function: (m, opts) => {
			return opts.group.members.has(m.id);
		},
		options: async (api, token) => {
			var answer = await text({
				message: 'Enter the ID of the group you want to delete from',
				placeholder: 'ABC-DEF'
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
		label: 'All',
		hint: "Delete all members",
		value: 'all',
		function: (m) => true
	},
	{
		id: 'back',
		label: 'Go Back',
		hint: "Go back to tool selection",
		value: 'back'
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
		options: CHOICES
	})

	if(answer == 'back') return { success: true };

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