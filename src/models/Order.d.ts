export interface IOrder {
    id?: number;
    user_id: number;
    status: 'active' | 'complete';
    created_at?: Date;
}
export declare class Order {
    static create(order: IOrder): Promise<IOrder>;
    static findById(id: number): Promise<IOrder | null>;
    static findByUser(userId: number, status?: 'active' | 'complete'): Promise<IOrder[]>;
    static updateStatus(id: number, status: 'active' | 'complete'): Promise<IOrder>;
    static delete(id: number): Promise<void>;
}
//# sourceMappingURL=Order.d.ts.map