import { useRef, useState, useCallback, useEffect, Component } from 'react';
import { StyleSheet, View, Text, StatusBar, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const REMOTE_URL = 'https://sonique-boom.replit.app';

const source = { uri: REMOTE_URL };

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
  const [keepAwake, setKeepAwake] = useState(false);
  const canGoBackRef = useRef(false);

  const handleMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PRESENTATION_MODE') {
        if (data.enabled) {
          await activateKeepAwakeAsync('presentation');
          setKeepAwake(true);
        } else {
          deactivateKeepAwake('presentation');
          setKeepAwake(false);
        }
      }
    } catch (e) {
      // ignore non-JSON messages
    }
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
        startInLoadingState={true}
        onNavigationStateChange={(navState) => {
          canGoBackRef.current = navState.canGoBack;
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[SoniqueBoom] WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('[SoniqueBoom] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
        }}
      />
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
  },
});
