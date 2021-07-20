import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  ActivityIndicator,
} from 'react-native';
import VkSdk from 'vk-sdk-react-native';

const testImage = require('./nature.jpeg');
const VK_SCOPE = ['wall', 'photos', 'offline'];

export default function App() {
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [isLogin, setIsLogin] = React.useState<boolean>(false);
  const [vkToken, setVkToken] = React.useState<string>('');

  const initVkSdk = async (): Promise<void> => {
    try {
      VkSdk.initialize('7906972');
      const isLoggedIn = await VkSdk.isLoggedIn();
      setIsLogin(isLoggedIn);
      if (isLoggedIn) {
        const result = await VkSdk.getAccessToken();
        setVkToken(result?.access_token ?? '');
      }
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const loginVK = async (): Promise<void> => {
    try {
      const result = await VkSdk.login(VK_SCOPE);
      // const const { access_token, email, https_required, secret, user_id, expires_in } = result
      console.log('result: ', result);
      if (result !== null) {
        setIsLogin(true);
        setVkToken(result.access_token || '');
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const logoutVK = async (): Promise<void> => {
    try {
      await VkSdk.logout();
      setIsLogin(false);
      setVkToken('');
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const shareVK = async (): Promise<void> => {
    try {
      const postId = await VkSdk.share({
        description: 'welcome to vk',
        linkText: 'vk site',
        linkUrl: 'https://vk.com/',
        image: testImage,
      });
      console.log('postId: ', postId);
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const getFingerprint = async (): Promise<void> => {
    try {
      const fingerprints = await VkSdk.getCertificateFingerprint();
      console.log('fingerprints: ', fingerprints);
    } catch (error) {
      console.log('error: ', error);
    }
  };

  React.useEffect(() => {
    initVkSdk();
  }, []);

  if (!isInitialized) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text>VK login: {isLogin ? 'Yes' : 'No'}</Text>
      <Text>VK token: {vkToken}</Text>
      <Button
        title={`${isLogin ? 'Logout' : 'Login'}`}
        onPress={isLogin ? logoutVK : loginVK}
      />
      <Button title="Share" onPress={shareVK} disabled={!isLogin} />
      {Platform.OS === 'android' && (
        <Button title="get fingerprint" onPress={getFingerprint} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
