// Este arquivo é processado no container Nginx via envsubst
// e gerará assets/app-config.js com os valores de runtime
// Variáveis disponíveis: $API_URL
window.APP_CONFIG = {
  apiUrl: "$API_URL"
};

