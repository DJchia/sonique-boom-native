import { useRef, useState, useCallback, useEffect, Component } from 'react';
import { StyleSheet, View, Text, StatusBar, BackHandler, ActivityIndicator, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';

const REMOTE_URL = 'https://sonique-boom.replit.app';

const source = { uri: REMOTE_URL };

if (global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[SoniqueBoom] Uncaught JS error${isFatal ? ' (fatal)' : ''}:`, error);
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[SoniqueBoom] React crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Sonique Boom failed to start.</Text>
          <Text style={styles.errorSub}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function PlayerWebView() {
  const webViewRef = useRef(null);
  const canGoBackRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PRESENTATION_MODE') {
        // Keep-awake handling removed for now; message is accepted and
        // ignored so the web app's postMessage calls don't error out.
      }
    } catch (e) {
      // ignore non-JSON messages
    }
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  useEffect(() => {
    const onBack = () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        onMessage={handleMessage}
        originWhitelist={['*']}
        onNavigationStateChange={(navState) => {
          canGoBackRef.current = navState.canGoBack;
        }}
        onLoadStart={() => {
          setLoadError(null);
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[SoniqueBoom] WebView error:', nativeEvent);
          setIsLoading(false);
          setLoadError('load-error');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('[SoniqueBoom] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
          setIsLoading(false);
          setLoadError(`http-${nativeEvent.statusCode}`);
        }}
      />
      {isLoading && !loadError && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#00e676" />
        </View>
      )}
      {loadError && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>Couldn't load Sonique Boom.</Text>
          <Text style={styles.errorSub}>{loadError}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PlayerWebView />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0e1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#00e676',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSub: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00e676',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#0a0e1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
