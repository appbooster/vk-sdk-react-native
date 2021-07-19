import { NativeModules } from 'react-native';

type VkSdkReactNativeType = {
  multiply(a: number, b: number): Promise<number>;
};

const { VkSdkReactNative } = NativeModules;

export default VkSdkReactNative as VkSdkReactNativeType;
