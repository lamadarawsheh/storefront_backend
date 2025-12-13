"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app")); // your Express app
describe('POST /users/login', () => {
    it('should login user and return JWT token', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/users/login')
            .send({ email: 'test@example.com', password: 'testpassword' });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
    it('should fail with invalid credentials', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/users/login')
            .send({ email: 'wrong@example.com', password: 'wrongpassword' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid credentials');
    });
});
//# sourceMappingURL=user.test.js.map