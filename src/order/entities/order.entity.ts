import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Customer } from "../../customer/entities/customer.entity";


import { OrderDetail } from "../../order_detail/entities/order_detail.entity";
import e from "express";
import { User } from "../../auth/entities/user.entity";

export enum orders_status{
    PENDING = 'pending',
    COMPLETE = 'complete',
    CANCEL = 'cancel'

}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string 

    @Column({type:'timestamp', default: ()=>'current_timestamp'})
    date!: Date

    @Column('uuid', {nullable: true})
    id_customer!: string | null

    @Column('uuid')
    id_employee!: string

    @Column({type: 'numeric', precision:10, scale: 2, default: 0})
    total_amount!:number

    @Column({type:'enum', enum: orders_status, default: orders_status.PENDING})
    status!: orders_status

   
    @ManyToOne(
        ()=>Customer,
        (customer)=>customer.customerOrders,
        {cascade: true, nullable: true}
    )
    @JoinColumn({name:'id_customer'})
    custOrder!: Customer | null


   

    
    @OneToMany(
        ()=>OrderDetail,
        (orderdetail)=>orderdetail.orderOrder_detail
    )
    detailOrder!: OrderDetail []

    
    @ManyToOne(
            ()=>User,
            (user)=>user.order,
           
        )
    @JoinColumn({ name: 'id_employee' })
    user!:User

}
