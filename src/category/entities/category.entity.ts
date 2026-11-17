import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "../../product/entities/product.entity"
import { User } from "../../auth/entities/user.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    
    @Column({type:'varchar', length: 100, unique:true})
    name!: string

    @Column({type:'varchar', length: 500, nullable: true})
    description!: string

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @OneToMany(
        ()=>Product,
        (product)=> product.categoryProd
    )
    products!:Product[]

    @ManyToOne(
        ()=>User,
        (user)=>user.category,
       
    )
    user!:User
}
