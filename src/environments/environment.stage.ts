/**
 * Environment configurations for production instance
 */
export const environment = {
  production: true,
  env: 'prod',
  base_url: 'https://chopstickapi.careclues.com',
  api_version: 'api/v1',
  api_url: function () { return `${this.base_url}/${this.api_version}/` },
  public_url: function () { return `${this.base_url}/${this.api_version}/public/` },
  cdn_base_url: "https://demo-careclues.imgix.net",
  asset_url: function () { return `${this.cdn_base_url}/assets` },
  website_base_url: 'https://demonstick.careclues.com'
};
