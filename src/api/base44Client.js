// Stub minimal pour démarrer l'app sans l'infra Base44.
// Remplace ensuite par ton vrai client Base44 si tu l'as.
export const base44 = {
  auth: {
    async me() {
      // retourne null si pas loggé, ou un user fake pour tester
      return null;
    },
    logout() {
      // no-op
    },
    redirectToLogin() {
      // no-op
    },
  },
};
