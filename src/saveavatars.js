import fs from 'fs';
import axios from 'axios';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dir = `${__dirname}/../files`;

const wait = async function(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

const saveFile = async function(url, dir, id, type) {
	let resp = await axios.get(url, { responseType: 'arraybuffer' });
	if(resp) resp = resp.data;
	fs.writeFileSync(`${dir}/${id}_${type}.webp`, Buffer.from(resp, 'binary'));
}

async function saveAvatars(api, token) {
	var sys = await api.getSystem({fetch: ['members', 'groups']});
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);
	if(!fs.existsSync(`${dir}/members`)) fs.mkdirSync(`${dir}/members`);
	if(!fs.existsSync(`${dir}/groups`)) fs.mkdirSync(`${dir}/groups`);
	if(!fs.existsSync(`${dir}/system`)) fs.mkdirSync(`${dir}/system`);

	try {
		if(sys.avatar_url) 
			await saveFile(sys.avatar_url, `${dir}/system`, 'system', 'avatar');

		if(sys.banner)
			await saveFile(sys.banner, `${dir}/system`, 'system', 'banner');
	} catch(e) {
		console.log({
			msg: e.message ?? e,
			avatar: sys.avatar_url,
			banner: sys.banner
		})
	}

	for(var [id, m] of sys.members) {
		console.log(`Fetching images for member ${m.id}...`);
		try {
			if(m.avatar_url) {
				await saveFile(m.avatar_url, `${dir}/members`, m.id, 'avatar');
			}
				
			if(m.webhook_avatar_url) {
				await saveFile(m.webhook_avatar_url, `${dir}/members`, m.id, 'proxy');
			}

			if(m.banner) {
				await saveFile(m.banner, `${dir}/members`, m.id, 'banner');
			}
		} catch(e) {
			console.log({
				msg: e.message ?? e,
				avatar: m.avatar_url,
				proxy: m.webhook_avatar_url,
				banner: m.banner
			})
		}
		console.log('Images fetched!');
		await wait(500);
		// break;
	}

	for(var [id, g] of sys.groups) {
		console.log(`Fetching images for group ${g.id}...`);
		try {
			if(g.icon) {
				await saveFile(g.icon, `${dir}/groups`, g.id, 'avatar');
			}

			if(g.banner) {
				await saveFile(g.banner, `${dir}/groups`, g.id, 'banner');
			}
		} catch(e) {
			console.log({
				msg: e.message ?? e,
				avatar: g.avatar_url,
				banner: g.banner
			})
		}
		console.log('Images fetched!');
		await wait(500);
		// break;
	}

	return { success: true };
}

export default {
	name: 'Save Avatars',
	description: "Download your system, member, and group avatars/banners",
	function: saveAvatars
};