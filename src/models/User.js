"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class User {
    static BCRYPT_PASSWORD = process.env.BCRYPT_PASSWORD || '';
    static SALT_ROUNDS = process.env.SALT_ROUNDS || '10';
    static async create(user) {
        const { username, firstname, lastname, password } = user;
        if (!password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt_1.default.hash(password + this.BCRYPT_PASSWORD, parseInt(this.SALT_ROUNDS));
        try {
            const sql = `
        INSERT INTO users (username, firstname, lastname, password_digest)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, firstname, lastname
      `;
            const result = await database_1.default.query(sql, [
                username,
                firstname,
                lastname,
                hashedPassword,
            ]);
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not create user ${username}. Error: ${err}`);
        }
    }
    static async authenticate(username, password) {
        try {
            const sql = 'SELECT * FROM users WHERE username=($1)';
            const result = await database_1.default.query(sql, [username]);
            if (result.rows.length) {
                const user = result.rows[0];
                const isPasswordValid = await bcrypt_1.default.compare(password + this.BCRYPT_PASSWORD, user.password_digest);
                if (isPasswordValid) {
                    delete user.password_digest;
                    return user;
                }
            }
            return null;
        }
        catch (err) {
            throw new Error(`Could not authenticate user ${username}. Error: ${err}`);
        }
    }
    static async findById(id) {
        try {
            const sql = 'SELECT id, username, firstname, lastname FROM users WHERE id=($1)';
            const result = await database_1.default.query(sql, [id]);
            return result.rows[0] || null;
        }
        catch (err) {
            throw new Error(`Could not find user ${id}. Error: ${err}`);
        }
    }
    static async findAll() {
        try {
            const sql = 'SELECT id, username, firstname, lastname FROM users';
            const result = await database_1.default.query(sql);
            return result.rows;
        }
        catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        }
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map