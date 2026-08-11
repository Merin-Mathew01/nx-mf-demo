// import { withModuleFederation } from '@nx/angular/module-federation';
// import config from './module-federation.config';

// export default withModuleFederation(config);

import { withModuleFederation } from '@nx/angular/module-federation';
import config from './module-federation.config';
 
export default async (webpackConfig: any) => {
  const mfConfigFn = await withModuleFederation(config);
  const baseConfig = await mfConfigFn(webpackConfig);
 
  return {
    ...baseConfig,
    resolve: {
      ...baseConfig.resolve,
      alias: {
        ...baseConfig.resolve?.alias,
        '@microsoft/signalr': require.resolve('@microsoft/signalr/dist/browser/signalr.js'),
      },
      fallback: {
        ...baseConfig.resolve?.fallback,
        util: false,
        http: false,
        https: false,
        module: false,
        net: false,
        tls: false,
        zlib: false,
        stream: false,
        url: false,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        assert: false,
        buffer: false,
        events: false,
        querystring: false,
      },
    },
  };
};
 

// import { withModuleFederation } from '@nx/angular/module-federation';
// import { merge } from 'webpack-merge';
// import * as path from 'path';
// import config from './module-federation.config';

// export default withModuleFederation(config).then((mfTransform) => {
//   return (baseConfig: any) =>
//     merge(mfTransform(baseConfig), {
//       resolve: {
//         alias: {
//           '@microsoft/signalr': path.resolve(
//             __dirname,
//             '../../node_modules/@microsoft/signalr/dist/browser/signalr.js'
//           ),
//         },
//         fallback: {
//           module: false,
//         },
//       },
//     });
// });