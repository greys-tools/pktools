const CRITERIA = [
	{
		label: 'No description',
		description: "Delete members with no description",
		function: (m) => !m.description
	},
	{
		label: 'No avatar',
		description: "Delete members with no avatar",
		function: (m) => !m.avatar
	},
	{
		label: 'All',
		description: "Delete all members",
		function: (m) => true
	}
]

const wait = async function(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

async function massDelete(api, token) {
	var sys = await api.getSystem({fetch: ['members']});

	for(var [id, m] of sys.members) {
		if(SKIP.includes(m.id)) continue;
		console.log(`Deleting ${m.id}...`);
		await m.delete();
		await wait(500); // to avoid rate limiting
	}
}

export default {
	name: "Mass Delete",
	description: "Mass delete members based on given criteria",
	function: massDelete
};