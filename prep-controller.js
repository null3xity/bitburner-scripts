/** @param {NS} ns */
export async function prep_main(ns, t) {

  ns.disableLog('ALL');
  t = t.toString();

  const gt = ns.getGrowTime(t);
  const wt = ns.getWeakenTime(t);

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

  ns.tprint(`Weaken duration: ${ns.tFormat(wt)} (${wt})`);
  ns.tprint(`Grow duration: ${ns.tFormat(gt)} + ${ns.tFormat(gDelay)} delay (${gt + gDelay})`);


  let JID = 0; //job id

  //let arrayg = [t, gDelay, JID];
  //let arrayh = [t, hDelay, JID];

  if (t) {

    let maxthreads = threadCalc(ns);

    ns.tprint(`Max threads: ${maxthreads}`)


    while (ns.getServerMoneyAvailable(t) < ns.getServerMaxMoney(t) || ns.getServerSecurityLevel(t) > ns.getServerMinSecurityLevel(t)) {

      let taskW = ns.exec('/scripts/w.js', ns.getHostname(), Math.floor(maxthreads / 2), ...[t, JID, 'prep']);
      let taskG = ns.exec('/scripts/g.js', ns.getHostname(), Math.floor(maxthreads / 2), ...[t, gDelay, JID, 'prep']);

      ns.print("PREP TASK INFO:");
      ns.print(`Security Level: +${ns.getServerSecurityLevel(t) - ns.getServerMinSecurityLevel(t)}`);
      ns.print(`Balance: ${ns.getServerMoneyAvailable(t)} / ${ns.getServerMaxMoney(t)}`);

      if (taskG && taskW) {
        await ns.sleep(2 * (wt / 3));
        JID++;
        ns.clearLog();
      }
    }

    ns.print(`PREP COMPLETE! :D`)
    return true;
  } else {
    ns.print("No target specified for prep; killing script");
    return false;
  }

}

/** @param {NS} ns */
function threadCalc(ns) {
  let totalWorkerRam = ns.getScriptRam('/scripts/w.js') + ns.getScriptRam('/scripts/g.js');
  let totalControllerRam = ns.getScriptRam('/scripts/controller.js');
  let availableRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname());
  let threads = 1;

  while ((threads * totalWorkerRam + totalControllerRam) < availableRam) {
    threads++
  }

  return Math.floor(threads);
}

/*
function threadAllocate(ns, task, maxthreads) {
  let tw;
  let tg;

  if (task == 'weaken') {
    tw = 0.3 * maxthreads;
  }

  if (task == 'grow') {
    tg = 0.7 * maxthreads;
  }

  return [tw, tg];
}
*/


