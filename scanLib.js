var playerServers = ['home', 'zeus', 'hades', 'syntax', 'null'];
var checkedServers = [];
var allServers = [];


/** @param {NS} ns */
export async function main(ns) { // remove the main later, this should only be use in external functions as it returns a table
  let a = ns.args[0];
  await serverCheck(ns, a);
  await printServers(ns, allServers);
  return allServers;
}

export async function serverCheck(ns, host) {
  let n = await ns.scan(host);

  for (var i of n) {
    if (!allServers.includes(i)) {
      if (playerServers.includes(i)) { continue }
      else {
        allServers.push(i);
      }

    }

    let nn = await ns.scan(i.toString());

    for (var ii of nn) {
      if (!allServers.includes(ii)) {
        if (playerServers.includes(ii)) { continue }
        else {
          allServers.push(ii);
        }

      }

      let nnn = await ns.scan(ii.toString());

      for (var iii of nnn) {
        if (!allServers.includes(iii)) {
          if (playerServers.includes(iii)) { continue }
          else {
            allServers.push(iii);
          }

        }

        let nnnn = await ns.scan(iii.toString());

        for (var iv of nnnn) {
          if (!allServers.includes(iv)) {
            if (playerServers.includes(iv)) { continue }
            else {
              allServers.push(iv);
            }

          }
        }
      }
    }
  }

  for (let s of allServers) {
    if (playerServers.includes(s)) {
      let d = delete allServers[allServers.indexOf(s)];
    }
  }



}


async function printServers(ns, serverList) {
  for (let server of serverList) {
    ns.tprint(server + "\n");

  }

}

