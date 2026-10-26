import { WebView as UntypedWebView } from 'react-native-webview';

// react-native-webview 14.0.1 defaults its extra props to `undefined`, which turns every prop
// into `never`. Pinning them to `object` gives back the normal WebView prop types.
export const WebView = UntypedWebView<object>;
export type WebViewHandle = UntypedWebView<object>;
