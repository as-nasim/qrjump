// src/utils/appRouter.ts
// Detects which app a QR code belongs to and routes accordingly

export type AppRoute = {
  appName: string;
  appId: string; // used for display
  deepLink: string;
  fallbackUrl: string;
  icon: string; // emoji fallback
  color: string;
  category: 'payment' | 'social' | 'ecommerce' | 'food' | 'transport' | 'web' | 'text' | 'wifi' | 'contact';
  action: string; // human-readable action label
};

export type DetectionResult = AppRoute & {
  raw: string;
  confidence: 'definite' | 'probable' | 'fallback';
};

// App detection rules — ordered by specificity
const APP_RULES: Array<{
  test: (data: string) => boolean;
  route: (data: string) => AppRoute;
}> = [
  // ─── Bangladesh Payment Apps ───────────────────────────────────────────────
  {
    test: (d) => /bkash/i.test(d) || d.startsWith('bkash://'),
    route: (d) => ({
      appName: 'bKash',
      appId: 'bkash',
      deepLink: d.startsWith('bkash://') ? d : `bkash://pay?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.bKash.customerapp',
      icon: '💳',
      color: '#E2136E',
      category: 'payment',
      action: 'Pay with bKash',
    }),
  },
  {
    test: (d) => /nagad/i.test(d) || d.startsWith('nagad://'),
    route: (d) => ({
      appName: 'Nagad',
      appId: 'nagad',
      deepLink: d.startsWith('nagad://') ? d : `nagad://payment?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.konasl.nagad',
      icon: '🟠',
      color: '#F47B20',
      category: 'payment',
      action: 'Pay with Nagad',
    }),
  },
  {
    test: (d) => /rocket|dutchbangla|dbbl/i.test(d) || d.startsWith('rocket://'),
    route: (d) => ({
      appName: 'Rocket',
      appId: 'rocket',
      deepLink: d.startsWith('rocket://') ? d : `rocket://pay?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.dbbl.mobilebanking',
      icon: '🚀',
      color: '#7B2D8B',
      category: 'payment',
      action: 'Pay with Rocket',
    }),
  },
  {
    test: (d) => /upay|ucbl/i.test(d) || d.startsWith('upay://'),
    route: (d) => ({
      appName: 'Upay',
      appId: 'upay',
      deepLink: d.startsWith('upay://') ? d : `upay://pay?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.ucbl.upay',
      icon: '💜',
      color: '#6B3FA0',
      category: 'payment',
      action: 'Pay with Upay',
    }),
  },
  {
    test: (d) => /surecash/i.test(d) || d.startsWith('surecash://'),
    route: (d) => ({
      appName: 'SureCash',
      appId: 'surecash',
      deepLink: d.startsWith('surecash://') ? d : `surecash://pay?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.surecash',
      icon: '✅',
      color: '#00A859',
      category: 'payment',
      action: 'Pay with SureCash',
    }),
  },

  // ─── Global Payment Apps ───────────────────────────────────────────────────
  {
    test: (d) => /paypal\.com|paypal:\/\//i.test(d),
    route: (d) => ({
      appName: 'PayPal',
      appId: 'paypal',
      deepLink: `paypal://`,
      fallbackUrl: d,
      icon: '🅿️',
      color: '#003087',
      category: 'payment',
      action: 'Open PayPal',
    }),
  },
  {
    test: (d) => /paytm\.com|paytm:\/\//i.test(d),
    route: (d) => ({
      appName: 'Paytm',
      appId: 'paytm',
      deepLink: d.startsWith('paytm://') ? d : `paytm://payment?data=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://paytm.com',
      icon: '💰',
      color: '#00BAF2',
      category: 'payment',
      action: 'Pay with Paytm',
    }),
  },
  {
    test: (d) => /upi:|upi:\/\/|gpay|phonepe|bhim/i.test(d),
    route: (d) => ({
      appName: 'UPI Payment',
      appId: 'upi',
      deepLink: d,
      fallbackUrl: 'https://www.bhimupi.org.in/',
      icon: '🇮🇳',
      color: '#138808',
      category: 'payment',
      action: 'Pay via UPI',
    }),
  },

  // ─── Social / Messaging ────────────────────────────────────────────────────
  {
    test: (d) => /wa\.me|whatsapp:\/\/|api\.whatsapp/i.test(d),
    route: (d) => ({
      appName: 'WhatsApp',
      appId: 'whatsapp',
      deepLink: d.includes('wa.me') ? d : `whatsapp://send?text=${encodeURIComponent(d)}`,
      fallbackUrl: 'https://web.whatsapp.com',
      icon: '💬',
      color: '#25D366',
      category: 'social',
      action: 'Open WhatsApp',
    }),
  },
  {
    test: (d) => /t\.me\/|telegram:\/\//i.test(d),
    route: (d) => ({
      appName: 'Telegram',
      appId: 'telegram',
      deepLink: d.replace('https://t.me/', 'tg://resolve?domain='),
      fallbackUrl: d,
      icon: '✈️',
      color: '#0088CC',
      category: 'social',
      action: 'Open Telegram',
    }),
  },
  {
    test: (d) => /instagram\.com|instagram:\/\//i.test(d),
    route: (d) => ({
      appName: 'Instagram',
      appId: 'instagram',
      deepLink: `instagram://`,
      fallbackUrl: d,
      icon: '📸',
      color: '#E1306C',
      category: 'social',
      action: 'Open Instagram',
    }),
  },
  {
    test: (d) => /facebook\.com|fb:\/\//i.test(d),
    route: (d) => ({
      appName: 'Facebook',
      appId: 'facebook',
      deepLink: `fb://`,
      fallbackUrl: d,
      icon: '👤',
      color: '#1877F2',
      category: 'social',
      action: 'Open Facebook',
    }),
  },
  {
    test: (d) => /youtube\.com|youtu\.be|youtube:\/\//i.test(d),
    route: (d) => ({
      appName: 'YouTube',
      appId: 'youtube',
      deepLink: d.replace('https://www.youtube.com', 'youtube://').replace('https://youtu.be/', 'youtube://'),
      fallbackUrl: d,
      icon: '▶️',
      color: '#FF0000',
      category: 'social',
      action: 'Watch on YouTube',
    }),
  },

  // ─── E-commerce ────────────────────────────────────────────────────────────
  {
    test: (d) => /daraz\.com\.bd|daraz:\/\//i.test(d),
    route: (d) => ({
      appName: 'Daraz',
      appId: 'daraz',
      deepLink: `daraz://`,
      fallbackUrl: d,
      icon: '🛍️',
      color: '#F85606',
      category: 'ecommerce',
      action: 'Open Daraz',
    }),
  },
  {
    test: (d) => /shohoz\.com|shohoz:\/\//i.test(d),
    route: (d) => ({
      appName: 'Shohoz',
      appId: 'shohoz',
      deepLink: `shohoz://`,
      fallbackUrl: d,
      icon: '🚌',
      color: '#00A550',
      category: 'transport',
      action: 'Open Shohoz',
    }),
  },
  {
    test: (d) => /pathao\.com|pathao:\/\//i.test(d),
    route: (d) => ({
      appName: 'Pathao',
      appId: 'pathao',
      deepLink: `pathao://`,
      fallbackUrl: d,
      icon: '🛵',
      color: '#DC143C',
      category: 'transport',
      action: 'Open Pathao',
    }),
  },
  {
    test: (d) => /uber\.com|uber:\/\//i.test(d),
    route: (d) => ({
      appName: 'Uber',
      appId: 'uber',
      deepLink: `uber://`,
      fallbackUrl: d,
      icon: '🚗',
      color: '#000000',
      category: 'transport',
      action: 'Open Uber',
    }),
  },

  // ─── Special QR Types ──────────────────────────────────────────────────────
  {
    test: (d) => /^WIFI:/i.test(d),
    route: (d) => ({
      appName: 'Wi-Fi Network',
      appId: 'wifi',
      deepLink: d,
      fallbackUrl: '',
      icon: '📶',
      color: '#007AFF',
      category: 'wifi',
      action: 'Connect to Wi-Fi',
    }),
  },
  {
    test: (d) => /^BEGIN:VCARD/i.test(d),
    route: (d) => ({
      appName: 'Contact Card',
      appId: 'contact',
      deepLink: d,
      fallbackUrl: '',
      icon: '👤',
      color: '#34C759',
      category: 'contact',
      action: 'Save Contact',
    }),
  },
  {
    test: (d) => /^mailto:/i.test(d),
    route: (d) => ({
      appName: 'Email',
      appId: 'email',
      deepLink: d,
      fallbackUrl: '',
      icon: '📧',
      color: '#007AFF',
      category: 'social',
      action: 'Send Email',
    }),
  },
  {
    test: (d) => /^tel:/i.test(d),
    route: (d) => ({
      appName: 'Phone Call',
      appId: 'phone',
      deepLink: d,
      fallbackUrl: '',
      icon: '📞',
      color: '#34C759',
      category: 'social',
      action: 'Call Number',
    }),
  },
  {
    test: (d) => /^sms:/i.test(d),
    route: (d) => ({
      appName: 'SMS',
      appId: 'sms',
      deepLink: d,
      fallbackUrl: '',
      icon: '💬',
      color: '#34C759',
      category: 'social',
      action: 'Send SMS',
    }),
  },

  // ─── Generic URL ───────────────────────────────────────────────────────────
  {
    test: (d) => /^https?:\/\//i.test(d),
    route: (d) => ({
      appName: 'Website',
      appId: 'browser',
      deepLink: d,
      fallbackUrl: d,
      icon: '🌐',
      color: '#007AFF',
      category: 'web',
      action: 'Open Website',
    }),
  },

  // ─── Plain Text (fallback) ─────────────────────────────────────────────────
  {
    test: () => true,
    route: (d) => ({
      appName: 'Text',
      appId: 'text',
      deepLink: '',
      fallbackUrl: '',
      icon: '📝',
      color: '#8E8E93',
      category: 'text',
      action: 'View Text',
    }),
  },
];

export function detectApp(qrData: string): DetectionResult {
  const trimmed = qrData.trim();

  for (const rule of APP_RULES) {
    if (rule.test(trimmed)) {
      const route = rule.route(trimmed);
      const confidence =
        route.appId === 'browser' ? 'probable'
        : route.appId === 'text' ? 'fallback'
        : 'definite';

      return { ...route, raw: trimmed, confidence };
    }
  }

  // Should never reach here due to text fallback
  return {
    appName: 'Unknown',
    appId: 'unknown',
    deepLink: '',
    fallbackUrl: '',
    icon: '❓',
    color: '#8E8E93',
    category: 'text',
    action: 'View Content',
    raw: trimmed,
    confidence: 'fallback',
  };
}

export function parseWifiQR(data: string): { ssid: string; password: string; type: string } | null {
  // Format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
  const ssidMatch = data.match(/S:([^;]+)/);
  const passwordMatch = data.match(/P:([^;]+)/);
  const typeMatch = data.match(/T:([^;]+)/);

  if (!ssidMatch) return null;

  return {
    ssid: ssidMatch[1],
    password: passwordMatch ? passwordMatch[1] : '',
    type: typeMatch ? typeMatch[1] : 'WPA',
  };
}
