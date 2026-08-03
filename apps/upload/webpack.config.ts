import { withModuleFederation } from '@nx/angular/module-federation';
import config from './module-federation.config';

export default withModuleFederation(config);

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