import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useRoofModelBridge } from '@/data/hooks/useRoofModelBridge';
import { WebView, type WebViewHandle } from '@/shared/webView';

import type { RoofModelEngineProps } from './roofModelEngine.types';

export default function RoofModelEngine(props: RoofModelEngineProps) {
  const webViewRef = useRef<WebViewHandle>(null);
  const { engineUri, handleMessage, handleFailure } = useRoofModelBridge(props, (command) => {
    webViewRef.current?.injectJavaScript(
      `window.receiveRoofModelCommand(${JSON.stringify(command)}); true;`,
    );
  });

  return (
    <View style={styles.host}>
      <WebView
        ref={webViewRef}
        source={{ uri: engineUri }}
        originWhitelist={['*']}
        onMessage={(event) => handleMessage(event.nativeEvent.data)}
        onError={handleFailure}
        onHttpError={handleFailure}
        onRenderProcessGone={handleFailure}
        onContentProcessDidTerminate={handleFailure}
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
    pointerEvents: 'none',
  },
});
