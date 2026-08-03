import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Timestamp } from "typeorm/driver/mongodb/bson.typings.js";

@Entity()
export class Order {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number 


    date!: Timestamp

    @Column({type:'int'})
    id_customer!: number

    @Column({type:'int'})
    id_employee!: number
}
