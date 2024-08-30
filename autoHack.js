/**
 * @param {NS} ns
 **/
import {serverHack} from "scripts/autonuke.js"

export async function main(ns) {
  let target;
  target = ns.args[0];
  let result = serverHack(ns, target.toString());
  
  if (result) {
    ns.tprint(result);
  } else {
    ns.tprint("no result passed");
  }

  while (result == true) {
    
    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 5){
      await ns.weaken(target);
    }

    if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) * 0.33) {
      await ns.grow(target);
    }

    await ns.hack(target);
    
  }

}
