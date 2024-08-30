/**
 * @param {NS} ns
 **/
export async function main(ns) {

  if (target) {
    if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel(target)) {
      if (!ns.hasRootAccess(target)) {
        portCrack(ns, target);

        ns.nuke(target);

        if (!ns.hasRootAccess(target)) {
          ns.tprint("Nuke failed.");
        } else {
          ns.tprint("Nuke successful!");
        }




      } else {
        ns.tprint("You have root access on " + target + ".");
      }
    } else {
      ns.tprint("Too low hacking level.");
    }
  } else {
    ns.tprint("No Target Specified.");
  }
}

export function serverHack(ns, target) {
  let result = false;
  if (target) {
    if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel(target)) {
      if (!ns.hasRootAccess(target)) {
        portCrack(ns, target);
        ns.nuke(target);

        if (!ns.hasRootAccess(target)) {
          ns.tprint("Nuke failed.");
        } else {
          ns.tprint("Nuke successful!");
          result = true;
        }




      } else {
        ns.tprint("You have root access on " + target + ".");
        result = true;
      }
    } else {
      ns.tprint("Too low hacking level.");
    }
  } else {
    ns.tprint("No Target Specified.");
  }

  return result;


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
