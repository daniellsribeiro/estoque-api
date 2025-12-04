import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateStockAdjustDto } from './dto/create-stock-adjust.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ProdutosService } from './produtos.service';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post('tipos')
  createType(@Body() dto: CreateProductTypeDto, @CurrentUser() user: any) {
    return this.produtosService.createType(dto, user?.id);
  }

  @Post('cores')
  createColor(@Body() dto: CreateProductColorDto, @CurrentUser() user: any) {
    return this.produtosService.createColor(dto, user?.id);
  }

  @Post('materiais')
  createMaterial(
    @Body() dto: CreateProductMaterialDto,
    @CurrentUser() user: any,
  ) {
    return this.produtosService.createMaterial(dto, user?.id);
  }

  @Post('tamanhos')
  createSize(@Body() dto: CreateProductSizeDto, @CurrentUser() user: any) {
    return this.produtosService.createSize(dto, user?.id);
  }

  @Get('tipos')
  listTypes() {
    return this.produtosService.listTypes();
  }

  @Get('cores')
  listColors() {
    return this.produtosService.listColors();
  }

  @Get('materiais')
  listMaterials() {
    return this.produtosService.listMaterials();
  }

  @Get('tamanhos')
  listSizes() {
    return this.produtosService.listSizes();
  }

  @Delete('tipos/:id')
  deleteType(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteType(id, user?.id);
  }

  @Delete('cores/:id')
  deleteColor(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteColor(id, user?.id);
  }

  @Delete('materiais/:id')
  deleteMaterial(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteMaterial(id, user?.id);
  }

  @Delete('tamanhos/:id')
  deleteSize(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteSize(id, user?.id);
  }

  @Post('fornecedores')
  createSupplier(@Body() dto: CreateSupplierDto, @CurrentUser() user: any) {
    return this.produtosService.createSupplier(dto, user?.id);
  }

  @Get('fornecedores')
  listSuppliers() {
    return this.produtosService.listSuppliers();
  }

  @Post('fornecedores/:id')
  updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: any,
  ) {
    return this.produtosService.updateSupplier(id, dto, user?.id);
  }

  @Delete('fornecedores/:id')
  deleteSupplier(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteSupplier(id, user?.id);
  }

  @Post('clientes')
  createCustomer(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.produtosService.createCustomer(dto, user?.id);
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.produtosService.createProduct(dto, user?.id);
  }

  @Get()
  listProducts() {
    return this.produtosService.listProducts();
  }

  @Get('estoque')
  listEstoque() {
    return this.produtosService.listEstoque();
  }

  @Post(':id/preco')
  updateProductPrice(
    @Param('id') id: string,
    @Body() dto: UpdateProductPriceDto,
    @CurrentUser() user: any,
  ): Promise<{ id: string; precoVendaAtual: number }> {
    return this.produtosService.updateProductPrice(id, dto, user?.id);
  }

  @Post(':id/estoque/baixa')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: CreateStockAdjustDto,
    @CurrentUser() user: any,
  ) {
    return this.produtosService.baixaEstoque(id, dto, user?.id);
  }

  @Get(':id/preco/historico')
  listPriceHistory(@Param('id') id: string) {
    return this.produtosService.listPriceHistory(id);
  }

  @Post(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.produtosService.updateProduct(id, dto, user?.id);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string, @CurrentUser() user: any) {
    return this.produtosService.deleteProduct(id, user?.id);
  }
}
