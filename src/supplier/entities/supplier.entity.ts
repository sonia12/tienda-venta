import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length:100, unique: true, nullable: false})
    name!: string

    @Column({type:'varchar', length:200})
    address!: string

    @Column({type:'varchar', length:50})
    city!: string

    @Column({type:'varchar', length:15, nullable: false, unique: true})
    phone!: string

    
    @OneToMany(
        ()=>Product,
        (producto)=>producto.categoryProd
    )
    ProdSupplier!: Product []

}
