import { MikroORM } from '@mikro-orm/core';
import mikroConfig from '../mikro-orm.config';
import { PaymentType } from '../src/financeiro/entities/payment-type.entity';

async function main() {
  const orm = await MikroORM.init(mikroConfig);
  const em = orm.em.fork();

  const tipos = ['Pix', 'Dinheiro', 'Crédito', 'Débito'];

  for (const nome of tipos) {
    const exists = await em.findOne(PaymentType, { descricao: nome });
    if (exists) {
      console.log(`Já existe: ${nome} (${exists.id})`);
      continue;
    }
    const tipo = em.create(PaymentType, {
      descricao: nome,
      ativo: true,
      createdById: null,
      updatedById: null,
    });
    em.persist(tipo);
    console.log(`Criado: ${nome}`);
  }

  await em.flush();
  await orm.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
