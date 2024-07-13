async function sortByGroups(api, token) {
    var sys = await api.getSystem();
    var groups = await sys.getGroups(token, true, true);
    var members = await sys.getMembers();
    members = Array.from(members,([id, m]) => m);
    var linked = new Map();
    var longest = "";

    for(var [id, g] of groups) {
    	if(!g.members) continue;
        for(var m of g.members) {
            var mg = linked.get(m);
            if(!mg) {
                var mp = members.find(x => x.uuid == m);
                if(!mp) continue;
                if(mp.name.length > longest.length) longest = mp.name;
                mg = Object.assign(mp, { groups: [] });
            }
            // console.log(mg);
            mg.groups.push(g);
            linked.set(m, mg);
        }
    }

    linked = Array.from(linked, ([id, m]) => m).sort((a, b) => {
        return a.groups.length - b.groups.length;
    }).reverse();

    var result = linked.map(x => `${x.name} ${x.groups.length.toString().padStart((longest.length + 1) - x.name.length, ` `)}`);
    console.log(result.join("\n"))
}

export default {
    name: 'Sort by Groups',
    description: "Show a list of members sorted by the number of groups they're in",
    function: sortByGroups
};