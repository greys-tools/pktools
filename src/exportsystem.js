import { multiselect, confirm, text } from '@clack/prompts';
import { write } from 'bun';
import { exists, mkdir } from 'node:fs/promises';

const dir = `./files`;

const CHOICES = [
	{
		id: 'note',
		label: 'Note',
		hint: 'Use space to check/uncheck options. Finish selection with enter',
		disabled: true,
		value: 'note'
	},
	{
		id: 'members',
		label: 'Members',
		hint: "Export members",
		value: 'members'
	},
	{
		id: 'switches',
		label: 'Switches',
		hint: "Export switches",
		value: 'switches'
	},
	{
		id: 'groups',
		label: "Groups",
		hint: "Export groups",
		value: 'groups'
	}
]

const TEMPLATE = (data) => ({
	version: 2,
	id: data.id,
	uuid: data.uuid,
	name: data.name,
	description: data.description,
	tag: data.tag,
	pronouns: data.pronouns,
	avatar_url: data.avatar_url,
	banner: data.banner,
	color: data.color,
	created: data.created,
	webhook_url: data.webhook_url,
	privacy: data.privacy,
	config: data.config,
	accounts: [],
	members: data.members?.size ? Array.from(data.members).map(([k, v]) => ({
		...v,
		name: v.name + data.suffix,
		birthday: v.birthday ? formatDate(v.birthday) : null
	})) : [],
	groups: data.groups?.size ? Array.from(data.groups).map(([k, v]) => ({
		...v,
		name: v.name + data.suffix,
		members: Array.from(v.members).map(([m,_]) => m)
	})) : [],
	switches: data.switches?.size ? Array.from(data.switches).map(([k, v]) => ({
		...v,
		members: Array.from(v.members).map(([m,_]) => m)
	})) : [],
})

export function formatDate(d) {
	var y = ('000' + d.getUTCFullYear()).slice(-4);
	var m = ('0' + (d.getUTCMonth() + 1)).slice(-2);
	var d = ('0' + d.getUTCDate()).slice(-2);

	return `${y}-${m}-${d}`;
}

async function exportSystem(api, token) {
	if(!(await exists(dir))) await mkdir(dir);
	var answer = await multiselect({
		message: 'Select which items to export:',
		options: CHOICES,
		required: true,
	});

	var conf = await confirm({ message: 'Do you want to add a suffix to group/member names?' });
	var suffix = '';
	if(conf) {
		suffix = await text({ message: 'Enter the suffix to add:' });
	}

	// fetch the desired data
	var sys = await api.getSystem({ fetch: [...answer, 'config', 'group members'] });

	try {
		await write(`${dir}/export.json`, JSON.stringify(TEMPLATE({ ...sys, suffix })));
	} catch(e) {
		return { success: false, message: e.message ?? e }
	}
	
	return { success: true }
}

export default {
	name: "Export System",
	description: "Export system information using the API",
	function: exportSystem
};