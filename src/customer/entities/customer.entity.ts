import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Customer {

    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length: 200})
    name!: string

    @Column({type:'varchar', length: 15})
    phone!: string
}
