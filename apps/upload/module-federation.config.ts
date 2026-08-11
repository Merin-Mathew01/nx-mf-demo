import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'upload',
  exposes: {
    './Routes': 'apps/upload/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;


// import { ModuleFederationConfig } from '@nx/webpack';

// const config: ModuleFederationConfig = {
//   name: 'upload',
//   exposes: {
//     './Routes': 'apps/upload/src/app/remote-entry/entry.routes.ts',
//   },
//   shared: (libraryName, sharedConfig) => {
//     if (libraryName === '@microsoft/signalr') {
//       return { singleton: true, strictVersion: false };
//     }
//     return sharedConfig;
//   },
// };

// export default config;