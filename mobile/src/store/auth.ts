export const AuthStore = {
  user: null as any,
  token: null as string | null,
  set(u: any, t: string){ this.user = u; this.token = t; (globalThis as any).__token = t; (globalThis as any).__userId = u?._id; },
  clear(){ this.user = null; this.token = null; (globalThis as any).__token = null; (globalThis as any).__userId = null; }
};
