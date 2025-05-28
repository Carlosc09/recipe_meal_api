const request = require('supertest');
const express = require('express');
const router = require('./recipe.routes');

// Mock the database functions
jest.mock('../database/database', () => ({
    getRecipeById: jest.fn(),
    getAllRecipes: jest.fn(),
    createRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
}));

const {
    getRecipeById,
    getAllRecipes,
    createRecipe,
    deleteRecipe,
} = require('../database/database');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Recipe Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/recipe', () => {
        it('should return all recipes', async () => {
            const recipes = [
                { id: 1, name: 'A', ingredients: 'x', category: 'dinner', prep_Time: 10 },
                { id: 2, name: 'B', ingredients: 'y', category: 'lunch', prep_Time: 20 },
            ];
            getAllRecipes.mockResolvedValue(recipes);

            const res = await request(app).get('/api/recipe');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(recipes);
            expect(getAllRecipes).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            getAllRecipes.mockRejectedValue('DB error');
            const res = await request(app).get('/api/recipe');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('GET /api/recipe/:id', () => {
        it('should return a recipe by id', async () => {
            const recipe = { id: 1, name: 'A', ingredients: 'x', category: 'dinner', prep_Time: 10 };
            getRecipeById.mockResolvedValue(recipe);

            const res = await request(app).get('/api/recipe/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(recipe);
            expect(getRecipeById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if recipe not found', async () => {
            getRecipeById.mockResolvedValue(undefined);

            const res = await request(app).get('/api/recipe/999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Recipe not found' });
        });

        it('should handle errors', async () => {
            getRecipeById.mockRejectedValue('DB error');
            const res = await request(app).get('/api/recipe/1');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('POST /api/recipe', () => {
        it('should create a new recipe', async () => {
            const newRecipe = {
                name: 'New Recipe',
                ingredients: 'ingredient1, ingredient2',
                instructions: 'Cooking instructions',
                category: 'lunch',
                prep_Time: 20,
            };
            const createdRecipe = { ...newRecipe, id: 4 };
            createRecipe.mockResolvedValue(createdRecipe);

            const res = await request(app).post('/api/recipe').send(newRecipe);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({
                message: 'Recipe created successfully',
                recipe: createdRecipe,
            });
            expect(createRecipe).toHaveBeenCalledWith(newRecipe);
        });

        it('should handle errors', async () => {
            createRecipe.mockRejectedValue('DB error');
            const res = await request(app).post('/api/recipe').send({});
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('DELETE /api/recipe/:id', () => {
        it('should delete a recipe', async () => {
            deleteRecipe.mockResolvedValue({ changes: 1 });

            const res = await request(app).delete('/api/recipe/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Recipe deleted successfully' });
            expect(deleteRecipe).toHaveBeenCalledWith('1');
        });

        it('should return 404 if recipe not found', async () => {
            deleteRecipe.mockResolvedValue({ changes: 0 });

            const res = await request(app).delete('/api/recipe/999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Recipe not found' });
        });

        it('should handle errors', async () => {
            deleteRecipe.mockRejectedValue('DB error');
            const res = await request(app).delete('/api/recipe/1');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });
});