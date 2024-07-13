const SKIP = [
	// 'abcde',
	// 'fghij'
	// etc etc
];

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

export default massDelete;