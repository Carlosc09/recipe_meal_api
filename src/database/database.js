const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = ':memory:';
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
});

// recipes: ["id": int, "name": string, "ingredients": text, "category": text, "prep_time": int];
// meal_plans: [id: int, name: string, date: string, recipe_ids: text, notes: string];

db.serialize(() => {
    // Create tables
    db.run('PRAGMA foreign_keys = ON;');

    db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        instructions TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        prep_time INTEGER NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating recipes table:', err.message);
        } else {
            console.log('Recipes table created successfully.');
        }
    });

    // Insert sample data into recipes table
    const sampleRecipes = [
        {
            name: 'Spaghetti Bolognese',
            ingredients: 'spaghetti, minced meat, tomato sauce',
            instructions: 'Cook spaghetti, prepare sauce, mix together.',
            category: 'dinner',
            prep_time: 30
        },
        {
            name: 'Caesar Salad',
            ingredients: 'romaine lettuce, croutons, Caesar dressing',
            instructions: 'Toss lettuce with dressing and croutons.',
            category: 'lunch',
            prep_time: 15
        },
        {
            name: 'Chicken Curry',
            ingredients: 'chicken, curry powder, coconut milk',
            instructions: 'Cook chicken, add curry powder and coconut milk.',
            category: 'dinner',
            prep_time: 40
        },
        {
            name: 'Vegetable Stir Fry',
            ingredients: 'mixed vegetables, soy sauce, garlic',
            instructions: 'Stir fry vegetables with soy sauce and garlic.',
            category: 'lunch',
            prep_time: 20
        }
    ];

    const insert = db.prepare(`INSERT INTO recipes (name, category, instructions, ingredients, prep_time)
       VALUES (?, ?, ?, ?, ?)`);

    sampleRecipes.forEach(recipe => {
        try {
            insert.run([
                recipe.name,
                recipe.category,
                recipe.instructions,
                recipe.ingredients,
                recipe.prep_time
            ]);
        } catch (error) {
            console.error('Error inserting sample recipe:', error);
        }
    });

    insert.finalize((err) => {
        if (err) {
            console.error('Error finalizing insert statement:', err);
        } else {
            console.log('Sample recipes inserted successfully.');
        }
    });
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS meal_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        recipe_ids TEXT NOT NULL,
        notes TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating meal_plans table:', err.message);
        } else {
            console.log('Meal plans table created successfully.');
        }
    });

    const sampleMealPlans = [
        {
            name: 'Weekly Dinner Plan',
            date: '2023-10-01',
            recipe_ids: '[1, 2]',
            notes: 'Includes spaghetti bolognese'
        },
        {
            name: 'Weekly Lunch Plan',
            date: '2023-10-01',
            recipe_ids: '[3, 4]',
            notes: 'Includes Caesar salad and vegetable stir fry'
        }
    ];

    const insertMeal = db.prepare(`INSERT INTO meal_plans (name, date, recipe_ids, notes) VALUES (?, ?, ?, ?)`);

    sampleMealPlans.forEach(mealPlan => {
        try {
            insertMeal.run([
                mealPlan.name,
                mealPlan.date,
                mealPlan.recipe_ids,
                mealPlan.notes
            ]);
        } catch (error) {
            console.error('Error inserting sample meal plan:', error);
        }
    });

    insertMeal.finalize((err) => {
        if (err) {
            console.error('Error finalizing meal plan insert:', err);
        } else {
            console.log('Sample meal plan inserted successfully.');
        }
    });
});

const waitForDatabase = () => {
    return new Promise((resolve, reject) => {
        const checkTable = () => {
            db.get("SELECT count(*) as count from recipes", [], (err, result) => {
                if (!err && result && result.count > 0) {
                    resolve();
                } else {
                    setTimeout(checkTable, 100); // Check again after 100ms
                }
            });
        };
        checkTable();
    });
}

const getAllRecipes = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM recipes', [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

const getRecipeById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
};

const createRecipe = (recipe) => {
    return new Promise((resolve, reject) => {
        const { name, category, instructions, ingredients, prep_time } = recipe;
        let query = `INSERT INTO recipes (name, category, instructions, ingredients, prep_time)
            VALUES (?, ?, ?, ?, ?)`;
        db.run(query,[name, category, instructions, ingredients, prep_time],
            function (err) {
                if (err) {
                    reject(err);
                }
                resolve({
                    id: this.lastID,
                    name,
                    category,
                    instructions,
                    ingredients,
                    prep_time
                });
            }
        );
    });
};

const deleteRecipe = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM recipes WHERE id = ?', [id], function (err) {
            if (err) {
                reject(err);
            }
            resolve({ changes: this.changes });
        });
    });
};

const getAllMealPlans = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM meal_plans', [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

const getMealPlanById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM meal_plans WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
};

const createMealPlan = (mealPlan) => {
    return new Promise((resolve, reject) => {
        const { name, date, recipe_ids, notes } = mealPlan;
        db.run(
            `INSERT INTO meal_plans (name, date, recipe_ids, notes) VALUES (?, ?, ?, ?)`,
            [name, date, recipe_ids, notes],
            function (err) {
                if (err) {
                    reject(err);
                }
                resolve({
                    id: this.lastID,
                    name,
                    date,
                    recipe_ids,
                    notes
                });
            }
        );
    });
};

const deleteMealPlan = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM meal_plans WHERE id = ?', [id], function (err) {
            if (err) { 
                reject(err);
            }
            resolve({ changes: this.changes });
        });
    });
};

module.exports = {
    db,
    waitForDatabase,
    getAllRecipes,
    getRecipeById,
    createRecipe,
    deleteRecipe,
    getAllMealPlans,
    getMealPlanById,
    createMealPlan,
    deleteMealPlan,
};
