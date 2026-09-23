import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type:'varchar', length:100})
    name!: string

    @Column({type:'varchar', length:200, nullable: true})
    address!: string

    @Column({type:'varchar', length:50, nullable: true})
    city!: string

    @Column({type:'varchar', length:15, unique: true, nullable: true})
    phone!: string

    
    @OneToMany(
        ()=>Product,
        (producto)=>producto.categoryProd
    )
    ProdSupplier!: Product []

}
