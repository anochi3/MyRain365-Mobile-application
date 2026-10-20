/** Native map: the Leaflet page runs in a WebView; commands are sent by running JavaScript inside it. */
import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { useMapBridge } from '../hooks/useMapBridge';
import type { BuildingMapProps } from './buildingMap.types';

export default function BuildingMap(props: BuildingMapProps) {
  const webViewRef = useRef<WebView>(null);
  const { html, handleMessage } = useMapBridge(props, (command) => {
    webViewRef.current?.injectJavaScript(
      `window.receiveMapCommand(${JSON.stringify(command)}); true;`,
    );
  });

  return (
    <WebView
      ref={webViewRef}
      style={StyleSheet.absoluteFill}
      source={{ html }}
      originWhitelist={['*']}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      onMessage={(event) => handleMessage(event.nativeEvent.data)}
    />
  );
}
