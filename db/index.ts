import { neon } from '@neondatabase/serverless';

/**
 * Inisialisasi koneksi ke Neon Database secara lazy menggunakan Proxy.
 * Ini mencegah error saat build time jika DATABASE_URL tidak tersedia.
 * Error hanya akan muncul saat query benar-benar dieksekusi.
 */

let _sqlInstance: any = null;

const getSqlInstance = () => {
  if (!_sqlInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined. Please check your environment variables.');
    }
    _sqlInstance = neon(databaseUrl);
  }
  return _sqlInstance;
};

// Kita mendefinisikan tipe yang lebih spesifik untuk penggunaan umum agar tidak terjadi error union pada .map()
type NeonFunction = (strings: TemplateStringsArray, ...params: any[]) => Promise<any[]>;
type SqlProxy = NeonFunction & {
  transaction: (queries: any[], opts?: any) => Promise<any[]>;
  unsafe: (rawSQL: string) => any;
  query: (queryString: string, params?: any[], opts?: any) => Promise<any[]>;
};

export const sql = new Proxy(() => {}, {
  get(target, prop, receiver) {
    const instance = getSqlInstance();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  apply(target, thisArg, argumentsList) {
    return Reflect.apply(getSqlInstance(), thisArg, argumentsList);
  },
}) as unknown as SqlProxy;
