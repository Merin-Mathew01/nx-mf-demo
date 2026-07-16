import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'reports',
  exposes: {
    './Routes': 'apps/reports/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
