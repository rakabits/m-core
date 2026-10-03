import { getCurrentUser } from '@/lib/auth/local';

/** Compatibility adapter while API handlers migrate to the local session service. */
export async function createSupabaseServerClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: await getCurrentUser() } }),
      signOut: async () => { return { error: null }; },
    },
  };
}
