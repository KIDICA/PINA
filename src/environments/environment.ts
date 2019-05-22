// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  disableAuthentication: false,
  snapshotIntervalInSeconds: 5,
  config: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/GetYaCoViConfig'
  },
  canvas: {
    font: {
      size: '25px',
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
      redirectUri: 'http://localhost:4200/',
      endpoints: ['https://vault.azure.net']
    },
    cognitiveServices: {
      faceDetectUrl: 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect',
      faceIdentifyUrl: 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/identify',
      personGroupsUrl: 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/persongroups',
      analyzeVisionUrl: 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/analyze'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
