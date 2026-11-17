import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "../../order/entities/order.entity"
import { User } from "../../auth/entities/user.entity";

@Entity()
export class Customer {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type:'varchar', length: 200, nullable: true})
    name?: string

    @Column('varchar', { length: 100, nullable: true })
    email?: string;

    @Column({type:'varchar', length: 15,  nullable: true})
    phone?: string

    @Column('varchar', {
    unique: true, nullable: true})
    ci?: string

    


    @OneToMany(
        ()=>Order,
        (order)=>order.custOrder
    )
    customerOrders!: Order[]

    @ManyToOne(
        ()=>User,
        (user)=>user.category
    )
    user!:User
}
