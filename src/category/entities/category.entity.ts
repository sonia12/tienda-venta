import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "../../product/entities/product.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    
    @Column({type:'varchar', length: 100, unique:true, nullable:false})
    name!: string

    @Column({type:'varchar', length: 50})
    description!: string


    @OneToMany(
        ()=>Product,
        (product)=> product.categoryProd
    )
    prodCategory!:Product[]
}
