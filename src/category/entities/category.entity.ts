import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length: 100})
    name!: string

    @Column({type:'varchar', length: 50})
    description!: string
}
