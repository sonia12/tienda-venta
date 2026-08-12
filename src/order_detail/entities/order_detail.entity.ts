import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Order } from "../../order/entities/order.entity";

@Entity()
export class OrderDetail {

    @PrimaryGeneratedColumn({type:'int'})
    id!: number

    @Column({type:'numeric', precision:10, scale:2})
    unit_price!: number

    @Column({type:'numeric', precision:10, scale:2})
    unit_cost!: number

    @Column({type:'int'})
    quantity!: number 

    @Column({type:'numeric', precision:5, scale:2})
    discount!: number

    @ManyToOne(
        ()=>Product,
        (product)=>product.orderProd,
        {cascade: true}
    )
    @JoinColumn({name:'id_product'})
    prodOrder_datail!: Product

    
    @ManyToOne(
        ()=>Order,
        (order)=>order.detailOrder,
        {cascade: true}
    )
    @JoinColumn({name:'id_order'})
    orderOrder_detail!:Order
}
