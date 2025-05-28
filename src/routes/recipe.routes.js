const express = require('express');
const router = express.Router();
const {
    getRecipeById,
    getAllRecipes,
    createRecipe,
    deleteRecipe
} = require('../database/database');

/*
 GET @ /api/recipes
    Returns all recipes with optional category filtering.
    query parameters:
    - category: (optional) Filter recipes by category.
    expected format:
    [
        {
            "id": 1,
            "name": "Spaghetti Bolognese",
            "ingredients": "spaghetti, ground beef, tomato sauce, onion, garlic",
            "category": "dinner",
            "prep_Time": 30
        },
        ...
    ]
*/

router.get('/recipe', async (req, res) => {
    try {
        let data = await getAllRecipes();
        res.json(data);
    } catch (err) {
        return res.status(500).json({ error: err });
    }
});

/*
GET @ /api/recipe/:id
Returns a single recipe.
If the recipe is not found, returns a 404 error.
expected format:
    {
        "id": 1,
        "name": "Spaghetti Bolognese",
        "ingredients": "spaghetti, ground beef, tomato sauce, onion, garlic",
        "category": "dinner",
        "prep_Time": 30
    }
*/
router.get('/recipe/:id', (req, res) => {
    const id = req.params?.id;
    getRecipeById(id).then(data => {
        if (!data) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

/*
POST @ /api/recipe
Add a new recipe.
Req body Example:
{
    "name": "New Recipe",
    "ingredients": "ingredient1, ingredient2",
    "instructions": "Cooking instructions",
    "category": "lunch",
    "prep_Time": 20
}
response:
{
    message: "Recipe created successfully",
    recipe: {
        "id": 4,
        "name": "New Recipe",
        "ingredients": "ingredient1, ingredient2",
        "instructions": "Cooking instructions",
        "category": "lunch",
        "prep_Time": 20
    }
}
*/
router.post('/recipe', (req, res) => {
    createRecipe(req?.body).then(recipe => {
        res.status(201).json({
            message: 'Recipe created successfully',
            recipe
        });
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

/*
DELETE @ /api/recipe/:id
Delete a recipe by ID.
Response:
{
    message: "Recipe deleted successfully"
}
NOTE: If the recipe is not found, returns a status 404 with error message.
*/
router.delete('/recipe/:id', (req, res) => {
    const id = req.params?.id;
    deleteRecipe(id).then(result => {
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

module.exports = router;

