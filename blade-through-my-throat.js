// Companion Cubes
const GENERAL_ACTIONS = ["Training", "Field Analysis", "Recruitment", "Diplomacy", "Hyperbolic Regeneration Chamber", "Incite Violence"];
const OPERATIONS = ["Investigation", "Undercover Operation", "Sting Operation", "Raid", "Stealth Retirement Operation", "Assassination"];
const CONTRACTS = ["Tracking", "Bounty Hunter", "Retirement"];
const BLACKOPS = ["Operation Typhoon", "Operation Zero", "Operation X", "Operation Titan", "Operation Ares", "Operation Archangel", "Operation Juggernaut", "Operation Red Dragon", "Operation K", "Operation Deckard", "Operation Tyrell", "Operation Wallace", "Operation Shoulder of Orion", "Operation Hyron", "Operation Morpheus", "Operation Ion Storm", "Operation Annihilus", "Operation Ultron", "Operation Centurion", "Operation Vindictus", "Operation Daedalus"];
const TEAM_PERCENT = 0.7;
let STAMINA, PLAYER, CITY, CITY_CHAOS, RANK;
let NEXT_BLACK_OP;
let MIN_BLACKOP_CHANCE;

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    while (!ns.bladeburner.inBladeburner()) {
        PLAYER = ns.getPlayer();
        if (combatStats(ns, PLAYER) < 100) {
            ns.print(`Waiting for total stats to hit 100. Current: ${combatStats(ns, PLAYER)}`);
        } else {
            ns.print(`Joining Bladeburner...`);
            joinBladeburner(ns, PLAYER);
        }
        await ns.sleep(500);
    }

    while (ns.bladeburner.inBladeburner) {
        //variable setters
        CITY = ns.bladeburner.getCity();
        STAMINA = ns.bladeburner.getStamina();
        CITY_CHAOS = ns.bladeburner.getCityChaos(CITY);
        NEXT_BLACK_OP = ns.bladeburner.getNextBlackOp();
        RANK = ns.bladeburner.getRank();
        let REST_NEEDED = (STAMINA < STAMINA[1] / 2) ? true : false;
        //functions 
        if (RANK <= 27) {
            joinFaction();
        }
        chaosCheck(ns, CITY_CHAOS); // fixing chaos if it passes the penalty is the priority
        if (REST_NEEDED) {
            await taskRest(ns);
        } else {
            await contractWork(ns);
        }
        await ns.bladeburner.nextUpdate();
    }




}



/** @param {NS} ns */
function combatStats(ns, player) {
    return (player.skills.agility + player.skills.defense + player.skills.strength + player.skills.dexterity) / 4;
}
/** @param {NS} ns */
function joinBladeburner(ns, player) {
    //just in case the stats are wrong, dont hurt to check twice
    let pstats = (player.skills.agility + player.skills.defense + player.skills.strength + player.skills.dexterity) / 4
    if (pstats >= 100) {
        ns.bladeburner.joinBladeburnerDivision();
    }
}
/** @param {NS} ns */
function joinFaction(ns, rank) {
    if (rank >= 25) ns.bladeburner.joinBladeburnerFaction();
}
/** @param {NS} ns */
function chaosCheck(ns, chaos) {
    if (chaos >= 50) {
        for (let i; i < 10; i++) {
            ns.bladeburner.startAction("General Actions", "Diplomacy");
        }
    }
}
/** @param {NS} ns */
async function contractWork(ns) {
    //TODO: use index, not value. then check index values
    let bestContract;
    let bestChance = 0;
    const CONTRACT_INFO = CONTRACTS.map((c) => ns.bladeburner.getActionEstimatedSuccessChance("Contracts", c)) // [contract name, [min success, max success]]
    for (let contract in CONTRACT_INFO) {
        if (CONTRACT_INFO[contract][0] > bestChance) {
            bestChance = CONTRACT_INFO[contract][0];
            bestContract = contract;
        }
    }

    ns.bladeburner.startAction("Contracts", bestContract);
    await ns.sleep(ns.bladeburner.getActionTime("Contracts", bestContract));
}

/** @param {NS} ns */
async function taskRest(ns) {
    while (STAMINA[0] < (STAMINA[1] / 2)) {
        if (combatStats(ns, PLAYER) < 300) {
            ns.bladeburner.startAction("General Actions", "Training");
            await ns.sleep(ns.bladeburner.getActionTime("General Actions", "Training"));
        }

        ns.bladeburner.startAction("General Actions", "Field Analysis");
        await ns.sleep(ns.bladeburner.getActionTime("General Actions", "Field Analysis"));
    }
}
/** @param {NS} ns */
function startBlackOp(ns) {
    //TODO: BLACK OPS TAKE PRIORITY. 
    if (RANK > ns.bladeburner.getBlackOpRank(NEXT_BLACK_OP)) {
        if (ns.bladeburner.getCurrentAction()) {
            ns.bladeburner.stopBladeburnerAction();
        }

        if (ns.bladeburner.getActionEstimatedSuccessChance("BlackOps", NEXT_BLACK_OP.name) < .70) {
            ns.bladeburner.startAction("Black Ops", NEXT_BLACK_OP.name);
        }


    } else {
        ns.print(`ERROR: Required rank for current BlackOp is ${ns.bladeburner.getBlackOpRank(NEXT_BLACK_OP)}`)
    }
}

