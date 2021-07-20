import {
  NativeModules,
  Image,
  ImageResolvedAssetSource,
  Platform,
} from 'react-native';

const { VkontakteManager: VKLogin, VkontakteSharing: VKShare } = NativeModules;

// vk auth errors
export const VKError = {
  E_NOT_INITIALIZED: 'E_NOT_INITIALIZED',
  E_VK_UNKNOWN: 'E_VK_UNKNOWN',
  E_VK_API_ERROR: 'E_VK_API_ERROR',
  E_VK_CANCELED: 'E_VK_CANCELED',
  E_VK_REQUEST_NOT_PREPARED: 'E_VK_REQUEST_NOT_PREPARED',
  E_VK_RESPONSE_STRING_PARSING_ERROR: 'E_VK_RESPONSE_STRING_PARSING_ERROR', // ios
  E_VK_AUTHORIZE_CONTROLLER_CANCEL: 'E_VK_AUTHORIZE_CONTROLLER_CANCEL', // ios
  E_VK_JSON_FAILED: 'E_VK_JSON_FAILED', // android
  E_VK_REQUEST_HTTP_FAILED: 'E_VK_REQUEST_HTTP_FAILED', // android
  E_ACTIVITY_DOES_NOT_EXIST: 'E_ACTIVITY_DOES_NOT_EXIST', // android
  E_FINGERPRINTS_ERROR: 'E_FINGERPRINTS_ERROR', // android
};

/**
 * Response from login method
 */
export type VKLoginResult = {
  /**
   * String token for use in request parameters
   */
  access_token: string | null;
  /**
   * User email, or null, if permission was not given
   */
  email: string | null;
  /**
   * **Android only** If user sets "Always use HTTPS" setting in his profile, it will be true
   */
  https_required?: boolean;
  /**
   * User secret to sign requests (if nohttps used)
   */
  secret: string | null;
  /**
   * Current user id for this token
   */
  user_id: string | null;
  /**
   * Time when token expires
   */
  expires_in?: number;
};

/**
 * Share dialog options
 */
export type VKShareOptions = {
  /**
   * Shared link name
   */
  linkText?: string;
  /**
   * Shared link URL
   */
  linkUrl?: string;
  /**
   * Shared text message
   */
  description?: string;
  /**
   * Shared image, local file resource, i.e. require('path/to/your/image.png')
   */
  image?: ImageResolvedAssetSource | number;
};

type VkSdkReactNativeType = {
  initialize(vkAppId: number | string): void;
  login(scopesArray: string[]): Promise<VKLoginResult>;
  logout(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getAccessToken(): Promise<VKLoginResult | null>;
  share(options: VKShareOptions): Promise<number>;
  getCertificateFingerprint(): Promise<string[]>;
};

/**
 * React-native wrapper around vk-ios-sdk and vk-android-sdk
 * Provides login and share functionality
 */
class VkSdk {
  /**
   * Initializes VK SDK from JS code.
   * You only need to call this once before you call login or logout.
   * You can skip this call if you've added your VK App ID to your Android's resources or iOS's info.plist.
   * @param {number|string} vkAppId Your VK app id
   */
  initialize = (vkAppId: number | string): void => {
    VKLogin.initialize(typeof vkAppId === 'number' ? vkAppId : Number(vkAppId));
  };

  /**
   * Opens VK login dialog either via VK mobile app or via WebView (if app is not installed on the device).
   * If the user is already logged in and has all the requested permissions, then the promise is resolved
   * straight away, without VK dialog.
   * @param {string[]} scopesArray array which contains VK access permissions as strings,
   * e.g. `['friends', 'photos', 'email']`
   * List of available permissions can be found <a href="https://new.vk.com/dev/permissions">here</a>
   * @returns {Promise<VKLoginResult>} Promise will be resolved with VKLoginResult object
   */
  login = async (scopesArray: string[]): Promise<VKLoginResult> => {
    return await VKLogin.login(scopesArray);
  };

  /**
   * Performs the logout
   * @returns {Promise} empty promise
   */
  logout = async (): Promise<void> => {
    return await VKLogin.logout();
  };

  /**
   * Checks if user is already logged in
   * @returns {Promise<boolean>} Promise that resolves with boolean value
   */
  isLoggedIn = async (): Promise<boolean> => {
    return await VKLogin.isLoggedIn();
  };

  /**
   * Returns VK access token (if it exists)
   * @returns {Promise<VKLoginResult | null>} Promise that resolves with VKLoginResult or null
   */
  getAccessToken = async (): Promise<VKLoginResult | null> => {
    return await VKLogin.getAccessToken();
  };

  /**
   * Opens VK share dialog either via VK mobile app or via WebView (if app is not installed on the device).
   * Make sure to have correct permissions!
   * @param {VKShareOptions} options VKShareOptions object
   * @returns {Promise<number>} Promise that resolves with postId number
   */
  share = async (options: VKShareOptions): Promise<number> => {
    let imageUrl: string | undefined;
    try {
      if (options.image) {
        imageUrl = Image.resolveAssetSource?.(options.image)?.uri ?? undefined;
      }
    } catch (e) {
      options.image = undefined;
    }
    return await VKShare.share({ ...options, image: imageUrl });
  };

  /**
   * **Android only** - helper method to get fingerprints on JS side
   * @returns {Promise<string[]>} Promise that resolves with array of string fingerprints
   */
  getCertificateFingerprint = async (): Promise<string[]> => {
    if (Platform.OS !== 'android') {
      console.warn('getCertificateFingerprint is for Android only');
      return [];
    }
    return await VKLogin.getCertificateFingerprint();
  };
}

export default new VkSdk() as VkSdkReactNativeType;
