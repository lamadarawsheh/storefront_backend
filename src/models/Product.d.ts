export interface IProduct {
    id?: number;
    name: string;
    price: number;
    category?: string;
    created_at?: Date;
}
export declare class Product {
    static create(product: IProduct): Promise<IProduct>;
    static findById(id: number): Promise<IProduct | null>;
    static findAll(): Promise<IProduct[]>;
    static update(id: number, updates: Partial<IProduct>): Promise<IProduct>;
    static delete(id: number): Promise<void>;
}
//# sourceMappingURL=Product.d.ts.map