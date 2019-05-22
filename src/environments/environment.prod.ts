export const environment = {
  production: true,
  disableAuthentication: false,
  snapshotIntervalInSeconds: 5,
  config: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/GetYaCoViConfig'
  },
  canvas: {
    font: {
      size: '30px',
      family: 'Arial'
    },
    colors: {
      success: '#00FF00',
      error: '#FF0000'
    }
  },
  azure: {
    adal: {
      tenant: '13c728e0-bb0c-4cf7-8e10-5b327279d6d9',
      clientId: '9046ce57-3082-4d8b-bec4-3b76ac73f4bc',
      redirectUri: 'https://kidica.github.io/PINA/',
      endpoints: ['https://vault.azure.net']
    },
    cognitiveServices: {
      facesUrl: 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/analyze',
      ocrUrl: 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText'
    }
  }
};
