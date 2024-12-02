import { getName } from "/test-chamber/gangUtils.js"

//the over-extensive list of variables
const TAIL = [845, 545]; // width, height
const GANG_NAME = "Slum Snakes"; // THE SLUMMIEST SNAKES IN THE CITY
const MAX_MEMBERS = 12; // might be redundant due to ns.gang.canRecruitMember()
const TASKS = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism"];
const AUGS = ["Bionic Arms", "Bionic Legs", "Bionic Spine", "BrachiBlades", "Nanofiber Weave", "Synthetic Heart", "Synfibril Muscle", "Graphene Bone Lacings", "BitWire", "Neuralstimulator", "DataJack"];
const WEAPONS = ["Baseball Bat", "Katana", "Glock 18C", "P90C", "Steyr AUG", "AK-47", "M15A10 Assault Rifle", "AWM Sniper Rifle"];
const ARMOR = ["Bulletproof Vest", "Full Body Armor", "Liquid Body Armor", "Graphene Plating Armor"];
const VEHICLES = ["Ford Flex V20", "ATX1070 Superbike", "Mercedes-Benz S9001", "White Ferrari"];
const ROOTKITS = ["NUKE Rootkit", "Soulstealer Rootkit", "Demon Rootkit", "Hmap Node", "Jack the Ripper"];
const COMBAT_GANGS = ["Speakers for the Dead", "The Dark Army", "The Syndicate", "Tetrads", "Slum Snakes"];
const HACKING_GANGS = ["NiteSec", "The Black Hand"]; // completely useless <3 combat gangs are just better
const WORKERS = 9 / 12;
const WIN_CHANCE = 0.7;
const WIN_CUTOFF = 0.9;
const MIN_WAR_START_TERRITORY = 0.99;
const COMBAT_STAT_TRAIN = 600; // anything below 600 is more suceptible to clash death
let MODE = 'Respect';
let AUTO = true;
let MEMBER_NAMES;
let FULL_MEMBER_INFO;
let GANG_INFO;
let OTHER_GANG_INFO;
let REP_FOR_RECRUIT;

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog(`ALL`);
    ns.tail() // debug / printing
    //const myGang = new Gang(ns); // dunno if i wanna do classes, we'll see
    //await myGang.init(ns);
    let c = 0;
    let p = 0;
    let r = 0;

    ns.gang.createGang(GANG_NAME);

    while (!ns.gang.inGang()) {
        // REMOVED FOR NOW SINCE I DONT HAVE SF4 try { ns.singularity.joinFaction(GANG_NAME) } catch { }
        ns.gang.createGang(GANG_NAME);
        c--
        if (c < 0) {
            c = 30;
            let k = ns.heart.break();
            ns.clearLog();
            ns.print(`Heartbreak: ${Math.ceil(k)}`)
            if (p === 0) {
                r = 0;
            } else {
                r = (-54000 - k / (k - p) / 30) * 1000;
            }
            ns.printf(`Karma: %s / -54000  (ETA: %s)`, k.toFixed(2), ns.tFormat(r * -1))
            p = k;
        }
        await ns.sleep(1000);
    }

    MODE = ns.args[0] || "Respect";
    ns.resizeTail(TAIL[0], TAIL[1]);
    while (true) {
        ns.clearLog();
        MEMBER_NAMES = ns.gang.getMemberNames();
        FULL_MEMBER_INFO = MEMBER_NAMES.map((m) => ns.gang.getMemberInformation(m));
        GANG_INFO = ns.gang.getGangInformation();
        OTHER_GANG_INFO = ns.gang.getOtherGangInformation();
        REP_FOR_RECRUIT = ns.gang.respectForNextRecruit();

        const BUYING = AUTO && (MEMBER_NAMES.length === MAX_MEMBERS) ? true : (AUTO) ? false : BUYING;
        if (ns.gang.canRecruitMember()) ns.gang.recruitMember(getName());
        if (AUTO && BUYING) buyEquipment(ns);
        ascend(ns);
        const clashWinChance = clash(ns);
        assignTask(ns, clashWinChance);

        await ns.gang.nextUpdate();
    }
}

/** @param {NS} ns */
function buyEquipment(ns) {
    MEMBER_NAMES.forEach((m) => {
        AUGS.forEach((a) => ns.gang.purchaseEquipment(m, a));
        WEAPONS.forEach((a) => ns.gang.purchaseEquipment(m, a));
        VEHICLES.forEach((a) => ns.gang.purchaseEquipment(m, a));
        ROOTKITS.forEach((a) => ns.gang.purchaseEquipment(m, a));
    })
}

/** @param {NS} ns */
function ascend(ns) {
    for (let member of MEMBER_NAMES) {
        let ASCENSION_RESULT = ns.gang.getAscensionResult(member);
        if (ASCENSION_RESULT !== undefined) {
            let req = getAsensionRequirement(ns, ns.gang.getMemberInformation(member));
            const resultMultiplier = (ASCENSION_RESULT.agi + ASCENSION_RESULT.def + ASCENSION_RESULT.dex + ASCENSION_RESULT.str) / 4
            if (resultMultiplier > req) {
                ns.gang.ascendMember(member)
                ns.print(`✓ |${member} ascended. New Multiplers: ${ASCENSION_RESULT.str}x, ${ASCENSION_RESULT.def}x, ${ASCENSION_RESULT.dex}x, ${ASCENSION_RESULT.agi}x`)
            } else {
                continue;
            }
        }
    }
}

/** @param {NS} ns */
function getAsensionRequirement(ns, memberInfo) {
    //const member = ns.gang.getMemberInformation(member);
    const mult = ns.formulas.gang.ascensionMultiplier((memberInfo.agi_asc_points + memberInfo.def_asc_points + memberInfo.str_asc_points + memberInfo.dex_asc_points) / 4);
    if (mult < 1.632) return 1.7;
    if (mult < 2.336) return 1.532;
    if (mult < 2.999) return 1.432;
    if (mult < 3.363) return 1.3122;
    if (mult < 4.253) return 1.2155;
    if (mult < 4.860) return 1.1628;
    if (mult < 5.455) return 1.1225;
    if (mult < 5.977) return 1.0982;
    if (mult < 6.496) return 1.0869;
    if (mult < 7.008) return 1.0789;
    if (mult < 7.519) return 1.073;
    if (mult < 8.025) return 1.0673;
    if (mult < 8.513) return 1.0631;
    if (mult < 20) return 1.0591;
    return 1.04;
}

/** @param {NS} ns */
function getMemberCombatStats(member) {
    //ns.print(`DEBUG: AGI:${member.agi}, DEF:${member.def}, DEX:${member.dex}, STR:${member.str}`)
    let stats = (member.agi + member.def + member.dex + member.str) / 4;
    return stats;
}

/** @param {NS} ns */
function clash(ns) {
    if (GANG_INFO.territory < MIN_WAR_START_TERRITORY) {
        let lowestWinChance = 1;

        for (const otherGang of COMBAT_GANGS.concat(HACKING_GANGS)) {
            if (otherGang == GANG_INFO.faction) {
                continue
            } else if (OTHER_GANG_INFO[otherGang].territory) {
                continue
            } else {
                let otherGangPower = OTHER_GANG_INFO[otherGang].power;
                let winChance = GANG_INFO.power / (GANG_INFO.power + otherGangPower);
                lowestWinChance = Math.min(lowestWinChance, winChance);
                if (lowestWinChance > WIN_CHANCE) {
                    if (!GANG_INFO.territoryWarfareEngaged) {
                        ns.gang.setTerritoryWarfare(true);
                    }
                } else if (GANG_INFO.territoryWarfareEngaged) {
                    ns.gang.setTerritoryWarfare(false);
                }
                return lowestWinChance;
            }
        }
    } else if (GANG_INFO.territoryWarfareEngaged) {
        ns.gang.setTerritoryWarfare(false)
    }
    return 1;
}

/** @param {NS} ns */
function taskValue(ns, member, task, mode) {
    let value = 0;
    let memberInfo = ns.gang.getMemberInformation(member.name)
    let fRespectGain = ns.formulas.gang.respectGain(GANG_INFO, memberInfo, ns.gang.getTaskStats(task));
    let fMoneyGain = ns.formulas.gang.moneyGain(GANG_INFO, memberInfo, ns.gang.getTaskStats(task));
    let wantedGain = ns.formulas.gang.wantedLevelGain(GANG_INFO, memberInfo, ns.gang.getTaskStats(task));
    let wantedDecrease = ns.formulas.gang.wantedLevelGain(GANG_INFO, memberInfo, ns.gang.getTaskStats('Vigilante Justice'));

    if (mode == "Respect") value = fRespectGain;
    else if (mode == "Money") value = fMoneyGain;
    else if (mode == "Both") value = (fRespectGain + fMoneyGain) / 2;

    //when equip discount passes 99%, respect gain is NOT a priority and value drops by 30%
    if (fDiscount() > 99) {
        //ns.print(`Discount: ${fDiscount()}`);
        //value -= value * .30;
    }
    //Debuff for overall wanted gain over 20 (at some point this debuff wont hit at all) 
    if (wantedDecrease + wantedGain > 20) {
        ns.print(`Wanted increase: ${wantedDecrease + wantedGain}`);
        return value / 2;
    }

    return value;
}

/** @param {NS} ns */
function assignTask(ns, clashWinChance) {
    const sortedNames = FULL_MEMBER_INFO.sort((a, b) => (getMemberCombatStats(b) - getMemberCombatStats(a)));
    let workerCount = Math.ceil((MEMBER_NAMES.length) * WORKERS);
    let wantedIncrease = 0;

    for (let member of sortedNames) {
        let highestTaskValue = 0;
        let BEST_TASK = ns.gang.getTaskStats("Train Combat");

        const wantedDecrease = ns.formulas.gang.wantedLevelGain(GANG_INFO, member, ns.gang.getTaskStats("Vigilante Justice"));
        // ns.print(`DEBUG: combat stats for ${member.name}: ${getMemberCombatStats(ns, member)}`);

        if (workerCount > 0 && GANG_INFO.territory < 1 && MEMBER_NAMES.length >= MAX_MEMBERS && clashWinChance < WIN_CUTOFF && getMemberCombatStats(member) > 600) {
            workerCount--;
            BEST_TASK = ns.gang.getTaskStats("Territory Warfare");
        }
        else if (workerCount > 0 && (wantedIncrease + GANG_INFO.wantedLevel - 1 > wantedDecrease * -5 || wantedIncrease + GANG_INFO.wantedLevel > 20)) {
            workerCount--
            BEST_TASK = ns.gang.getTaskStats("Vigilante Justice");
            wantedIncrease += wantedDecrease * 5
        }
        else if (getMemberCombatStats(member) < COMBAT_STAT_TRAIN) {
            workerCount--
            BEST_TASK = ns.gang.getTaskStats("Train Combat");
        }
        else if (workerCount > 0) {
            workerCount--;
            for (let task of TASKS.map((t) => ns.gang.getTaskStats(t))) {
                if (taskValue(ns, member, task.name, MODE) > highestTaskValue) {
                    highestTaskValue = taskValue(ns, member, task.name, MODE);
                    BEST_TASK = task;
                }
            }

        }

        wantedIncrease += ns.formulas.gang.wantedLevelGain(GANG_INFO, member, BEST_TASK)
        if (member.task != BEST_TASK.name) {
            ns.gang.setMemberTask(member.name, BEST_TASK.name);
        }

        ns.print(`${member.name}'s best task: ${BEST_TASK.name}`);
        ns.print(`Worker Count: ${workerCount}`);
    }
}

function fDiscount() {
    // Cost of upgrade gets cheaper as gang increases in respect + power
    const power = GANG_INFO.power;
    const respect = GANG_INFO.respect;

    const respectLinearFac = 5e6;
    const powerLinearFac = 1e6;
    const discount = Math.pow(respect, 0.01) + respect / respectLinearFac + Math.pow(power, 0.01) + power / powerLinearFac - 1;
    
    return Math.max(1, discount);
}









//CURRENTLY UNUSED, but its here anyways
class Gang {
    constructor(ns, faction = "Slum Snakes") {

        this.faction = faction;
        this.members = ns.gang.getMemberNames();
        this.tasks = {
            u: "Unassigned",
            mug: "Mug People",
            deal: "Deal Drugs",
            strong: "Strongarm Civilians",
            con: "Run a Con",
            rob: "Armed Robbery",
            ia: "Traffick Illegal Arms",
            bm: "Threaten & Blackmail",
            ht: "Human Trafficking",
            ttt: "Terrorism",
            vj: "Vigilante Justice",
            tc: "Train Combat",
            th: "Train Hacking",
            charisma: "Train Charisma",
            clash: "Territory Warfare"
        }

        this.taskArray = ns.gang.getTaskNames();
        this.pwStorage = [];

    }

    /** @param {NS} ns */
    async init(ns) {
        if (!ns.gang.inGang()) {
            try {
                ns.gang.createGang(this.faction);
            } catch (error) {
                throw new Error(error);
            }
            this.recruit(ns);
        } else {
            ns.print(`WARN: Already in gang ${this.faction}`);
        }


        this.setTask(ns, this.tasks.tc);
        await ns.sleep(5000);
        ns.print(`Init complete.`);
    }

    getMemberInfo(ns) {
        // this might be useful but it also might not
        let infoList = [];
        for (let i of this.members) {
            infoList.push(ns.gang.getMemberInformation(i))
        }
        infoList.sort((a, b) => ns.gang.getMemberInformation(a).str - ns.gang.getMemberInformation(b).str);
        return infoList;
    }

    /** @param {NS} ns */
    recruit(ns) {
        if (ns.gang.canRecruitMember()) {
            ns.gang.recruitMember(getName(ns));
        }
    }

    /** @param {NS} ns */
    setTask(ns, task) {
        for (let i of this.members) {
            ns.gang.setMemberTask(i, task);
        }
    }

    /** @param {NS} ns */
    makeMoney(ns) {
        //TO-DO: 
        for (let i of this.members) {
            let t = this.getBestTask(ns, i);
            ns.gang.setMemberTask(i, t);
        }
    }

    /** @param {NS} ns */
    getBestTask(ns, member) {
        let m = 0;
        let t = '';
        for (let task of this.taskArray) {
            let nm = ns.formulas.gang.moneyGain(ns.gang.getGangInformation(), ns.gang.getMemberInformation(member), ns.gang.getTaskStats(task));
            if (m <= nm) {
                m = nm;
                t = task;
                continue;
            }
        }

        return t;
    }

    /** @param {NS} ns */
    justice(ns) {
        if (ns.gang.getGangInformation().wantedPenalty < 0.8) {
            for (let i of this.members) {
                ns.gang.setMemberTask(i, this.tasks.vj);
            }
        } else {
            ns.print(`WARN: Justice function ignored; penalty not hit`);
        }
    }

    /** @param {NS} ns */
    getItems(ns) {
        let eq = ns.gang.getEquipmentNames();
        for (let i of this.members) {
            for (let equip of eq) {
                try {
                    ns.gang.purchaseEquipment(i, equip);
                } catch (error) {
                    ns.print(`ERROR: ${error}`)
                    continue;
                }
            }
        }
    }

    /** @param {NS} ns */
    /* #powerDiffCheck(ns) { [DEPRECATED]
         if (this.pwStorage.length < 1) this.pwStorage.push(ns.gang.getOtherGangInformation().NiteSec.power);
         ns.print(ns.gang.getOtherGangInformation().NiteSec.power);
         ns.print(`from pwStorage: ${this.pwStorage[0]}`)
         ns.print(this.pwStorage[0] == ns.gang.getOtherGangInformation().NiteSec.power);
         if (this.pwStorage[0] != ns.gang.getOtherGangInformation().NiteSec.power) {
             return false;
         } else {
             return true;
         }
     }*/

    /*cycleTimer(ns) { [DEPRECATED]
        if (this.#powerDiffCheck(ns) === false) {
            ns.print(`clash cycle is running!`);
            const intv = setInterval(() => {
                this.setTask(ns, this.tasks.clash);
            }, 19500)
            ns.atExit(() => clearInterval(intv));
        }
 
 
    }*/

}

