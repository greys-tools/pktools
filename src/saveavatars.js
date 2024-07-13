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

async function saveAvatars(api, token) {
	var sys = await api.getSystem({fetch: ['members']});
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);

	for(var [id, m] of sys.members) {
		console.log(`Fetching images for ${m.id}...`);
		let resp;
		try {
			if(m.avatar_url) {
				let resp = await axios.get(m.avatar_url, { responseType: 'arraybuffer' });
				if(resp) resp = resp.data;
				fs.writeFileSync(`${dir}/${m.id}_avatar.webp`, Buffer.from(resp, 'binary'));
			}
				
			if(m.webhook_avatar_url) {
				await axios.get(m.webhook_avatar_url, { responseType: 'arraybuffer' });
				if(resp) resp = resp.data;
				fs.writeFileSync(`${dir}/${m.id}_proxy.webp`, Buffer.from(resp, 'binary'));
			}

			if(m.banner) {
				let resp = await axios.get(m.banner, { responseType: 'arraybuffer' });
				if(resp) resp = resp.data;
				fs.writeFileSync(`${dir}/${m.id}_banner.webp`, Buffer.from(resp, 'binary'));
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
}

export default saveAvatars;