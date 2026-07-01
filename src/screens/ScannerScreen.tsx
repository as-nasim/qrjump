// src/screens/ScannerScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { detectApp } from '../utils/appRouter';
import ScanFrame from '../components/ScanFrame';
import PermissionScreen from './PermissionScreen';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_W * 0.72;

export default function ScannerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torch, setTorch] = useState<'on' | 'off'>('off');
  const [scanning, setScanning] = useState(true);
  const [lastScan, setLastScan] = useState<string>('');

  // Scan line animation
  const scanLineY = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Animate scan line
    scanLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: FRAME_SIZE - 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.current.start();
    return () => scanLoop.current?.stop();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'aztec', 'data-matrix'],
    onCodeScanned: useCallback(
      (codes) => {
        if (!scanning || codes.length === 0) return;
        const value = codes[0].value;
        if (!value || value === lastScan) return;

        setScanning(false);
        setLastScan(value);

        const result = detectApp(value);

        // Navigate to result screen
        navigation.navigate('Result', {
          result,
          onRescan: () => {
            setScanning(true);
            setLastScan('');
          },
        });

        // Re-enable after delay if user comes back
        setTimeout(() => setScanning(true), 3000);
      },
      [scanning, lastScan, navigation]
    ),
  });

  if (hasPermission === null) return null;
  if (!hasPermission) return <PermissionScreen />;
  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No camera available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={scanning}
        codeScanner={codeScanner}
        torch={torch}
      />

      {/* Dark overlay with cutout */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top */}
        <View style={[styles.overlay, { height: (SCREEN_H - FRAME_SIZE) / 2 }]} />
        {/* Middle row */}
        <View style={styles.middleRow}>
          <View style={[styles.overlay, { width: (SCREEN_W - FRAME_SIZE) / 2 }]} />
          <View style={styles.frameArea}>
            {/* Scan line */}
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
            />
          </View>
          <View style={[styles.overlay, { width: (SCREEN_W - FRAME_SIZE) / 2 }]} />
        </View>
        {/* Bottom */}
        <View style={[styles.overlay, { flex: 1 }]} />
      </View>

      {/* Corner frame SVG */}
      <View
        style={[
          styles.frameWrapper,
          {
            top: (SCREEN_H - FRAME_SIZE) / 2,
            left: (SCREEN_W - FRAME_SIZE) / 2,
            width: FRAME_SIZE,
            height: FRAME_SIZE,
          },
        ]}
        pointerEvents="none"
      >
        <ScanFrame size={FRAME_SIZE} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.appTitle}>QRJump</Text>
        <Text style={styles.subtitle}>Scan to open any app instantly</Text>
      </View>

      {/* Hint label */}
      <View
        style={[
          styles.hintContainer,
          { top: (SCREEN_H - FRAME_SIZE) / 2 + FRAME_SIZE + 24 },
        ]}
      >
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>Point at any QR code</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        {/* Torch toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, torch === 'on' && styles.controlBtnActive]}
          onPress={() => setTorch((t) => (t === 'on' ? 'off' : 'on'))}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>{torch === 'on' ? '🔦' : '💡'}</Text>
          <Text style={[styles.controlLabel, torch === 'on' && styles.controlLabelActive]}>
            {torch === 'on' ? 'Light On' : 'Light'}
          </Text>
        </TouchableOpacity>

        {/* History (placeholder) */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>🕐</Text>
          <Text style={styles.controlLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0F',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  frameArea: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00F5A0',
    shadowColor: '#00F5A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  frameWrapper: {
    position: 'absolute',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    fontWeight: '400',
  },
  hintContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 40,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(0,245,160,0.2)',
    borderColor: '#00F5A0',
  },
  controlIcon: {
    fontSize: 22,
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  controlLabelActive: {
    color: '#00F5A0',
  },
});
