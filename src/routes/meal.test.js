const request = require('supertest');
const express = require('express');
const mealRoutes = require('./meal.routes');

// Mock database functions
jest.mock('../database/database', () => ({
    getAllMealPlans: jest.fn(),
    getMealPlanById: jest.fn(),
    createMealPlan: jest.fn(),
    deleteMealPlan: jest.fn(),
}));

const {
    getAllMealPlans,
    getMealPlanById,
    createMealPlan,
    deleteMealPlan,
} = require('../database/database');

const app = express();
app.use(express.json());
app.use('/api', mealRoutes);

describe('Meal Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/meal_plans', () => {
        it('should return all meal plans', async () => {
            const mockData = [
                { id: 1, name: 'Plan 1', date: '2023-10-01', recipe_id: 1, notes: 'Test' }
            ];
            getAllMealPlans.mockResolvedValue(mockData);

            const res = await request(app).get('/api/meal_plans');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
            expect(getAllMealPlans).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            getAllMealPlans.mockRejectedValue('DB error');
            const res = await request(app).get('/api/meal_plans');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('GET /api/meal_plans/:id', () => {
        it('should return a meal plan by id', async () => {
            const mockMealPlan = { id: 1, name: 'Plan', date: '2023-10-01', recipe_ids: [1,2], notes: 'Test' };
            getMealPlanById.mockResolvedValue(mockMealPlan);

            const res = await request(app).get('/api/meal_plans/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMealPlan);
            expect(getMealPlanById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if meal plan not found', async () => {
            getMealPlanById.mockResolvedValue(null);

            const res = await request(app).get('/api/meal_plans/999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Meal plan not found' });
        });

        it('should handle errors', async () => {
            getMealPlanById.mockRejectedValue('DB error');
            const res = await request(app).get('/api/meal_plans/1');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('POST /api/meal_plans', () => {
        it('should create a new meal plan', async () => {
            const reqBody = {
                name: 'Weekly Dinner Plan',
                date: '2023-10-01',
                recipe_ids: [1, 2],
                notes: 'Includes spaghetti bolognese'
            };
            const createdMealPlan = { id: 1, ...reqBody };
            createMealPlan.mockResolvedValue(createdMealPlan);

            const res = await request(app).post('/api/meal_plans').send(reqBody);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({
                message: 'Meal plan created successfully',
                meal_plan: createdMealPlan
            });
            expect(createMealPlan).toHaveBeenCalledWith(reqBody);
        });

        it('should handle errors', async () => {
            createMealPlan.mockRejectedValue('DB error');
            const res = await request(app).post('/api/meal_plans').send({});
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('DELETE /api/meal_plans/:id', () => {
        it('should delete a meal plan', async () => {
            deleteMealPlan.mockResolvedValue();

            const res = await request(app).delete('/api/meal_plans/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Meal plan deleted successfully' });
            expect(deleteMealPlan).toHaveBeenCalledWith('1');
        });

        it('should return 404 if meal plan not found', async () => {
            const error = new Error('Meal plan not found');
            deleteMealPlan.mockRejectedValue(error);

            const res = await request(app).delete('/api/meal_plans/999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Meal plan not found' });
        });

        it('should handle other errors', async () => {
            deleteMealPlan.mockRejectedValue('DB error');
            const res = await request(app).delete('/api/meal_plans/1');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });
});