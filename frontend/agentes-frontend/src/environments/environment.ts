export const environment = {
  // Preferir valor injetado em runtime (assets/app-config.js) e cair para localhost no dev
  apiUrl: (typeof window !== 'undefined' && (window as any)?.APP_CONFIG?.apiUrl) || 'http://localhost:8080'
};
