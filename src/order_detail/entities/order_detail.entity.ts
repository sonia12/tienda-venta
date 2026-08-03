import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OrderDetail {

    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'int'})
    id_product!: number

    @Column({type:'int'})
    id_order!: number

    @Column({type:'numeric', precision:10, scale:2})
    unit_price!: number

    @Column({type:'numeric', precision:10, scale:2})
    unit_cost!: number

    @Column({type:'int'})
    quantity!: number 

    @Column({type:'numeric', precision:5, scale:2})
    discount!: number
}
