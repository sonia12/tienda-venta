import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length:100})
    name!: string

    @Column({type:'varchar', length:200})
    address!: string

    @Column({type:'varchar', length:50})
    city!: string

    @Column({type:'varchar', length:15})
    phone!: string

}
