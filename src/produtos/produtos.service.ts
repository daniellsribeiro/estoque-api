import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Customer } from './entities/customer.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductMaterial } from './entities/product-material.entity';
import { ProductSize } from './entities/product-size.entity';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { Supplier } from './entities/supplier.entity';
import { ProductStock } from './entities/product-stock.entity';
import { PurchaseItem } from '../compras/entities/purchase-item.entity';
import { SaleItem } from '../vendas/entities/sale-item.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductPriceHistory } from './entities/product-price-history.entity';
import { Purchase } from '../compras/entities/purchase.entity';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(ProductType)
    private readonly typeRepo: EntityRepository<ProductType>,
    @InjectRepository(ProductColor)
    private readonly colorRepo: EntityRepository<ProductColor>,
    @InjectRepository(ProductMaterial)
    private readonly materialRepo: EntityRepository<ProductMaterial>,
    @InjectRepository(ProductSize)
    private readonly sizeRepo: EntityRepository<ProductSize>,
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(ProductStock)
    private readonly stockRepo: EntityRepository<ProductStock>,
    @InjectRepository(ProductPrice)
    private readonly priceRepo: EntityRepository<ProductPrice>,
    @InjectRepository(ProductPriceHistory)
    private readonly priceHistoryRepo: EntityRepository<ProductPriceHistory>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: EntityRepository<Supplier>,
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepo: EntityRepository<PurchaseItem>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: EntityRepository<Purchase>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: EntityRepository<SaleItem>,
  ) {}

  async createType(dto: CreateProductTypeDto, userId?: string) {
    const existing = await this.typeRepo.findOne({ codigo: dto.codigo });
    if (existing) {
      throw new BadRequestException('Código de tipo já existe');
    }
    const type = this.typeRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.typeRepo.getEntityManager().persistAndFlush(type);
    return type;
  }

  async createColor(dto: CreateProductColorDto, userId?: string) {
    const exists = await this.colorRepo.findOne({ codigo: dto.codigo });
    if (exists) {
      throw new BadRequestException('Código de cor já existe');
    }
    const color = this.colorRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.colorRepo.getEntityManager().persistAndFlush(color);
    return color;
  }

  async createMaterial(dto: CreateProductMaterialDto, userId?: string) {
    const exists = await this.materialRepo.findOne({ codigo: dto.codigo });
    if (exists) {
      throw new BadRequestException('Código de material já existe');
    }
    const material = this.materialRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.materialRepo.getEntityManager().persistAndFlush(material);
    return material;
  }

  async createSize(dto: CreateProductSizeDto, userId?: string) {
    const codigo = dto.codigo.padStart(3, '0');
    const exists = await this.sizeRepo.findOne({ codigo });
    if (exists) {
      throw new BadRequestException('Código de tamanho já existe');
    }
    const size = this.sizeRepo.create({
      ...dto,
      codigo,
      createdById: userId,
      updatedById: userId,
    });
    await this.sizeRepo.getEntityManager().persistAndFlush(size);
    return size;
  }

  async listTypes() {
    return this.typeRepo.findAll();
  }

  async deleteType(id: string, userId?: string) {
    const entity = await this.typeRepo.findOne({ id });
    if (!entity) {
      throw new NotFoundException('Tipo não encontrado');
    }
    const used = await this.productRepo.count({ tipo: entity });
    if (used > 0) {
      throw new BadRequestException('Tipo já utilizado em produtos');
    }
    await this.typeRepo.getEntityManager().removeAndFlush(entity);
    return { deleted: true, deletedBy: userId };
  }

  async listColors() {
    return this.colorRepo.findAll();
  }

  async deleteColor(id: string, userId?: string) {
    const entity = await this.colorRepo.findOne({ id });
    if (!entity) {
      throw new NotFoundException('Cor não encontrada');
    }
    const used = await this.productRepo.count({ cor: entity });
    if (used > 0) {
      throw new BadRequestException('Cor já utilizada em produtos');
    }
    await this.colorRepo.getEntityManager().removeAndFlush(entity);
    return { deleted: true, deletedBy: userId };
  }

  async listMaterials() {
    return this.materialRepo.findAll();
  }

  async deleteMaterial(id: string, userId?: string) {
    const entity = await this.materialRepo.findOne({ id });
    if (!entity) {
      throw new NotFoundException('Material não encontrado');
    }
    const used = await this.productRepo.count({ material: entity });
    if (used > 0) {
      throw new BadRequestException('Material já utilizado em produtos');
    }
    await this.materialRepo.getEntityManager().removeAndFlush(entity);
    return { deleted: true, deletedBy: userId };
  }

  async listSizes() {
    return this.sizeRepo.findAll();
  }

  async deleteSize(id: string, userId?: string) {
    const entity = await this.sizeRepo.findOne({ id });
    if (!entity) {
      throw new NotFoundException('Tamanho não encontrado');
    }
    const used = await this.productRepo.count({ tamanho: entity });
    if (used > 0) {
      throw new BadRequestException('Tamanho já utilizado em produtos');
    }
    await this.sizeRepo.getEntityManager().removeAndFlush(entity);
    return { deleted: true, deletedBy: userId };
  }

  async createSupplier(dto: CreateSupplierDto, userId?: string) {
    const exists = await this.supplierRepo.findOne({ nome: dto.nome });
    if (exists) {
      throw new BadRequestException('Fornecedor com este nome já existe');
    }
    const supplier = this.supplierRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.supplierRepo.getEntityManager().persistAndFlush(supplier);
    return supplier;
  }

  async listSuppliers() {
    return this.supplierRepo.findAll();
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto, userId?: string) {
    const supplier = await this.supplierRepo.findOne({ id });
    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    if (dto.nome && dto.nome !== supplier.nome) {
      const exists = await this.supplierRepo.findOne({ nome: dto.nome });
      if (exists) {
        throw new BadRequestException('Fornecedor com este nome já existe');
      }
      supplier.nome = dto.nome;
    }
    if (dto.endereco !== undefined) supplier.endereco = dto.endereco;
    if (dto.telefone !== undefined) supplier.telefone = dto.telefone;
    if (dto.email !== undefined) supplier.email = dto.email;
    if (dto.observacoes !== undefined) supplier.observacoes = dto.observacoes;
    supplier.updatedById = userId;
    await this.supplierRepo.getEntityManager().persistAndFlush(supplier);
    return supplier;
  }

  async deleteSupplier(id: string, userId?: string) {
    const supplier = await this.supplierRepo.findOne({ id });
    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    const usedInCompras = await this.purchaseRepo.count({ fornecedor: supplier });
    if (usedInCompras > 0) {
      throw new BadRequestException('Fornecedor já utilizado em compras');
    }
    await this.supplierRepo.getEntityManager().removeAndFlush(supplier);
    return { deleted: true, deletedBy: userId };
  }

  async createCustomer(dto: CreateCustomerDto, userId?: string) {
    const customer = this.customerRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.customerRepo.getEntityManager().persistAndFlush(customer);
    return customer;
  }

  private async generateProductCode(tipo: ProductType) {
    const prefix = `h${tipo.codigo}`;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < 20; i++) {
      const randomPart = Array.from({ length: 3 }, () => charset[Math.floor(Math.random() * charset.length)]).join(
        '',
      );
      const code = `${prefix}${randomPart}`;
      const exists = await this.productRepo.findOne({ codigo: code });
      if (!exists) {
        return code;
      }
    }
    throw new BadRequestException('Falha ao gerar código único para produto');
  }

  async createProduct(dto: CreateProductDto, userId?: string) {
    const tipo = await this.typeRepo.findOne({ id: dto.tipoProdutoId });
    if (!tipo) {
      throw new NotFoundException('Tipo de produto não encontrado');
    }

    const cor = dto.corId ? await this.colorRepo.findOne({ id: dto.corId }) : undefined;
    const material = dto.materialId ? await this.materialRepo.findOne({ id: dto.materialId }) : undefined;
    const tamanho = dto.tamanhoId ? await this.sizeRepo.findOne({ id: dto.tamanhoId }) : undefined;

    const codigo = await this.generateProductCode(tipo);

    const produto = this.productRepo.create({
      nome: dto.nome,
      tipo,
      cor,
      material,
      tamanho,
      observacao: dto.observacao,
      ativo: dto.ativo ?? true,
      codigo,
      createdById: userId,
      updatedById: userId,
    });

    const preco = this.priceRepo.create({
      produto,
      precoVendaAtual: dto.precoVendaAtual,
      createdById: userId,
      updatedById: userId,
    });

    const estoque = this.stockRepo.create({
      produto,
      quantidadeAtual: 0,
      createdById: userId,
      updatedById: userId,
    });

    produto.estoque = estoque;
    produto.preco = preco;

    const em = this.productRepo.getEntityManager();
    em.persist(produto);
    em.persist(estoque);
    em.persist(preco);
    await em.flush();

    const history = this.priceHistoryRepo.create({
      produto,
      precoAntigo: dto.precoVendaAtual,
      precoNovo: dto.precoVendaAtual,
      dataInicio: new Date(),
      motivo: 'CRIACAO',
      createdById: userId,
    });
    em.persist(history);
    await em.flush();

    return produto;
  }

  async listProducts() {
    return this.productRepo.findAll({
      populate: ['tipo', 'cor', 'material', 'tamanho', 'preco'],
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto, userId?: string) {
    const product = await this.productRepo.findOne({ id });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (dto.nome) {
      product.nome = dto.nome;
    }
    if (dto.observacao !== undefined) {
      product.observacao = dto.observacao;
    }
    product.updatedById = userId;
    await this.productRepo.getEntityManager().persistAndFlush(product);
    return product;
  }

  async updateProductPrice(
    id: string,
    dto: UpdateProductPriceDto,
    userId?: string,
  ): Promise<{ id: string; precoVendaAtual: number }> {
    const product = await this.productRepo.findOne({ id }, { populate: ['preco'] });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    const em = this.productRepo.getEntityManager();
    let preco = product.preco;
    if (!preco) {
      preco = this.priceRepo.create({
        produto: product,
        precoVendaAtual: dto.precoVendaAtual,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(preco);
    } else {
      const history = this.priceHistoryRepo.create({
        produto: product,
        precoAntigo: preco.precoVendaAtual,
        precoNovo: dto.precoVendaAtual,
        dataInicio: new Date(),
        motivo: 'ATUALIZACAO',
        createdById: userId,
      });
      em.persist(history);

      preco.precoVendaAtual = dto.precoVendaAtual;
      preco.updatedById = userId;
      em.persist(preco);
    }
    await em.flush();
    return { id: preco.id, precoVendaAtual: preco.precoVendaAtual };
  }

  async listPriceHistory(productId: string) {
    const product = await this.productRepo.findOne({ id: productId });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return this.priceHistoryRepo.find(
      { produto: product },
      { orderBy: { createdAt: 'DESC' } },
    );
  }

  async deleteProduct(id: string, userId?: string) {
    const product = await this.productRepo.findOne(
      { id },
      { populate: ['estoque', 'preco'] },
    );
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (product.estoque && product.estoque.quantidadeAtual > 0) {
      throw new BadRequestException('Não é possível excluir produto com estoque maior que zero');
    }
    const usedInPurchases = await this.purchaseItemRepo.count({ item: product });
    const usedInSales = await this.saleItemRepo.count({ item: product });
    if (usedInPurchases > 0 || usedInSales > 0) {
      throw new BadRequestException('Produto está em uso em compras ou vendas');
    }

    const em = this.productRepo.getEntityManager();
    await this.priceHistoryRepo.nativeDelete({ produto: product });
    if (product.preco) {
      em.remove(product.preco);
    }
    if (product.estoque) {
      em.remove(product.estoque);
    }
    em.remove(product);
    await em.flush();
    return { deleted: true, deletedBy: userId };
  }
}
