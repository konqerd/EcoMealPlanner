"use strict";
const { levelRestrictions, characterStats, nutrition, myPreferences } = require('./character');

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
        this.recipes = meal[8];

        this.pref = myPreferences[this.name];

        function tagsToRecipes(recipes, tags) {
            for (let recipe of recipes) {
                for (let food of recipe) {
                    let tag = food.split("_")?.[1];
                    if (tag) {
                        let newRecipe = recipe.slice().filter(x => !x.startsWith("tag"));
                        // recipe.slice to create copy
                        // push to copy
                    }
                }
            }
        }

        this.foods = [];
        for (let recipe of this.recipes) {
            for (let food of recipe) {
                this.foods.push(food);
            }
        }
        tagsToRecipes(this.recipes, getSources(data.tagList))
    }

    nutritionAverage() {
        return (this.carbs + this.protein + this.fat + this.vitamins) / 4;
    }

    canCraft(sources) {
        // console.log(sources)
        // for (let recipe of this.recipes) {
        //     let hasIngredients = true;

        //     for (let food of recipe) {
        //         let source = sources.filter(x => x.name == food)?.[0];
        //         // TODO: food might be a tag
        //         console.log(food, source)
        //         hasIngredients = hasIngredients && source.exist;
        //     }

        //     if (hasIngredients) { return true; }
        // }

        // return false;
        return true;
    }
}

class SourceFood {
    constructor(name, tag, exist) {
        this.name = name;
        this.tag = tag;
        this.exist = exist;
    }
}

// source, preference, name, level, carbs, protein, fat, vitamins, calories, list of recipes items
// set the last value in each row based on your character preferences
// preference >> 0, 1 horrible, 2 bad, 3 ok, 4 good, 5 delicious, 6 incredible
// ["source", preference, "name", level, carbs, protein, fat, vitamins, calories, [["recipe 1 a", "recipe 1 b"], ["recipe 2 a"]]],
let data = {
    lostSources: ["clam", "urchin"],
    tagList: {
        greens: ["agave", "beet greens", "fiddleheads", "fireweed shoots"],
        vegetable: ["beans", "beet", "camas bulb", "corn", "heart of palm", "taro", "tomato"],
        fruit: ["giant cactus fruit", "huckleberry", "papaya", "pineapple", "prickly pear fruit", "pumpkin"],
        grain: ["rice", "wheat"],
        fungus: ["amanita", "bolete", "cookeina", "crimini"],
        fish: ["bass", "blue shark", "clam", "cod", "crab", "moon jellyfish", "pacific sardine", "salmon", "trout", "tuna", "urchin"],
        meat: ["agouti", "alligator", "bighorn sheep", "bison", "coyote", "deer", "elk", "fox", "hare", "jaguar", "mountain goat", "otter", "prairie dog", "snapping turtle", "tortoise", "turkey", "wolf"],
        medium: ["alligator", "bighorn sheep", "deer", "elk", "jaguar", "mountain goat"],
        fat: ["flaxseed oil", "oil", "tallow"],
        oil: ["flaxseed oil", "oil"],
        _other: ["acorn", "clam", "cotton boll", "fern", "flax stem", "kelp", "oak tree", "palm log", "sunflower"],
    },
    recipeList: [
        ["multiple", "tallow", 1, 0, 0, 8, 0, 200, [["scrap meat"], ["bison"], ["tag_medium"], ["raw bacon"]]],
        ["gathering", "heart of palm", 1, 4, 2, 0, 2, 100, [["palm log"]]],
        ["gathering", "agave leaves", 0, 2, 1, 1, 4, 200, [["agave"]]],
        ["gathering", "beans", 0, 1, 4, 3, 0, 150, [["amanita"]]],
        ["gathering", "beet", 0, 2, 0, 2, 4, 230, [["beet"]]],
        ["gathering", "beet greens", 0, 3, 1, 0, 4, 100, [["beet"]]],
        ["gathering", "bolete", 0, 2, 4, 1, 1, 200, [["bolete"]]],
        ["gathering", "camas bulb", 0, 1, 2, 5, 0, 150, [["camas bulb"]]],
        ["gathering", "cookeina", 0, 2, 4, 1, 1, 200, [["bolete"]]],
        ["gathering", "corn", 0, 4, 1, 0, 3, 230, [["corn"]]],
        ["gathering", "crimini", 0, 2, 4, 1, 1, 200, [["crimini"]]],
        ["gathering", "fiddleheads", 0, 2, 1, 0, 5, 150, [["fern"]]],
        ["gathering", "fireweed shoots", 0, 3, 1, 0, 4, 150, [["fireweed shoots"]]],
        ["gathering", "giant cactus fruit", 0, 2, 0, 2, 4, 100, [["fireweed shoots"]]],
        ["gathering", "heart of palm", 0, 4, 2, 0, 2, 100, [["fireweed shoots"]]],
        ["gathering", "huckleberry", 0, 2, 0, 0, 6, 150, [["huckleberry"]]],
        ["gathering", "papaya", 0, 2, 1, 0, 5, 200, [["papaya"]]],
        ["gathering", "pineapple", 0, 6, 0, 0, 2, 200, [["pineapple"]]],
        ["gathering", "prickly pear fruit", 0, 2, 1, 1, 4, 190, [["prickly pear fruit"]]],
        ["gathering", "pumpkin", 0, 5, 1, 0, 2, 340, [["pumpkin"]]],
        ["gathering", "rice", 0, 7, 1, 0, 0, 150, [["rice"]]],
        ["gathering", "sunflower", 0, 2, 2, 4, 0, 50, [["pumpkin"]]],
        ["gathering", "taro", 0, 6, 1, 0, 1, 250, [["pumpkin"]]],
        ["gathering", "tomato", 0, 5, 1, 0, 2, 240, [["tomato"]]],
        ["gathering", "wheat", 0, 6, 2, 0, 0, 150, [["wheat"]]],
        ["campfire", "boiled grains", 0, 9, 2, 0, 1, 350, [["tag_grain"]]],
        ["campfire", "charred agave", 0, 5, 1, 3, 3, 350, [["agave leaves"]]],
        ["campfire", "charred beans", 0, 1, 8, 3, 0, 350, [["beans"]]],
        ["campfire", "charred beet", 0, 3, 0, 3, 6, 350, [["beet"]]],
        ["campfire", "charred cactus fruit", 0, 4, 0, 2, 6, 200, [["giant cactus fruit"]]],
        ["campfire", "charred camas bulb", 0, 2, 3, 6, 1, 350, [["camas bulb"]]],
        ["campfire", "charred corn", 0, 7, 1, 0, 4, 350, [["corn"]]],
        ["campfire", "charred fireweed shoots", 0, 5, 1, 0, 6, 350, [["fireweed shoots"]]],
        ["campfire", "charred fish", 0, 0, 11, 4, 0, 400, [["tag_fish"]]],
        ["campfire", "charred heart of palm", 0, 6, 3, 1, 2, 210, [["heart of palm"]]],
        ["campfire", "charred meat", 0, 0, 5, 10, 0, 400, [["tag_meat"]]],
        ["campfire", "charred mushrooms", 0, 3, 6, 2, 1, 350, [["tag_fungus"]]],
        ["campfire", "charred papaya", 0, 3, 1, 0, 8, 350, [["papaya"]]],
        ["campfire", "charred pineapple", 0, 8, 1, 0, 3, 350, [["pineapple"]]],
        ["campfire", "charred taro", 0, 10, 1, 0, 1, 350, [["taro"]]],
        ["campfire", "charred tomato", 0, 7, 1, 0, 4, 350, [["tomato"]]],
        ["campfire", "wilted fiddleheads", 0, 4, 1, 0, 7, 350, [["fiddleheads"]]],
        ["campfire", "beet campfire salad", 1, 8, 4, 3, 13, 900, [["beet", "tag_fruit", "tag_greens"]]],
        ["campfire", "charred sausage", 1, 0, 10, 14, 0, 700, [["raw sausage"]]],
        ["campfire", "fern campfire salad", 1, 9, 5, 1, 13, 900, [["fiddleheads", "huckleberry", "tag_vegetable"]]],
        ["campfire", "jungle campfire salad", 1, 11, 4, 3, 10, 900, [["papaya", "scrap meat", "flour", "tag_fat", "tag_fungus"]]],
        ["campfire", "root campfire salad", 1, 8, 5, 4, 11, 950, [["camas bulb", "taro root", "tag_greens"]]],
        ["campfire", "topped porridge", 1, 10, 4, 0, 10, 700, [["boiled grains", "tag_fruit"]]],
        ["campfire", "bannock", 2, 15, 3, 6, 0, 700, [["wheat", "tag_fat"]]],
        ["campfire", "campfire roast", 2, 0, 16, 12, 0, 1000, [["raw roast"]]],
        ["campfire", "fried camas", 2, 9, 3, 10, 2, 700, [["camas bulb", "tag_fat"]]],
        ["campfire", "fried fiddleheads", 2, 11, 3, 6, 4, 700, [["fiddleheads", "tag_fat"]]],
        ["campfire", "fried hearts of palm", 2, 13, 3, 6, 2, 700, [["heart of palm", "tag_fat"]]],
        ["campfire", "fried taro", 2, 14, 1, 8, 1, 700, [["taro", "tag_fat"]]],
        ["campfire", "fried tomatoes", 2, 11, 3, 8, 2, 700, [["tomato", "tag_fat"]]],
        ["campfire", "meaty stew", 3, 6, 13, 10, 1, 1100, [["charred meat", "scrap meat", "flour", "tag_fat"], ["charred fish", "flour", "tag_fat"]]],
        ["campfire", "field campfire stew", 4, 14, 4, 8, 4, 1100, [["corn", "tomato", "scrap meat", "flour", "tag_fat"]]],
        ["campfire", "jungle campfire stew", 4, 8, 8, 11, 3, 1100, [["papaya", "scrap meat", "flour", "tag_fat", "tag_fungus"]]],
        ["campfire", "root campfire stew", 4, 8, 5, 12, 5, 1100, [["beet", "camas bulb", "scrap meat", "flour", "tag_fat"]]],
        ["campfire", "wild stew", 6, 10, 2, 6, 12, 1100, [["huckleberry", "beans", "beet", "flour", "tag_vegetable"]]],
        ["hunting", "raw fish", 1, 0, 7, 3, 0, 200, [["tag_fish"]]],
        ["hunting", "dried fish", 2, 1, 16, 2, 0, 450, [["raw fish"]]],
        ["hunting", "dried meat", 2, 1, 14, 4, 0, 550, [["raw meat"]]],
        ["hunting", "sweet jerky", 4, 4, 22, 6, 3, 600, [["raw meat", "sugar", "tag_oil", "tag_fruit"]]],
        ["butchery", "raw meat", 1, 0, 4, 8, 0, 25, [["tag_meat"]]],
        ["butchery", "scrap meat", 1, 0, 5, 5, 0, 50, [["raw meat"]]],
        ["butchery", "raw sausage", 2, 0, 4, 8, 0, 500, [["scrap meat"]]],
        ["butchery", "raw roast", 3, 0, 6, 5, 0, 600, [["raw meat"]]],
        ["butchery", "raw bacon", 3, 0, 3, 9, 0, 200, [["raw meat"]]],
        ["butchery", "prepared meat", 4, 0, 4, 6, 0, 600, [["raw meat"]]],
        ["butchery", "prime cut", 6, 0, 9, 4, 0, 600, [["raw meat"]]],
        ["cooking", "rice noodles", 1, 10, 0, 0, 0, 200, [["rice flour"]]],
        ["cooking", "vegetable medley", 1, 8, 4, 7, 17, 900, [["beans", "tomato", "beet"], ["corn", "camas bulb"], ["crimini", "cookeina", "bolete"]]],
        ["cooking", "fruit salad", 1, 12, 4, 3, 19, 900, [["prickly pear fruit", "pumpkin"], ["huckleberry", "beet"], ["papaya", "pineapple"]]],
        ["cooking", "basic salad", 1, 18, 6, 4, 10, 800, [["prickly pear fruit", "crimini", "rice"], ["fiddleheads", "tomato", "fireweed shoots"], ["corn", "tomato", "beet"], ["fiddleheads", "huckleberry", "beans"], ["taro", "bolete", "papaya"]]],
        ["cooking", "autumn stew", 2, 13, 8, 5, 12, 1200, [["pumpkin", "beans", "tag_greens"]]],
        ["cooking", "meat stock", 2, 3, 8, 9, 0, 600, [["scrap meat"]]],
        ["cooking", "shark fillet soup", 2, 10, 15, 11, 4, 1400, [["meat stock", "blue shark"]]],
        ["cooking", "simmered meat", 2, 6, 18, 13, 5, 900, [["prepared meat", "meat stock"]]],
        ["cooking", "crispy bacon", 3, 0, 18, 26, 0, 800, [["raw bacon"]]],
        ["cooking", "vegetable soup", 3, 12, 4, 7, 19, 1200, [["vegetable stock", "vegetable medley"]]],
        ["cooking", "taro fries", 3, 10, 2, 20, 0, 600, [["taro", "tag_oil"]]],
        ["cooking", "vegetable stock", 3, 11, 1, 2, 11, 700, [["vegetable medley"]]],
        ["cooking", "mochi", 4, 25, 0, 0, 5, 750, [["rice flour", "sugar", "cornmeal"]]],
        ["cooking", "pupusas", 4, 6, 11, 9, 14, 900, [["cornmeal", "tomato", "beans", "sun cheese"]]],
        ["cooking", "smooth gut noodle roll", 4, 19, 15, 9, 1, 1200, [["rice noodles", "prepared meat", "tag_oil"]]],
        ["cooking", "clam chowder", 5, 16, 15, 3, 11, 800, [["clam", "taro"]]],
        ["cooking", "loaded taro fries", 5, 14, 6, 18, 0, 1200, [["taro fries", "sun cheese", "prepared meat"]]],
        ["cooking", "phad thai", 6, 9, 11, 19, 5, 1200, [["rice noodles", "prepared meat", "bean sprout", "sugar", "acorn", "tag_oil"]]],
        ["advCooking", "boiled rice", 1, 13, 2, 0, 0, 210, [["rice"]]],
        ["advCooking", "corn fritters", 1, 13, 4, 22, 8, 500, [["cornmeal", "corn", "tag_fat"]]],
        ["advCooking", "fish n chips", 1, 20, 10, 20, 0, 1000, [["raw fish", "taro fries", "flour", "tag_oil"]]],
        ["advCooking", "infused oil", 1, 0, 0, 12, 3, 120, [["huckleberry extract", "tag_oil"]]],
        ["advCooking", "seared meat", 1, 4, 19, 17, 7, 600, [["prime cut", "infused oil"]]],
        ["advCooking", "wild mix", 1, 15, 6, 4, 21, 800, [["basic salad", "huckleberry extract"]]],
        ["advCooking", "boiled sausage", 2, 0, 27, 22, 0, 600, [["raw sausage", "meat stock"]]],
        ["advCooking", "fried hare haunches", 2, 6, 15, 27, 4, 750, [["flour", "prepared meat", "tag_oil"]]],
        ["advCooking", "torilla", 2, 20, 10, 0, 0, 350, [["cornmeal"]]],
        ["advCooking", "elk taco", 2, 15, 8, 22, 6, 700, [["scrap meat", "tortilla", "wild mix"]]],
        ["advCooking", "crimson salad", 3, 13, 7, 8, 28, 1200, [["basic salad", "infused oil", "charred beet", "tomato"]]],
        ["advCooking", "hosomaki", 3, 21, 19, 5, 8, 700, [["boiled rice", "kelp", "raw fish"]]],
        ["advCooking", "kelpy crab roll", 3, 22, 13, 11, 5, 1350, [["boiled rice", "kelp", "crab"]]],
        ["advCooking", "seeded camas roll", 3, 20, 2, 13, 16, 1400, [["boiled rice", "kelp", "camas paste", "fiddleheads"]]],
        ["advCooking", "sweet salad", 3, 18, 9, 7, 22, 1200, [["basic salad", "fruit salad", "simple syrup"]]],
        ["advCooking", "spiky roll", 3, 20, 17, 7, 2, 1300, [["boild rice", "urchin"]]],
        ["advCooking", "agouti enchiladas", 4, 20, 8, 27, 3, 800, [["cornmeal", "tomato", "papaya", "sun cheese", "prime cut"]]],
        ["advCooking", "bison chow fun", 4, 16, 13, 20, 8, 1450, [["rice noodles", "bean sprout", "bison", "tag_oil"]]],
        ["advCooking", "poke bowl", 4, 21, 10, 11, 7, 1100, [["boiled rice", "beans", "kelp", "tuna"]]],
        ["advCooking", "banh xeo", 4, 26, 17, 10, 4, 1550, [["rice flour", "prime cut", "bean sprout", "crab", "tag_oil"]]],
        ["advCooking", "pineapple friend rice", 5, 20, 9, 12, 12, 720, [["charred pineapple", "boiled rice", "scrap meat"]]],
        ["advCooking", "bear supreme", 6, 6, 22, 23, 9, 1250, [["prime cut", "vegetable medley", "meat stock", "infused oil"]]],
        ["advCooking", "millionaires salad", 6, 18, 6, 6, 26, 1000, [["heart of palm", "cookeina", "papaya", "pineapple"]]],
        ["baking", "baked agave", 1, 14, 2, 4, 8, 700, [["agave leaves"]]],
        ["baking", "baked beet", 1, 10, 1, 2, 15, 700, [["beet"]]],
        ["baking", "baked corn", 1, 12, 3, 2, 11, 700, [["corn"]]],
        ["baking", "baked heart of palm", 1, 12, 6, 4, 6, 700, [["heart of palm"]]],
        ["baking", "baked meat", 1, 0, 17, 13, 0, 700, [["raw meat"]]],
        ["baking", "baked roast", 3, 4, 16, 10, 4, 1000, [["raw roast"]]],
        ["baking", "baked taro", 1, 8, 6, 2, 12, 700, [["taro"]]],
        ["baking", "baked tomato", 1, 16, 1, 5, 6, 700, [["tomato"]]],
        ["baking", "camas bulb bake", 1, 12, 7, 5, 4, 700, [["camas bulb"]]],
        ["baking", "flatbread", 1, 17, 8, 3, 2, 500, [["flour"]]],
        ["baking", "leavened dough", 1, 6, 18, 13, 5, 10, [["flour", "yeast"]]],
        ["baking", "pastry dough", 1, 4, 0, 0, 4, 10, [["flour", "yeast", "tag_fat"]]],
        ["baking", "fruit muffin", 2, 10, 5, 4, 16, 800, [["flour", "tag_fruit"]]],
        ["baking", "roast pumpkin", 3, 23, 2, 2, 7, 1400, [["pumpkin", "sugar"]]],
        ["baking", "bread", 4, 23, 6, 4, 2, 750, [["leavened dough"]]],
        ["baking", "worldly donut", 4, 15, 2, 17, 2, 750, [["sugar", "pastry dough", "tag_oil"]]],
        ["baking", "camas bread", 5, 13, 5, 11, 7, 800, [["camas paste", "leavened dough"]]],
        ["baking", "huckleberry fritter", 5, 16, 0, 20, 8, 900, [["sugar", "pastry dough", "huckleberry extract", "tag_oil"]]],
        ["baking", "huckleberry pie", 5, 13, 5, 10, 16, 1300, [["flour", "huckleberry", "tag_fat"]]],
        ["baking", "meat pie", 5, 18, 4, 20, 2, 1300, [["flour", "scrap meat", "tag_fat"]]],
        ["advBaking", "fruit tart", 1, 22, 3, 9, 14, 800, [["pastry dough", "tag_fruit"]]],
        ["advBaking", "pirozhok", 1, 14, 19, 10, 4, 850, [["pastry dough", "prepared meat", "tag_fungus"]]],
        ["advBaking", "bearclaw", 2, 14, 4, 21, 7, 850, [["pastry dough", "sugar"]]],
        ["advBaking", "hearty hometown pizza", 3, 28, 7, 11, 3, 1200, [["leavened dough", "crimini", "raw sausage", "sun cheese", "tomato"]]],
        ["advBaking", "tasty tropical pizza", 3, 21, 6, 12, 11, 1200, [["leavened dough", "raw bacon", "pineapple", "sun cheese", "tomato"]]],
        ["advBaking", "sensuous sea pizza", 3, 28, 11, 7, 4, 1200, [["leavened dough", "raw fish", "kelp", "sun cheese", "tomato"]]],
        ["advBaking", "fantastic forest pizza", 3, 23, 4, 10, 17, 1250, [["leavened dough", "camas bulb", "sun cheese", "tomato", "tag_greens"]]],
        ["advBaking", "stuffed turkey", 4, 17, 24, 16, 7, 1600, [["prime cut", "bread", "vegetable medley"]]],
        ["advBaking", "macarons", 5, 20, 7, 14, 16, 1000, [["pastry dough", "sugar", "huckleberry extract"]]],
        ["advBaking", "elk wellington", 6, 10, 26, 22, 4, 1450, [["leavened dough", "prime cut"]]],
        ["farming", "bean sprout", 1, 2, 1, 0, 5, 100, [["beans"]]],
        ["farming", "cotton seed", 1, 0, 0, 0, 0, 0, [["cotton boll"]]],
        ["farming", "flax seed", 1, 0, 0, 0, 0, 0, [["flax stem"]]],
        ["farming", "sunflower seed", 1, 0, 0, 0, 0, 0, [["sunflower"]]],
        ["milling", "cereal germ", 1, 5, 0, 7, 3, 20, [["corn"], ["wheat"], ["rice"]]],
        ["milling", "cornmeal", 1, 9, 3, 3, 0, 60, [["corn"]]],
        ["milling", "flour", 1, 15, 0, 0, 0, 50, [["wheat"]]],
        ["milling", "rice flour", 1, 15, 0, 0, 0, 50, [["rice"]]],
        ["milling", "sugar", 1, 15, 0, 0, 0, 50, [["beet"], ["huckleberry"]]],
        ["milling", "oil", 1, 0, 0, 15, 0, 120, [["cotton seed"], ["cereal germ"], ["sunflower seed"], ["tallow"]]],
        ["milling", "camas paste", 2, 3, 2, 10, 0, 60, [["camas bulb"]]],
        ["milling", "huckleberry extract", 2, 0, 0, 0, 15, 60, [["huckleberry"]]],
        ["milling", "simple syrup", 2, 12, 0, 3, 0, 400, [["sugar"]]],
        ["milling", "bean paste", 3, 3, 5, 7, 0, 40, [["beans"]]],
        ["milling", "flaxseed oil", 3, 0, 0, 15, 0, 120, [["flax seed"]]],
        ["milling", "sun cheese", 3, 2, 4, 12, 0, 250, [["sunflower seed", "yeast", "rice", "tag_oil"]]],
        ["milling", "yeast", 4, 0, 8, 0, 7, 60, [["sugar"]]],
        ["milling", "acorn powder", 5, 1, 5, 2, 5, 40, [["acorn"]]],
    ],
    _forReference: {
        multiple: 1,
        gathering: 1,
        farming: 1,
        milling: 1,
        hunting: 1,
        butchering: 1,
        campfire: 1,
        cooking: 1,
        baking: 1,
        advCooking: 1,
        advBaking: 1
    }
};

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
            sources.push(new SourceFood(name, tag, !data.lostSources.includes(name)));
        }
    }

    return sources;
}

function restrictMenu(menu, sources) {
    let totalMeals = menu.length;
    if (debug || restrict) (console.log(`total meals: ${menu.length}`))

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

    // foreach data.lostSources
    // > disable tags - how???
    // > disable sources
    // > disable menu items
    // > append menu items
    // > while (has disabled items)
    // > > disable more menu items
    // > > append menu items
    let lostSources = [...data.lostSources];
    while (lostSources.length > 0) {
        let lost = lostSources[0];
        for (let meal of menu) {

        }
        lostSources.shift();
    }
    // menu = menu.filter(x => x.canCraft(sources));

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
    let fullmenu = getMenu(data.recipeList);
    let sources = getSources(data.tagList);

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