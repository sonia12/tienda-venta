import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { OptionAuthGuard } from '../auth/guards/optionalAuth.guard';
import { User } from '../auth/entities/user.entity';
import { IncrementStockDto } from './dto/increment-stock.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  create(@Body() createProductDto: CreateProductDto, @GetUser() user:User) {
    return this.productService.create(createProductDto, user);
  }



  @Get()
  @UseGuards(OptionAuthGuard)  // aqui uso el guard que me cree 
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user: User) { // getUser, captura al user logueado
    return this.productService.findAll(paginationDto, user); //isAdmin parametro aumentado
  }

  @Get(':term')
  @UseGuards(OptionAuthGuard) 
  findOne(@Param('term') term: string, @GetUser() user: User) {

    return this.productService.findOne(term, user);
  }

 

  @Patch(':id')
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto, @GetUser() user:User) {
    return this.productService.update(id, updateProductDto, user);
  }

  @Patch(':id/incrementStock')
  @Auth(ValidRoles.Admin)
  incrementStock(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() incrementStockDto: IncrementStockDto,
  ) {
  return this.productService.incrementStock(id, incrementStockDto);
}

 
}
