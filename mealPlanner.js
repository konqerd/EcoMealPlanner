"use strict";
const { levelRestrictions, characterStats, nutrition, myPreferences, } = require('./character');
const { taste } = require("./util");
const { lostSources, recipeList, tagList } = require("./food")

/*
Subtotal
> higher the better
> this is what all the bonus multiply with

Cravings
> up to 3/day
> 10% bonus each
> these are preferred foods only

Variety Bonus: cap 55%
> eat lots of different items
> > raw foods
> > milled foods
> > seeds and amanita mushrooms don't count
> at least 2000 calories of each (Amanita mushrooms don't count here)
> include things you don't like 

Balanced Diet Bonus: range -50% -- 50%
> smaller gaps between lowest and highest nutrient is better

Taste Bonus: range -30% -- 30%
> avoid unliked foods when possible
> > but cover Variety Bonus
*/

let debug = false;
let restrict = false;
let iterations = 0;

/* FUTURE PLANS: */
/*
    data includes recipe items and food chains can restrict what is cooked
    example: 
        [camas bulb] goes extinct
        can't craft: camas paste, camas bread, seeded camas roll, etc
*/

class Meal {
    //["source", "name", level, carbs, protein, fat, vitamins, calories, [["recipe 1 a", "recipe 1 b"], ["recipe 2 a"]]],
    constructor(meal) {
        this.source = meal[0];
        this.name = meal[1];
        this.level = meal[2];
        this.carbs = meal[3];
        this.protein = meal[4];
        this.fat = meal[5];
        this.vitamins = meal[6];
        this.calories = meal[7];
        this.tagRecipes = meal[8];

        for (let t in taste) {
            if (myPreferences[taste[t]].indexOf(this.name) >= 0) {
                this.pref = taste[t];
                break;
            }
        }

        function tagsToRecipes(recipes) {
            let newRecipes = [];
            for (let recipe of recipes) {
                for (let food of recipe) {
                    let tag = food.split("_")?.[1];
                    if (tag) {
                        for (let f of tagList[tag]) {
                            let newRecipe = recipe.slice().filter(x => !x.startsWith("tag"));
                            newRecipe.push(f);
                            newRecipes.push(newRecipe);
                        }
                    }
                }
            }
            return newRecipes.length > 0 ? newRecipes : recipes;
        }

        // this.foods = [];
        // for (let recipe of this.recipes) {
        //     for (let food of recipe) {
        //         this.foods.push(food);
        //     }
        // }
        this.recipes = tagsToRecipes(this.tagRecipes)
    }

    nutritionAverage() {
        return (this.carbs + this.protein + this.fat + this.vitamins) / 4;
    }
}

class SourceFood {
    constructor(name, tag, exist) {
        this.name = name;
        this.tag = tag;
        this.exist = exist;
    }
}

function getMenu(recipeList) {
    let menu = [];

    for (let meal of recipeList) {
        let m = new Meal(meal);
        menu.push(m);
    }

    return menu;
}

function getSources(tagList) {
    let sources = [];

    for (let tag of Object.keys(tagList)) {
        for (let name of tagList[tag]) {
            sources.push(new SourceFood(name, tag, !lostSources.includes(name)));
        }
    }

    return sources;
}

function restrictMenu(menu, sources) {
    let totalMeals = menu.length;
    if (debug || restrict) (console.log(`total meals: ${menu.length}`))

    // foreach data.lostSources
    // > disable tags - how???
    // > disable sources
    // > disable menu items
    // > append menu items
    // > while (has disabled items)
    // > > disable more menu items
    // > > append menu items
    let ls = [...lostSources];
    while (ls.length > 0) {
        // console.log(ls.length)
        let lost = ls[0];
        for (let meal of menu) {
            for (let _ = 0; _ < meal.recipes.length; _++) {
                // console.log(`${_}:${meal.recipes[_]}`)
                let r = meal.recipes.shift();
                if (r.indexOf(lost) == -1) {
                    meal.recipes.push(r);
                } else {
                    // console.log(`missing resource ${lost}, removing ${meal.name} recipe ${r}`);
                }
            }
            if (meal.recipes.length == 0) {
                if (ls.indexOf(meal.name) == -1) {
                    // console.log(`meal "${meal.name}" has no recipes, adding to lost sources`);
                    ls.push(meal.name)
                }
            }
        }
        menu = menu.filter(x => x.recipes.length > 0);
        // console.log(ls)
        ls.shift();
    }
    menu = menu.filter(x => x.recipes.length > 0);

    // ignore taste bonus...
    if (!nutrition.preferredOnly) menu.forEach(x => x.pref = nutrition.minPreference);
    //remove unwanted menu
    menu = menu.filter(x => x.pref >= nutrition.minPreference);

    if (debug || restrict) (console.log(`taste bonus: ${menu.length}`))

    if (nutrition.ignoreLowFoods) {
        if (levelRestrictions.advBaking == 7 && levelRestrictions.advCooking == 7) {
            // if top skills are maxed, remove lower skills
            levelRestrictions.multiple = -1;
            levelRestrictions.gathering = -1;
            levelRestrictions.farming = -1;
            levelRestrictions.milling = -1;
            levelRestrictions.hunting = -1;
            levelRestrictions.butchering = -1;
            levelRestrictions.campfire = -1;
            levelRestrictions.cooking = -1;
            levelRestrictions.baking = -1;
        } else if (levelRestrictions.baking == 7 && levelRestrictions.cooking == 7) {
            // if higher skills are maxed but not top skills, remove lower skills
            levelRestrictions.multiple = -1;
            levelRestrictions.gathering = -1;
            levelRestrictions.farming = -1;
            levelRestrictions.milling = -1;
            levelRestrictions.hunting = -1;
            levelRestrictions.butchering = -1;
            levelRestrictions.campfire = -1;
        }
    }

    if (debug || restrict) (console.log(`low foods: ${menu.length}`))

    // keep menu by level
    Object.keys(levelRestrictions).forEach(key => {
        // console.log(key);
        // keep things from a different Source than Key
        // keep things from the same Source as Key but within the level requirements
        menu = menu.filter(x => x.source != key
            || (x.source == key && x.level <= levelRestrictions[key]));
    });

    if (debug || restrict) (console.log(`skill levels: ${menu.length}`))

    // keep min average nutrition
    menu = menu.filter(x => x.nutritionAverage() > nutrition.avgNutrition);

    if (debug || restrict) (console.log(`nutrition limits: ${menu.length}`))

    let finalMeals = menu.length;

    console.log(`total meals: ${totalMeals}`);
    console.log(`restrictions removed: ${totalMeals - finalMeals}`);
    return menu;
}

let mealPlanning = {
    carbs: (meal1, count1, meal2, count2, meal3, count3, meal4, count4) => { return meal1.carbs * count1 + meal2.carbs * count2 + meal3.carbs * count3 + meal4.carbs * count4; },
    protein: (meal1, count1, meal2, count2, meal3, count3, meal4, count4) => { return meal1.protein * count1 + meal2.protein * count2 + meal3.protein * count3 + meal4.protein * count4; },
    fat: (meal1, count1, meal2, count2, meal3, count3, meal4, count4) => { return meal1.fat * count1 + meal2.fat * count2 + meal3.fat * count3 + meal4.fat * count4; },
    vitamins: (meal1, count1, meal2, count2, meal3, count3, meal4, count4) => { return meal1.vitamins * count1 + meal2.vitamins * count2 + meal3.vitamins * count3 + meal4.vitamins * count4; },
    calories: (meal1, count1, meal2, count2, meal3, count3, meal4, count4) => { return meal1.calories * count1 + meal2.calories * count2 + meal3.calories * count3 + meal4.calories * count4; },
    min: (meal) => { return Math.min(meal.carbs, meal.protein, meal.fat, meal.vitamins); },
    max: (meal) => { return Math.max(meal.carbs, meal.protein, meal.fat, meal.vitamins); },
};

function calc(meal1, count1, meal2, count2, meal3, count3, meal4, count4) {
    // too many calories, skip it
    let meal = {};
    meal.calories = mealPlanning.calories(meal1, count1, meal2, count2, meal3, count3, meal4, count4);
    if (meal.calories > characterStats.calorieLimit * nutrition.calorieMultiplier)
        return 0;

    // sum meal count
    let mealCount = count1 + count2 + count3 + count4;

    meal.carbs = mealPlanning.carbs(meal1, count1, meal2, count2, meal3, count3, meal4, count4) / mealCount;
    meal.protein = mealPlanning.protein(meal1, count1, meal2, count2, meal3, count3, meal4, count4) / mealCount;
    meal.fat = mealPlanning.fat(meal1, count1, meal2, count2, meal3, count3, meal4, count4) / mealCount;
    meal.vitamins = mealPlanning.vitamins(meal1, count1, meal2, count2, meal3, count3, meal4, count4) / mealCount;

    let minValue = mealPlanning.min(meal);
    let maxValue = mealPlanning.max(meal);

    let subTotal = meal.carbs + meal.protein + meal.fat + meal.vitamins;
    let balanceBonus = (minValue / maxValue) - 0.5;

    let total = subTotal
        + (subTotal * balanceBonus)
        + (subTotal * characterStats.varietyBonus / 100)
        + (subTotal * characterStats.tasteBonus / 100)
        // + (subTotal * characterStats.dinnerPartyBonus / 100)
        + (subTotal * 0.1 * characterStats.cravingCount)
        + characterStats.baseGain;
    return {
        calories: meal.calories,
        carbs: meal.carbs,
        protein: meal.protein,
        fat: meal.fat,
        vitamins: meal.vitamins,
        subtotal: subTotal,
        balance: balanceBonus,
        variety: characterStats.varietyBonus,
        tastiness: characterStats.tasteBonus,
        dinnerParty: characterStats.dinnerPartyBonus,
        cravings: characterStats.cravingCount,
        total: total
    };
}

function createMax(meal1, count1, meal2, count2, meal3, count3, meal4, count4, nutrition) {
    let max = {
        meals: {
            [meal1?.name]: count1,
            [meal2?.name]: count2,
            [meal3?.name]: count3,
            [meal4?.name]: count4
        },
        nutrition: nutrition
    }

    return max;
}

function count(meal1, meal2, meal3, meal4, max) {
    try {
        // if (debug) console.time("count");
        let limit1 = calculatePlates(meal1);
        let limit2 = calculatePlates(meal2);
        let limit3 = calculatePlates(meal3);
        let limit4 = calculatePlates(meal4);
        // console.log(`${calorieLimit * calorieMultiplier}, ${limit1}, ${limit2}, ${limit3}, ${limit4}`)

        for (let count1 = 0; count1 <= limit1; count1++) {
            for (let count2 = 0; count2 <= limit2; count2++) {
                for (let count3 = 0; count3 <= limit3; count3++) {
                    for (let count4 = 0; count4 <= limit4; count4++) {
                        if (debug) iterations++;
                        let result = calc(meal1, count1, meal2, count2, meal3, count3, meal4, count4);

                        if (result.total > nutrition.acceptableTotal) {
                            // good enough, return early
                            return createMax(meal1, count1, meal2, count2, meal3, count3, meal4, count4, result);
                        } else if (result.total > max.nutrition.total) {
                            max = createMax(meal1, count1, meal2, count2, meal3, count3, meal4, count4, result);
                        }
                    }
                }
            }
        }
        return max;
    } finally {
        // if (debug) console.timeEnd("count");
    }
}

function selectMeals(menu) {
    let best = createMax(null, 0, null, 0, null, 0, null, 0, { total: 0 });
    for (let i = 0; i < menu.length; i++) {
        let meal1 = menu[i];
        for (let j = i + 1; j < menu.length; j++) {
            let meal2 = menu[j];
            for (let k = j + 1; k < menu.length; k++) {
                let meal3 = menu[k];
                for (let l = k + 1; l < menu.length; l++) {
                    let meal4 = menu[l];
                    let result = count(meal1, meal2, meal3, meal4, best);
                    if (result.nutrition.total > best.nutrition.total) {
                        // console.log(JSON.stringify(result))
                        best = result;
                        if (best.nutrition.total > nutrition.acceptableTotal) return best;
                    }
                }
            }
        }
    }
    return best;
}

const calculatePlates = function (meal) {
    let plates = Math.min(Math.ceil(characterStats.calorieLimit * nutrition.calorieMultiplier / meal.calories), nutrition.maxPlates);
    return plates;
}

function process() {
    console.time("menuSetup");
    let fullmenu = getMenu(recipeList);
    let sources = getSources(tagList);

    let menu = restrictMenu(fullmenu, sources);

    menu = menu.sort((x, y) => x.pref - y.pref);
    let mealsToCalc = menu.length;
    let combinations = mealsToCalc * (mealsToCalc - 1) * (mealsToCalc - 2) * (mealsToCalc - 3);
    console.log(`meal combinations: ${combinations}`);
    console.timeEnd("menuSetup");

    console.time("runtime");
    let best = selectMeals(menu);

    for (let key of Object.keys(best.meals)) {
        if (!best.meals[key]) {
            delete best.meals[key];
        }
    }

    console.log(best);
    console.timeEnd("runtime");
    console.log(`meals processed: ${menu.length}`);
}

process();
if (debug) console.log(`iterations: ${iterations}`);