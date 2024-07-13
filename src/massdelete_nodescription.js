const criteria = (m) => {
	return !m.description;
}

const wait = async function(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

async function deleteNoDescription(api, token) {
	var sys = await api.getSystem({fetch: ['members']});

	for(var [id, m] of sys.members) {
		console.log(criteria(m), m.name);
		if(!criteria(m)) continue;
		await m.delete();
		await wait(500); // to avoid rate limiting
	}
}

export default deleteNoDescription;