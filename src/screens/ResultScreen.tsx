// src/screens/ResultScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Share,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DetectionResult, parseWifiQR } from '../utils/appRouter';
import { openDeepLink, getAppStoreLink } from '../utils/deepLink';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const { result }: { result: DetectionResult } = route.params;

  const [opening, setOpening] = useState(false);
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // Entrance animation
  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
    ]).start();

    // Icon bounce after entrance
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(iconBounce, { toValue: -12, duration: 180, useNativeDriver: true }),
        Animated.spring(iconBounce, { toValue: 0, useNativeDriver: true, tension: 200, friction: 6 }),
      ]).start();
    }, 300);

    // Save to history
    saveToHistory(result);
  }, []);

  const saveToHistory = async (r: DetectionResult) => {
    try {
      const raw = await AsyncStorage.getItem('scan_history');
      const history = raw ? JSON.parse(raw) : [];
      const entry = { ...r, scannedAt: Date.now() };
      history.unshift(entry);
      const trimmed = history.slice(0, 50); // keep 50
      await AsyncStorage.setItem('scan_history', JSON.stringify(trimmed));
    } catch (_) {}
  };

  const handleOpen = async () => {
    if (result.category === 'wifi') {
      const parsed = parseWifiQR(result.raw);
      if (parsed) {
        Alert.alert(
          '📶 Wi-Fi Details',
          `Network: ${parsed.ssid}\nPassword: ${parsed.password || '(none)'}`,
          [{ text: 'Copy Password', onPress: () => copyToClipboard(parsed.password) }, { text: 'Done' }]
        );
      }
      return;
    }

    if (result.category === 'contact') {
      copyToClipboard(result.raw);
      Alert.alert('Contact Copied', 'vCard data copied to clipboard. You can paste it into your contacts app.');
      return;
    }

    setOpening(true);
    try {
      const success = await openDeepLink(result);
      if (!success) {
        // App not installed — offer store
        Alert.alert(
          `${result.appName} not installed`,
          `Would you like to install ${result.appName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Install',
              onPress: () => {
                const storeUrl = getAppStoreLink(result.appId);
                Linking.openURL(storeUrl);
              },
            },
          ]
        );
      }
    } finally {
      setOpening(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({ message: result.raw });
  };

  const handleRescan = () => {
    navigation.goBack();
    route.params.onRescan?.();
  };

  const wifiInfo = result.category === 'wifi' ? parseWifiQR(result.raw) : null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Background tint from app color */}
      <View style={[styles.colorBlob, { backgroundColor: result.color }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 16 }]}
          onPress={handleRescan}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Scan Again</Text>
        </TouchableOpacity>

        <View style={{ height: insets.top + 60 }} />

        {/* App icon card */}
        <Animated.View
          style={[
            styles.iconCard,
            {
              borderColor: result.color + '44',
              transform: [{ scale }, { translateY: iconBounce }],
              opacity,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: result.color + '22' }]}>
            <Text style={styles.iconEmoji}>{result.icon}</Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: result.color }]}>
            <Text style={styles.iconBadgeText}>{getCategoryLabel(result.category)}</Text>
          </View>
        </Animated.View>

        {/* App name & action */}
        <Animated.View style={[styles.textBlock, { opacity, transform: [{ translateY: slideY }] }]}>
          <Text style={styles.appName}>{result.appName}</Text>
          <Text style={styles.actionLabel}>{result.action}</Text>
        </Animated.View>

        {/* QR data preview */}
        <Animated.View style={[styles.dataCard, { opacity }]}>
          <Text style={styles.dataLabel}>Scanned content</Text>
          <Text style={styles.dataValue} numberOfLines={4} ellipsizeMode="tail">
            {result.raw}
          </Text>

          {/* Wi-Fi details */}
          {wifiInfo && (
            <View style={styles.wifiDetails}>
              <Row label="Network" value={wifiInfo.ssid} />
              <Row label="Password" value={wifiInfo.password || '(none)'} />
              <Row label="Security" value={wifiInfo.type} />
            </View>
          )}
        </Animated.View>

        {/* Primary action button */}
        <Animated.View style={[styles.actionBlock, { opacity, transform: [{ translateY: slideY }] }]}>
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: result.color }, opening && styles.openBtnLoading]}
            onPress={handleOpen}
            activeOpacity={0.85}
            disabled={opening}
          >
            <Text style={styles.openBtnText}>
              {opening ? 'Opening…' : result.action}
            </Text>
          </TouchableOpacity>

          {/* Secondary actions */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => copyToClipboard(result.raw)} activeOpacity={0.7}>
              <Text style={styles.secondaryIcon}>{copied ? '✅' : '📋'}</Text>
              <Text style={styles.secondaryLabel}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.7}>
              <Text style={styles.secondaryIcon}>↗️</Text>
              <Text style={styles.secondaryLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleRescan} activeOpacity={0.7}>
              <Text style={styles.secondaryIcon}>🔄</Text>
              <Text style={styles.secondaryLabel}>Rescan</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.wifiRow}>
      <Text style={styles.wifiLabel}>{label}</Text>
      <Text style={styles.wifiValue}>{value}</Text>
    </View>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    payment: 'Payment',
    social: 'Social',
    ecommerce: 'Shopping',
    food: 'Food',
    transport: 'Transport',
    web: 'Website',
    text: 'Text',
    wifi: 'Wi-Fi',
    contact: 'Contact',
  };
  return labels[category] ?? 'QR Code';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  colorBlob: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  backIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 20,
  },
  backText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  iconCard: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: '#1A1A25',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    position: 'relative',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 44,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  iconBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  actionLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    fontWeight: '400',
  },
  dataCard: {
    width: '100%',
    backgroundColor: '#1A1A25',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  wifiDetails: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  wifiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wifiLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
  wifiValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBlock: {
    width: '100%',
    marginTop: 24,
    gap: 16,
  },
  openBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  openBtnLoading: {
    opacity: 0.7,
  },
  openBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1A1A25',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  secondaryIcon: {
    fontSize: 20,
  },
  secondaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
});

// Fix Platform import for data value style
import { Platform } from 'react-native';
