import { environment } from "../environments/environment";

const ASSET_URL: string = environment.asset_url();

export const FILE_PATHS = {
    default_user_image: 'assets/images/user-image.png',
    cdn_images: {
        logo_image: `${ASSET_URL}/logo-color.svg`
    }
}