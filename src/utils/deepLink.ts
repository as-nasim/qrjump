// src/utils/deepLink.ts
import { Linking, Platform, Alert } from 'react-native';
import { DetectionResult } from './appRouter';

export async function openDeepLink(result: DetectionResult): Promise<boolean> {
  const { deepLink, fallbackUrl, appName } = result;

  // Handle special cases
  if (result.category === 'wifi') {
    // Wi-Fi can't be auto-connected — show info to user
    return false;
  }

  if (result.category === 'contact') {
    // vCard — would need native module for auto-save
    return false;
  }

  // Try the deep link first
  if (deepLink) {
    try {
      const canOpen = await Linking.canOpenURL(deepLink);

      if (canOpen) {
        await Linking.openURL(deepLink);
        return true;
      }
    } catch (err) {
      console.log('Deep link failed:', err);
    }
  }

  // Fall back to web URL
  if (fallbackUrl) {
    try {
      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (canOpenFallback) {
        await Linking.openURL(fallbackUrl);
        return true;
      }
    } catch (err) {
      console.log('Fallback URL failed:', err);
    }
  }

  return false;
}

export async function checkAppInstalled(scheme: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(`${scheme}://`);
  } catch {
    return false;
  }
}

export function getAppStoreLink(appId: string): string {
  const storeLinks: Record<string, { android: string; ios: string }> = {
    bkash: {
      android: 'https://play.google.com/store/apps/details?id=com.bKash.customerapp',
      ios: 'https://apps.apple.com/app/bkash/id990220289',
    },
    nagad: {
      android: 'https://play.google.com/store/apps/details?id=com.konasl.nagad',
      ios: 'https://apps.apple.com/app/nagad/id1473889479',
    },
    rocket: {
      android: 'https://play.google.com/store/apps/details?id=com.dbbl.mobilebanking',
      ios: 'https://apps.apple.com/app/rocket/id1133108487',
    },
    upay: {
      android: 'https://play.google.com/store/apps/details?id=com.ucbl.upay',
      ios: 'https://apps.apple.com/app/upay/id1464710085',
    },
    whatsapp: {
      android: 'https://play.google.com/store/apps/details?id=com.whatsapp',
      ios: 'https://apps.apple.com/app/whatsapp/id310633997',
    },
  };

  const links = storeLinks[appId];
  if (!links) return 'https://play.google.com/store/apps';

  return Platform.OS === 'ios' ? links.ios : links.android;
}
