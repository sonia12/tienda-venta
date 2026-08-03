import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length:'100'})
    name!: string

    @Column({type: 'numeric'})
    unit_cost!: number

    @Column({type: 'numeric'})
    unit_price!: number

    @Column({type: 'int'})
    unit_stock!: number

    @Column({type: 'int'})
    quantity_per_unit!: number

    @Column({type: 'int'})
    id_category!: number

     @Column({type: 'int'})
    id_supplier!: number

}
