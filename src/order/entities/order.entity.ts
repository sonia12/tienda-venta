import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Customer } from "../../customer/entities/customer.entity";

import { Employee } from "../../employee/entities/employee.entity";
import { OrderDetail } from "../../order_detail/entities/order_detail.entity";
import e from "express";

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

    @Column('uuid')
    id_customer!: string

    @Column('uuid')
    id_employee!: string

    @Column({type: 'numeric', precision:10, scale: 2, default: 0})
    total_amount!:number

    @Column({type:'enum', enum: orders_status, default: orders_status.PENDING})
    status!: orders_status

   
    @ManyToOne(
        ()=>Customer,
        (customer)=>customer.orderCust,
        {cascade: true}
    )
    @JoinColumn({name:'id_customer'})
    custOrder!: Customer


    @ManyToOne(
        ()=>Employee,
        (employee)=>employee.ordEmployee,
        {cascade:true}
    )
    @JoinColumn({name:'id_employee'})
    emplOrder!:Employee

    
    @OneToMany(
        ()=>OrderDetail,
        (orderdetail)=>orderdetail.orderOrder_detail
    )
    detailOrder!: OrderDetail

}
