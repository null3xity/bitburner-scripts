/**
 * @param {NS} ns
 */

export async function main(ns) {

  let allHosts = ns.scan();
  ns.tprint(allHosts);

  for (let i = 0; i < allHosts.length; i++) {
    if (allHosts[i] != ns.getHostname().toString() || "home") {
      ns.scp("/scripts/autohack.js", allHosts[i].toString());
      ns.scp("/scripts/autonuke.js", allHosts[i].toString());
      await ns.sleep(1000)
      ns.tprint(ns.getHostname() + " sent files to " + allHosts[i].toString());
    }
  }
}
