import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Supplier } from "../../supplier/entities/supplier.entity";
import { Category } from "../../category/entities/category.entity";
import { OrderDetail } from "../../order_detail/entities/order_detail.entity";
import { OneToMany } from "typeorm/browser";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type:'varchar', length:'100'})
    name!: string

    @Column({type: 'numeric', precision:10, scale: 2})
    unit_cost!: number

    @Column({type: 'numeric', precision:10, scale: 2,})
    unit_price!: number

    @Column({type: 'int', default:0,})
    unit_stock!: number

    @Column({type: 'int', default:1,})
    quantity_per_unit!: number

    @Column('uuid')
    id_category!: string

    @Column('uuid')
    id_supplier!: string;

    @ManyToOne(
        ()=>Supplier,
        (supplier) => supplier.ProdSupplier,
        {cascade: true}
    )
    @JoinColumn({name:'id_supplier'})
    supplierProd!:Supplier



    @ManyToOne(
        ()=>Category,
        (category)=>category.prodCategory,
        {cascade: true}
    )
    @JoinColumn({name:'id_category'})
    categoryProd!: Category

    
    @OneToMany(
        ()=>OrderDetail,
        (OrderDetail)=>OrderDetail.prodOrder_datail
    )
    orderProd!:OrderDetail

}
