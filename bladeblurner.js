// Companion Cubes
const SKILLS = ["Blade's Intuition", "Cloak", "Short-Circuit", "Digital Observer", "Tracer", "Overclock", "Reaper", "Evasive System", "Datamancer", "Hyperdrive"];
const SKILL_INFO = [];
const GENERAL_ACTIONS = ["Training", "Field Analysis", "Recruitment", "Diplomacy", "Hyperbolic Regeneration Chamber", "Incite Violence"];
const OPERATIONS = ["Investigation", "Undercover Operation", "Sting Operation", "Raid", "Stealth Retirement Operation", "Assassination"];
const CONTRACTS = ["Tracking", "Bounty Hunter", "Retirement"];
const BLACKOPS = ["Operation Typhoon", "Operation Zero", "Operation X", "Operation Titan", "Operation Ares", "Operation Archangel", "Operation Juggernaut", "Operation Red Dragon", "Operation K", "Operation Deckard", "Operation Tyrell", "Operation Wallace", "Operation Shoulder of Orion", "Operation Hyron", "Operation Morpheus", "Operation Ion Storm", "Operation Annihilus", "Operation Ultron", "Operation Centurion", "Operation Vindictus", "Operation Daedalus"];
const TEAM_PERCENT = 0.7;
let STAMINA, PLAYER, CITY, CITY_CHAOS, RANK, SKILL_POINTS;
let NEXT_BLACK_OP;
let MIN_BLACKOP_CHANCE;
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
    while (ns.bladeburner.inBladeburner) {
        //variable setters 
        CITY = ns.bladeburner.getCity();
        STAMINA = ns.bladeburner.getStamina(); // [current, max]
        CITY_CHAOS = ns.bladeburner.getCityChaos(CITY);
        NEXT_BLACK_OP = ns.bladeburner.getNextBlackOp();
        RANK = ns.bladeburner.getRank();
        SKILL_POINTS = ns.bladeburner.getSkillPoints();
        let REST_NEEDED = (STAMINA[0] < STAMINA[1] / 2) ? true : false;
        let REST_CUTOFF = STAMINA[1] * .75;

        purchaseSkills(ns);
        if (REST_NEEDED) {
            rest(ns, REST_CUTOFF);
        }

        //functions 
        if (RANK <= 27) {
            //joinFaction(); removed temporarily due to ram cost
        }

        await ns.bladeburner.nextUpdate();
    }
}

function decreaseChaos(ns) {
    while (CITY_CHAOS > 30) {
        ns.bladeburner.startAction(CITY_CHAOS);
        ns.sleep(ns.bladeburner.getActionTime("gen", "Diplomacy"));
    }
}

function rest(ns, cutoff) {
    if (CITY_CHAOS > 50) {
        decreaseChaos(ns);
    } else while (STAMINA[0] < cutoff) {
        ns.bladeburner.startAction("gen", "Training")
        ns.sleep(ns.bladeburner.getActionTime("gen", "Training"));
    }
}

function skillsInit(ns) {
    for (let skill of SKILLS) {
        SKILL_INFO.push(new Skill(ns, skill));
    }
    SKILL_INFO.sort((a, b) => { a.priority - b.priority });
}


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
