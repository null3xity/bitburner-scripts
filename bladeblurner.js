// Companion Cubes
const SKILLS = ["Blade's Intuition", "Cloak", "Short-Circuit", "Digital Observer", "Tracer", "Overclock", "Reaper", "Evasive System", "Datamancer", "Hyperdrive"];
const SKILL_INFO = [];
const GENERAL_ACTIONS = ["Training", "Field Analysis", "Recruitment", "Diplomacy", "Hyperbolic Regeneration Chamber", "Incite Violence"];
const OPERATIONS = ["Investigation", "Undercover Operation", "Sting Operation", "Raid", "Stealth Retirement Operation", "Assassination"];
const CONTRACTS = ["Tracking", "Bounty Hunter", "Retirement"];
const BLACKOPS = ["Operation Typhoon", "Operation Zero", "Operation X", "Operation Titan", "Operation Ares", "Operation Archangel", "Operation Juggernaut", "Operation Red Dragon", "Operation K", "Operation Deckard", "Operation Tyrell", "Operation Wallace", "Operation Shoulder of Orion", "Operation Hyron", "Operation Morpheus", "Operation Ion Storm", "Operation Annihilus", "Operation Ultron", "Operation Centurion", "Operation Vindictus", "Operation Daedalus"];
//const TEAM_PERCENT = 0.7;
let STAMINA, PLAYER, CITY, CITY_CHAOS, RANK, SKILL_POINTS, TIMER;
let NEXT_BLACK_OP;
let MIN_BLACKOP_CHANCE;

const ACTION_INFO = [];

//const CHAOS_CUTOFF = 50;



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


    skillsInit(ns);
    actionsInit(ns);

    while (true) {
        ns.bladeburner.stopBladeburnerAction();
        ns.print(`DEBUG PRINT TO MAKE SURE ITS LOOPING`);
        CITY = ns.bladeburner.getCity();
        STAMINA = ns.bladeburner.getStamina(); // [current, max]
        CITY_CHAOS = ns.bladeburner.getCityChaos(CITY);
        NEXT_BLACK_OP = ns.bladeburner.getNextBlackOp();
        RANK = ns.bladeburner.getRank();
        SKILL_POINTS = ns.bladeburner.getSkillPoints();
        let REST_NEEDED = (STAMINA[0] < (STAMINA[1] / 2)) ? true : false;
        let REST_CUTOFF = STAMINA[1] * 0.75;
        intervalTimer(ns, REST_NEEDED);
        actionSort();
        purchaseSkills(ns);
        if (REST_NEEDED) await rest(ns, REST_CUTOFF);

        else if (combatStats(ns) < 200) {
            ns.bladeburner.startAction("gen", "Training");
            await ns.sleep(ns.bladeburner.getActionTime("gen", "Training"));
        } else await runAction(ns);

        //after all tasks are done, wait for the next update
        await ns.bladeburner.nextUpdate();
    }


}

function intervalTimer(ns, isResting) {
    ns.clearLog();
    ns.print(`CITY: ${CITY}`);
    ns.print(`STAMINA (%): ${ns.formatPercent(STAMINA[0] / STAMINA[1])}`);
    ns.print(`CHAOS: ${CITY_CHAOS}`);
    ns.print(`BLADE RANK: ${RANK}`);
    ns.print(`SKILL POINTS: ${SKILL_POINTS}`);
    ns.print(`${(isResting) ? "RESTING, UPDATES DISABLED" : ""}`)
}

/** @param {NS} ns */
async function decreaseChaos(ns) {
    while (CITY_CHAOS > 30) {
        ns.bladeburner.startAction(CITY_CHAOS);
        await ns.sleep(ns.bladeburner.getActionTime("gen", "Diplomacy"));
    }
}
/** @param {NS} ns */
async function rest(ns, cutoff) {
    if (CITY_CHAOS > 50) {
        await decreaseChaos(ns);
    }

    while (STAMINA[0] < cutoff) {
        ns.clearLog();
        ns.print(`(RESTING) CURRENT STAMINA: ${ns.formatPercent(STAMINA[0] / STAMINA[1], 3)}`);
        ns.bladeburner.startAction("gen", "Training");
        await ns.sleep(ns.bladeburner.getActionTime("gen", "Training"));
    }
}
/** @param {NS} ns */
async function runAction(ns) {
    let bestAction = ACTION_INFO[0];
    ns.bladeburner.startAction(bestAction.type, bestAction.name);
    await ns.sleep(bestAction.time);
}

/** @param {NS} ns */
function skillsInit(ns) {
    for (let skill of SKILLS) {
        SKILL_INFO.push(new Skill(ns, skill));
    }
    SKILL_INFO.sort((a, b) => { a.priority - b.priority });
}

/** @param {NS} ns */
function combatStats(ns) {
    let PLAYER = ns.getPlayer();
    return (PLAYER.skills.strength + PLAYER.skills.defense + PLAYER.skills.dexterity + PLAYER.skills.agility) / 4;
}

/** @param {NS} ns */
function actionsInit(ns) {
    for (let action of CONTRACTS.concat(OPERATIONS, BLACKOPS)) {
        ACTION_INFO.push(new Action(ns, action));
    }
    ACTION_INFO.sort((a, b) => b.priority - a.priority);
    for (let i of ACTION_INFO) i.debug(ns);
}

/** @param {NS} ns */
function actionSort() {
    ACTION_INFO.sort((a, b) => b.priority - a.priority);
}

/** @param {NS} ns */
function purchaseSkills(ns) {
    for (let skill of SKILL_INFO) {
        if (SKILL_POINTS > skill.cost && skill.buying == true) {
            ns.bladeburner.upgradeSkill(skill.name);
        } else continue;
    }
}

/** @param {NS} ns */
class Skill {
    constructor(ns, name) {
        this.name = name;
        this.level = ns.bladeburner.getSkillLevel(name);
        this.cost = ns.bladeburner.getSkillUpgradeCost(name);
        this.priority = this.setPriority();
        this.max = (this.name == "Overclock") ? 90 : this.setMaxLevel();
        this.buying = (this.level < this.max) ? true : false;
    }

    setPriority() {
        for (let skill of ["Blade's Intuition", "Digital Observer", "Reaper", "Evasive System"]) {
            if (skill == this.name) {
                return 3;
            }
        }
        for (let skill of ["Cloak", "Short-Circuit", "Overclock", "Hyperdrive"]) {
            if (skill == this.name) {
                return 2;
            }
        }
        if (this.name == "Datamancer") {
            return 1;
        }
        return 0;
    }

    setMaxLevel() {
        if (this.priority == 3) {
            return 1e9;
        }
        else if (this.priority == 2) {
            return 25;
        }
        else if (this.priority == 1) {
            return 5;
        }
        return 0;
    }
}

class Action {
    constructor(ns, name) {
        this.name = name;
        this.type = this.getType();
        this.remaining = ns.bladeburner.getActionCountRemaining(this.type, this.name);
        this.minSuccess = ns.bladeburner.getActionEstimatedSuccessChance(this.type, this.name)[0];
        this.maxSuccess = ns.bladeburner.getActionEstimatedSuccessChance(this.type, this.name)[0];
        //blackops cannot be leveled
        this.level = (this.type == "blackop") ? undefined : ns.bladeburner.getActionCurrentLevel(this.type, this.name);
        this.time = ns.bladeburner.getActionTime(this.type, this.name);
        this.priority = this.getPriority();
        this.isRetire = (this.type == "blackop") ? true : this.#isRetiringAction();
    }

    
    #isRetiringAction() {
        let retiring = false;
        for (let i of ["Bounty Hunter", "Retirement", "Raid", "Stealth Retirement Operation", "Assassination"]) {
            if (this.name == i) retiring = true;
        }
        return retiring;
    }

    getType() {
        if (GENERAL_ACTIONS.includes(this.name)) return "gen";
        if (CONTRACTS.includes(this.name)) return "contract";
        if (OPERATIONS.includes(this.name)) return "op";
        return "blackop";
    }

    getPriority() {
        let basePriority;
        if (this.type == "blackop") priority = 5;
        else if (this.type == "op" && this.isRetire) priority = 4;
        else if (this.type == "op" && !this.isRetire) priority = 3;
        else if (this.type == "contract" && this.isRetire) priority = 2;
        else if (this.type == "contract" && !this.isRetire) priority = 1
        
        if (this.minSuccess < 0.50) priority = 0;

        return (basePriority * this.minSuccess);
    }

    debug(ns) {
        ns.tprint(`${this.name}, ${this.type}, ${this.minSuccess}, ${this.priority}`);
    }
}
