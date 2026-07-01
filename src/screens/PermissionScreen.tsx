// src/screens/PermissionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PermissionScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Camera Access Needed</Text>
      <Text style={styles.body}>
        QRJump needs camera access to scan QR codes and open apps instantly.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => Linking.openSettings()}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>Open Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  btn: {
    backgroundColor: '#00F5A0',
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
