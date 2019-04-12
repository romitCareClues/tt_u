/**
 * Environment configurations for production instance
 */
export const environment = {
  production: true,
  env: 'prod',
  base_url: 'https://fusestick.careclues.com',
  api_version: 'api/v1',
  api_url: function () { return `${this.base_url}/${this.api_version}/` },
  public_url: function () { return `${this.base_url}/${this.api_version}/public/` },
};
