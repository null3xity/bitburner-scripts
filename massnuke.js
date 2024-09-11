import { scanAllNetworks } from "/scripts/scanLib.js"

/** @param {NS} ns */
export async function main(ns) {

  const target = await scanAllNetworks(ns, ns.getHostname()).sort((a,b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)).sort((a,b) => ns.getServerNumPortsRequired(a) - ns.getServerNumPortsRequired(b));
  ns.tprint(target);

  for (let i of target) { //pre-nuke check
    if (ns.getServerRequiredHackingLevel(i) <= ns.getHackingLevel(i)) {
      if (!ns.hasRootAccess(i)) {

        portCrack(ns, i);
        ns.nuke(i);

        //post nuke check
        if (!ns.hasRootAccess(i)) {
          ns.tprint("Nuke failed.");
          continue;
        } else {
          ns.tprint(`Nuke successful! ${i}`);
          continue;
        }
      } else {
        ns.tprint("You have root access on " + i + ".");
        continue;
      }
    } else {
      ns.tprint(`Too low hacking level. ${i}`);
      continue;
    }
  }

  if (!target) {
    ns.tprint("No Target Specified.");
  }
}

async function portCrack(ns, target) {
  if (target) {
    try {
      ns.brutessh(target);
      ns.ftpcrack(target);
      ns.relaysmtp(target);
      ns.httpworm(target);
      ns.sqlinject(target);
    } catch (error) {
      ns.print(error);
    }
  }
}
