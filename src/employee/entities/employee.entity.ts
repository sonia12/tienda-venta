import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/browser";
import { Order } from "../../order/entities/order.entity";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'varchar', length: 100 })
    name!: string

    @Column({ type: 'varchar', length: 100 })
    lastname!:string

    @Column({ type: 'varchar', length: 500, nullable: true })
    title?: string

    @Column({ type: 'date', default: ()=>'current_date'})
    hire_date?: Date

    @Column({ type: 'varchar', length: 100, nullable: true })
    address?: string

    @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
    phone?: string

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
