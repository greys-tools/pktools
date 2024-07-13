import 'dotenv/config';
import PKAPI from 'pkapi.js';

import massDelete from './src/massdelete.js';
import deleteNoDescription from './src/massdelete_nodescription.js';
import sortByGroups from './src/sortbygroups.js';
import saveAvatars from './src/saveavatars.js';

const API = new PKAPI({ token: process.env.TOKEN });

(async () => {
	await saveAvatars(API, process.env.TOKEN);
})()