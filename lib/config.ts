// Valores usados em vários sítios. Mudou aqui, mudou em todo o app.
import { LATEST } from "./changelog";

export const BETA = true;
export const VERSION = LATEST.version; // a versão sai da entrada mais recente de lib/changelog.ts
// Todos os endereços absolutos saem daqui: se um dia houver domínio próprio, muda-se só esta linha.
export const SITE_URL = "https://noobrain.vercel.app";
