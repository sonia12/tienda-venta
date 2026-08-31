import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Timestamp } from "typeorm/driver/mongodb/bson.typings.js";
import { Customer } from "../../customer/entities/customer.entity";
import { join } from "path";
import { Employee } from "../../employee/entities/employee.entity";
import { OrderDetail } from "../../order_detail/entities/order_detail.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number 

    @Column({type:'timestamp', default: ()=>'current_timestamp'})
    date!: Date

   
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
