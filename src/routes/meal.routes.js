const express = require('express');
const router = express.Router();
const {
    getAllMealPlans,
    getMealPlanById,
    createMealPlan,
    deleteMealPlan,
} = require('../database/database');

/*
GET @ /api/meal-plans
Returns all meal plans.
Expected format:
[
    {
        "id": 1,
        "name": "Weekly Dinner Plan",
        "date": "2023-10-01",
        "recipe_id": 1,
        "notes": "Includes spaghetti bolognese"
    },
    ...
]
*/
router.get('/meal_plans', (req, res) => {
    getAllMealPlans().then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

/*
GET @ /api/meal-plans/:id
If the meal plan is not found, returns a 404 error.
Expected format:
{
    "id": 1,
    "name": "Weekly Dinner Plan",
    "date": "2023-10-01",
    "recipe_ids": [1, 2],
    "notes": "Includes spaghetti bolognese"
}
*/
router.get('/meal_plans/:id', (req, res) => {
    const id = req.params?.id;
    getMealPlanById(id).then(data => {
        if (!data) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

/*
POST @ /api/meal-plans
Create a new meal plan.
Request body example:
{
    "name": "Weekly Dinner Plan",
    "date": "2023-10-01",
    "recipe_ids": [1, 2],
    "notes": "Includes spaghetti bolognese"
}
Response:
{
    message: "Meal plan created successfully",
    meal_plan: {
        "id": 1,
        "name": "Weekly Dinner Plan",
        "date": "2023-10-01",
        "recipe_ids": [1, 2],
        "notes": "Includes spaghetti bolognese"
    }
}
*/

router.post('/meal_plans', (req, res) => {
    createMealPlan(req.body).then(mealPlan => {
        res.status(201).json({
            message: 'Meal plan created successfully',
            meal_plan: mealPlan
        });
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});



/*
DELETE @ /api/meal-plans/id
Delete a meal plan.
Response:
{
    message: "Meal plan deleted successfully"
}
NOTE: If the meal plan is not found, returns a status 404 with error message.
*/
router.delete('/meal_plans/:id', (req, res) => {
    const id = req.params?.id;
    deleteMealPlan(id).then(() => {
        res.json({ message: 'Meal plan deleted successfully' });
    }).catch(err => {
        if (err.message === 'Meal plan not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err });
    });
});

module.exports = router;
