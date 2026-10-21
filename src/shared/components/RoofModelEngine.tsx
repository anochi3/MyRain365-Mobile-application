import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useRoofModelBridge } from '@/data/hooks/useRoofModelBridge';
import type { RoofModelEngineProps } from './roofModelEngine.types';

export default function RoofModelEngine(props: RoofModelEngineProps) {
  const webViewRef = useRef<WebView>(null);
  const { engineUri, handleMessage } = useRoofModelBridge(props, (command) => {
    webViewRef.current?.injectJavaScript(
      `window.receiveRoofModelCommand(${JSON.stringify(command)}); true;`,
    );
  });

  return (
    <View style={styles.host} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ uri: engineUri }}
        originWhitelist={['*']}
        onMessage={(event) => handleMessage(event.nativeEvent.data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
});
