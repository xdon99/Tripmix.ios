import { forwardRef } from 'react';
import type { ComponentType, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import WebViewBase from 'react-native-webview';
import type { WebView as WebViewInstance, WebViewMessageEvent } from 'react-native-webview';

export type AppWebViewProps = {
  source: { html: string; baseUrl?: string };
  style?: StyleProp<ViewStyle>;
  originWhitelist?: string[];
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  scrollEnabled?: boolean;
  overScrollMode?: 'auto' | 'always' | 'never';
  setSupportMultipleWindows?: boolean;
  androidLayerType?: 'none' | 'software' | 'hardware';
  onMessage?: (event: WebViewMessageEvent) => void;
};

// The published WebView props type is an iOS ∩ Android ∩ Windows intersection
// that becomes `never` under this TypeScript config. Bind the runtime component
// to the props this app actually passes (Expo Go, iOS and Android).
const WebView = WebViewBase as unknown as ComponentType<
  AppWebViewProps & { ref?: Ref<WebViewInstance> }
>;

export const AppWebView = forwardRef<WebViewInstance, AppWebViewProps>((props, ref) => {
  return <WebView {...props} ref={ref} />;
});

AppWebView.displayName = 'AppWebView';
