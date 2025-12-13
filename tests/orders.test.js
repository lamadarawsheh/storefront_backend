"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app")); // your Express app
describe('POST /orders', () => {
    let token;
    beforeAll(async () => {
        // login to get JWT token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/users/login')
            .send({ email: 'test@example.com', password: 'testpassword' });
        token = loginRes.body.token;
    });
    it('should reject requests without token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/orders')
            .send({ /* order data */});
        expect(res.status).toBe(401);
    });
    it('should accept requests with valid token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ /* order data */});
        expect(res.status).toBe(201);
    });
});
//# sourceMappingURL=orders.test.js.map