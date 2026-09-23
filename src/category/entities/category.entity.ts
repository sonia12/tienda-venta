import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "../../product/entities/product.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    
    @Column({type:'varchar', length: 100, unique:true})
    name!: string

    @Column({type:'varchar', length: 500, nullable: true})
    description!: string


    @OneToMany(
        ()=>Product,
        (product)=> product.categoryProd
    )
    prodCategory!:Product[]
}
