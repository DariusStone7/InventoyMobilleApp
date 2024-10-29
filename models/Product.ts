export default class Product {
    private id: string;
    private name: string;
    private conditionment: string;
    private quantity: number;

    public constructor(id: string, name: string, conditionment: string, quantity: number){
        this.id = id;
        this.name = name;
        this.conditionment = conditionment;
        this.quantity = quantity;
    }

    public getId(): string{
        return this.id;
    }
    public getName(): string{
        return this.name;
    }
    public getCondtionment(): string{
        return this.conditionment;
    }
    public getQuantity(): number{
        return this.quantity;
    }

    public setQuantity(quantity: number): void{
        this.quantity = quantity;
    }

}
