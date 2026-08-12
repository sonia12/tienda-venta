import { timeStamp } from "console";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/browser";
import { Timestamp } from "typeorm/driver/mongodb/bson.typings.js";
import { Order } from "../../order/entities/order.entity";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({ type: 'varchar', length: 100, nullable:false })
    name!: string

    @Column({ type: 'varchar', length: 100 })
    lastnaame!:string

    @Column({ type: 'varchar', length: 50, nullable:false })
    title!: string

    @Column({ type: 'timestamp', default:()=>'current_timestamp'})
    hire_date!: Date

    @Column({ type: 'varchar', length: 100 })
    adress!: string

    @Column({ type: 'varchar', length: 15, nullable:false })
    phone!: string

    @ManyToOne(
        () => Employee, 
        (employee) => employee.subordinates, 
        { nullable: true,} 
    )
    
    @JoinColumn({ name: 'report_to' })
    reportTo?: Employee;

    @OneToMany(
        () => Employee, 
        (employee) => employee.reportTo
    )
    subordinates!: Employee[];


    @OneToMany(
        ()=> Order,
        (order)=>order.emplOrder
    )
    ordEmployee!: Order[]
}
