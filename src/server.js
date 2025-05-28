const express = require('express');
const app = express();
const recipe = require('./routes/recipe.routes.js');
const meal = require('./routes/meal.routes.js');

let HTTP_PORT = 8000;


app.listen(HTTP_PORT, () => {
    console.log('server running on port')
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Ok'
    });
});

// GET /api/recipes?category=dinner
// GET /api/recipes/{id} return a single recipe, if not found return 404
// POST /api/recipes create a new recipe, return 201
// POST /api/meal-plans create a new meal plan, return 201
// GET /api/meal-plans all meal plan, if not found return 404
// DELETE /api/meal-plans/{id} delete a meal plan, if not found return 400

app.use('/api', recipe);
app.use('/api', meal);

app.use((req, res, next) => {
    res.status(404);
});

module.exports = { app };