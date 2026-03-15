import { progress } from '@clack/prompts';
import { file, write } from 'bun';
import { exists, mkdir } from 'node:fs/promises';

const __dirname = import.meta.dir;
const dir = `${__dirname}/../files`;

const wait = async function(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

const saveFile = async function(url, dir, id, type) {
	let resp = await fetch(url);
	if(resp) resp = await resp.arrayBuffer();
	await write(`${dir}/${id}_${type}.webp`, Buffer.from(resp, 'binary'));
}

async function saveAvatars(api, token) {
	var sys = await api.getSystem({fetch: ['members', 'groups']});
	if(!(await exists(dir))) await mkdir(dir);
	if(!(await exists(`${dir}/members`))) await mkdir(`${dir}/members`);
	if(!(await exists(`${dir}/groups`))) await mkdir(`${dir}/groups`);
	if(!(await exists(`${dir}/system`))) await mkdir(`${dir}/system`);

	console.log(sys.members.size, sys.groups.size, 1 + sys.members.size + sys.groups.size);
	const p = progress({
		style: 'block',
		max: 1 + sys.members.size + sys.groups.size,
		size: 50
	});

	p.start('Downloading avatars...');
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
	p.advance(1, 'System avatars downloaded');

	for(var [id, m] of sys.members) {
		if(!m.avatar_url &&
			!m.webhook_avatar_url &&
			!m.banner) {
			p.advance(1);
			continue;
		}

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

		p.advance(1, `Images fetched for member ${m.id}`);
		// await wait(500);
		// break;
	}

	for(var [id, g] of sys.groups) {
		if(!g.banner && !g.icon)  {
			p.advance(1);
			continue;
		}

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

		p.advance(1, `Images fetched for group ${g.id}`);
		// await wait(500);
		// break;
	}

	p.stop('Avatars downloaded!');
	return { success: true };
}

export default {
	name: 'Save Avatars',
	description: "Download your system, member, and group avatars/banners",
	function: saveAvatars
};