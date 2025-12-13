export interface IUser {
    id?: number;
    username: string;
    firstname: string;
    lastname: string;
    password_digest?: string;
    password?: string;
    created_at?: Date;
}
export declare class User {
    private static readonly BCRYPT_PASSWORD;
    private static readonly SALT_ROUNDS;
    static create(user: IUser): Promise<IUser>;
    static authenticate(username: string, password: string): Promise<IUser | null>;
    static findById(id: number): Promise<IUser | null>;
    static findAll(): Promise<IUser[]>;
}
//# sourceMappingURL=User.d.ts.map