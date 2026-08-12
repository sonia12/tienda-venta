import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "../../order/entities/order.entity"

@Entity()
export class Customer {

    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length: 200, nullable:false})
    name!: string

    @Column({type:'varchar', length: 15})
    phone!: string


    @OneToMany(
        ()=>Order,
        (order)=>order.custOrder
    )
    orderCust!: Order[]
}
