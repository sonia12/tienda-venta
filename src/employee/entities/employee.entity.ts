import { Column, Entity } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/browser";
import { Timestamp } from "typeorm/driver/mongodb/bson.typings.js";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({ type: 'varchar', length: 100 })
    name!: string

    @Column({ type: 'varchar', length: 100 })
    lastnaame!:string

    @Column({ type: 'varchar', length: 50 })
    title!: string


    hire_date!: Timestamp

    @Column({ type: 'varchar', length: 100 })
    adress!: string

    @Column({ type: 'varchar', length: 15 })
    phone!: string

    @Column({ type: 'int' })
    report_to!: number
}
