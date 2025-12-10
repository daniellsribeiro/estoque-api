"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const bcrypt = __importStar(require("bcrypt"));
const mikro_orm_config_1 = __importDefault(require("../mikro-orm.config"));
const user_entity_1 = require("../src/users/entities/user.entity");
async function main() {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    const em = orm.em.fork();
    const name = 'Daniel';
    const email = 'daniellsribeiro@hotmail.com';
    const password = '@Aa123456';
    let user = await em.findOne(user_entity_1.User, { email });
    if (user) {
        console.log('Usuário já existe:', user.email);
        await orm.close();
        return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    user = em.create(user_entity_1.User, {
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
//# sourceMappingURL=create-user.js.map