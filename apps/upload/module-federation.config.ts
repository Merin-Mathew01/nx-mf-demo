import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'upload',
  exposes: {
    './Routes': 'apps/upload/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
