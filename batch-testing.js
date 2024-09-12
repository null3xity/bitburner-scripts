import { prep_main } from "/scripts/prep-controller.js"
import { findBest } from '/scripts/findBestServers.js'
/** @param {NS} ns */
export async function main(ns) {
  const batchCount = ns.args[0];
  await sendBatch(ns, batchCount);
}

/** @param {NS} ns */
async function sendBatch(ns, endPoint) {

  let target = findBest(ns);
  const jobID = 0;
  const ht = ns.getHackTime(target);
  const gt = ns.getGrowTime(target);
  const wt = ns.getWeakenTime(target);

  const batchStart = Date.now();

  const weakenStart = batchStart;
  const hD = batchStart + (weakenStart - ht);
  const gD = batchStart - 200 + (weakenStart - gt);

  //INFO PRINTING
  ns.print(`Weaken duration: ${ns.tFormat(wt)} (${wt})`);
  ns.print(`Grow duration: ${ns.tFormat(gt)} + ${ns.tFormat(gD)} delay  (total ${gt + gD})`);
  ns.print(`Hack duration: ${ns.tFormat(ht)} + ${ns.tFormat(hD)} delay (total ${ht + hD})`);


  if (target) {
    await prep_main(ns, target);

    while (true) {
      ns.exec('/scripts/w.js', chooseHost(ns), 10, ...[target, jobID]);
      ns.exec('/scripts/g.js', chooseHost(ns), 20, ...[target, gD, jobID]);
      ns.exec('/scripts/h.js', chooseHost(ns), 10, ...[target, hD, jobID]);
      jobID++;

      await ns.sleep(batchStart + wt);
      
      if (jobID == endPoint) {
        ns.exit();
      }
      //this number will be a hell of a lot higher since i want it to re-evaluate the best server to hit every few (batches? cycles?)
      if (jobID == 3) {
        await sendBatch(this);
      }

    }
  }
}

export function chooseHost(ns) {
  let hosts = ns.getPurchasedServers();
  hosts.push('home');
  hosts.sort((a, b) => ns.getServerUsedRam(a) - ns.getServerUsedRam(b));

  return hosts[0];
}

/** @param {NS} ns */
export function printResults(ns, task, results, jobID) {
  const green = "\x1b[1;32m";
  const red = "\x1b[196m";
  const reset = "\x1b[0m";

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
        ns.alert(`${green} Job #${jobID} ${task} results:` + '/n' +
          `--Balance Taken: ${results} (${red}FAIL / EMPTY ——— CHECK MONITOR${reset}) `);

      }
  }
}

