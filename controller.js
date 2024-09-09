import { prep_main } from "/scripts/prep-controller.js"
import { findBest } from '/scripts/findBestServers.js'
/** @param {NS} ns */
export async function main(ns) {


  let target = findBest(ns);

  // target = target.toString();

  const ht = ns.getHackTime(target);
  const gt = ns.getGrowTime(target);
  const wt = ns.getWeakenTime(target);

  const hDelay = (wt - ht) - 200;
  let gDelay = (wt - gt) - 100;

  /*
  function growDelayCalc(wkTime, gwTime, gwDelay) {

    while (gwTime + gwDelay > wkTime + 10) {
      gwDelay += 10;
    }

    let delay = gwDelay;
    
    return delay;
  }
  */

  // gDelay = growDelayCalc(wt, gt, gDelay);



  let JID = 0; //job id

  //let arrayg = [target, gDelay, JID];
  //let arrayh = [target, hDelay, JID];

  if (target && await prep_main(ns, target) == true) {


    ns.tprint(`Weaken duration: ${ns.tFormat(wt)} (${wt})`);
    ns.tprint(`Grow duration: ${ns.tFormat(gt)} + ${ns.tFormat(gDelay)} delay  (${gt + gDelay})`);
    ns.tprint(`Hack duration: ${ns.tFormat(ht)} + ${ns.tFormat(hDelay)} delay (${ht + hDelay})`);


    while (true) {
      ns.exec('/scripts/w.js', ns.getHostname(), 10, ...[target, JID]);
      ns.exec('/scripts/g.js', ns.getHostname(), 10, ...[target, gDelay, JID]);
      ns.exec('/scripts/h.js', ns.getHostname(), 10, ...[target, hDelay, JID]);
      JID++;
      await ns.sleep(wt / 8);
    }

  }

}



/** @param {NS} ns */
export function printResults(ns, task, results, jobID) {
  const green = "\x1b[1;32m";
  const red = "\x1b[196m";
  const reset = "\x1b[0m";
  //(${task})
  switch (task) {
    case "Weaken":
      ns.print(`${green} Job #${jobID} ${task} results:`);
      ns.print(`    Security Decrease: ${results}`);
      break;

    case "Grow":
      ns.print(`${green} Job #${jobID} ${task} results:`);
      ns.print(`    Balance Increase: ${results}`);
      break;

    default:
      if (results > 0) {
        ns.print(`${green} Job #${jobID} ${task} results:`);
        ns.print(`    Balance Taken: ${results}`);
      } else {
        ns.print(`${green} Job #${jobID} ${task} results:`);
        ns.print(`--Balance Taken: ${results} (${red}FAIL / EMPTY ——— CHECK MONITOR${reset}) `);
      }
  }
}
