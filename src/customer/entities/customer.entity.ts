import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "../../order/entities/order.entity"

@Entity()
export class Customer {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type:'varchar', length: 200})
    name!: string

    @Column({type:'varchar', length: 15, unique: true, nullable: true})
    phone!: string


    @OneToMany(
        ()=>Order,
        (order)=>order.custOrder
    )
    orderCust!: Order[]
}
