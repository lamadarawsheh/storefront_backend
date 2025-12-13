export interface IOrderProduct {
    id?: number;
    order_id: number;
    product_id: number;
    quantity: number;
    created_at?: Date;
}
export declare class OrderProduct {
    static addProduct(orderProduct: IOrderProduct): Promise<IOrderProduct>;
    static getOrderProducts(orderId: number): Promise<IOrderProduct[]>;
    static updateQuantity(orderId: number, productId: number, quantity: number): Promise<IOrderProduct>;
    static removeProduct(orderId: number, productId: number): Promise<void>;
    static getByOrderAndProduct(orderId: number, productId: number): Promise<IOrderProduct | null>;
}
//# sourceMappingURL=OrderProducts.d.ts.map