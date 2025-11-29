import { MikroORM } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import mikroConfig from '../mikro-orm.config';
import { User } from '../src/users/entities/user.entity';

async function main() {
  const orm = await MikroORM.init(mikroConfig);
  const em = orm.em.fork();

  const name = 'Daniel';
  const email = 'daniellsribeiro@hotmail.com';
  const password = '@Aa123456';

  let user = await em.findOne(User, { email });
  if (user) {
    console.log('Usuário já existe:', user.email);
    await orm.close();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  user = em.create(User, {
    name,
    email,
    passwordHash,
    active: true,
    createdById: null,
    updatedById: null,
  });

  await em.persistAndFlush(user);
  console.log('Usuário criado com id:', user.id);
  await orm.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
