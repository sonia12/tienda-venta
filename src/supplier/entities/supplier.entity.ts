import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { User } from "../../auth/entities/user.entity";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type:'varchar', length:100})
    name!: string

    @Column('varchar', { unique: true, nullable: true }) 
    nit!: string;

    @Column({type:'varchar', length:200, nullable: true})
    address!: string

    @Column({type:'varchar', length:50, nullable: true})
    city!: string

    @Column({type:'varchar', length:15, nullable: true})
    phone!: string

    @Column({ type: 'bool', default: true })
    isActive!: boolean;

    
    @OneToMany(
        ()=>Product,
        (producto)=>producto.supplierProd
    )
    ProdSupplier!: Product []

    @ManyToOne(
            ()=>User,
            (user)=>user.supplier,
           
        )
        user!:User

}
