"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("../mikro-orm.config"));
const payment_type_entity_1 = require("../src/financeiro/entities/payment-type.entity");
async function main() {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    const em = orm.em.fork();
    const tipos = ['Pix', 'Dinheiro', 'Crédito', 'Débito'];
    for (const nome of tipos) {
        const exists = await em.findOne(payment_type_entity_1.PaymentType, { descricao: nome });
        if (exists) {
            console.log(`Já existe: ${nome} (${exists.id})`);
            continue;
        }
        const tipo = em.create(payment_type_entity_1.PaymentType, {
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
//# sourceMappingURL=seed-payment-types.js.map