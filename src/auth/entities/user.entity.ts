import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles } from "../enums/valid-roles.enum";
import { Category } from "../../category/entities/category.entity";
import { Customer } from "../../customer/entities/customer.entity";

import { Order } from "../../order/entities/order.entity";
import { Product } from "../../product/entities/product.entity";
import { Supplier } from "../../supplier/entities/supplier.entity";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column('text', {unique:true})
    email!: string

    @Column('text', {select: false})
    password!: string

    @Column('text')
    fullname!: string

    @Column('bool', {default: true})
    isActive!: boolean

    @Column('text', {array:true})
    roles!: ValidRoles[]

    @Column({ type: 'date', default: ()=>'current_date'})
    hire_date!: Date

    @Column({ type: 'varchar', length: 100, nullable: true })
    address!: string

    @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
    phone!: string

    @ManyToOne(
      () => User, 
      (user) => user.subordinates, 
      { nullable: true,} 
        )
        
      reportTo?: User;
    
   @OneToMany(
      () => User, 
      (user) => user.reportTo
        )
      subordinates!: User[];

    @OneToMany(
        ()=>Category,
        (category)=>category.user,
    )
    category!:Category


    @OneToMany(
       ()=>Customer,
       (customer)=>customer.user 
    )
    customer!:Customer

    


    @OneToMany(
       ()=>Order,
       (order)=>order.user 
    )
    order!:Order

     @OneToMany(
       ()=>Product,
       (product)=>product.user 
    )
    product!:Product


    @OneToMany(
       ()=>Supplier,
       (supplier)=>supplier.user 
    )
    supplier!:Supplier


}
