import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../auth/entities/user.entity';
import { OptionAuthGuard } from '../auth/guards/optionalAuth.guard';



@Controller('category')

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user:User) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  
  findAll(@Query() paginationDto:PaginationDto) {

    return this.categoryService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(OptionAuthGuard)
  findCategoryById(@Param('term') term: string, @GetUser() user: User) {

    const isAdmin = user?.roles?.some(roles=>[ValidRoles.Admin, ValidRoles.Owner].includes(roles)) ?? false
    return this.categoryService.findOne(term, isAdmin);
  }



  @Patch(':id')
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto, @GetUser() user:User) {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  
}
