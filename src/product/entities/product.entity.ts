import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Supplier } from "../../supplier/entities/supplier.entity";
import { Category } from "../../category/entities/category.entity";
import { OrderDetail } from "../../order_detail/entities/order_detail.entity";
import { OneToMany } from "typeorm/browser";

@Entity()
export class Product {
    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'varchar', length:'100'})
    name!: string

    @Column({type: 'numeric'})
    unit_cost!: number

    @Column({type: 'numeric'})
    unit_price!: number

    @Column({type: 'int'})
    unit_stock!: number

    @Column({type: 'int'})
    quantity_per_unit!: number

    @Column()
    id_category!: number;

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
