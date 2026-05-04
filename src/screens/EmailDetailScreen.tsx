import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, EmailDetail } from '../types';
import { fetchEmailDetail, markEmailRead } from '../services/api';
import { updateEmailReadState } from '../services/emailCache';
import { ErrorState } from '../components/ErrorState';
import { useTheme, spacing, radius, typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EmailDetail'>;
type Route = RouteProp<RootStackParamList, 'EmailDetail'>;

function wrapHtml(html: string, isDark: boolean): string {
  const bg = isDark ? '#0F0F1A' : '#FFFFFF';
  const fg = isDark ? '#F0F0FF' : '#1A1A2E';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 16px;
          background: ${bg}; color: ${fg};
          font-family: -apple-system, system-ui, sans-serif;
          font-size: 15px; line-height: 1.6;
          word-break: break-word; overflow-wrap: break-word;
        }
        img { max-width: 100%; height: auto; }
        a { color: #6C63FF; }
        pre, code { overflow-x: auto; font-size: 13px; }
        table { max-width: 100%; width: 100% !important; }
        td, th { padding: 4px; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;
}

export function EmailDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const theme = useTheme();
  const { account, email: emailSummary } = route.params;

  const [detail, setDetail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewHeight, setWebViewHeight] = useState(300);

  useEffect(() => {
    nav.setOptions({ title: emailSummary.subject || '(no subject)' });
  }, [nav, emailSummary.subject]);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchEmailDetail(account, emailSummary.uid);
        setDetail(d);
        await updateEmailReadState(account.id, emailSummary.uid, true);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [account, emailSummary.uid]);

  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => nav.navigate('Compose', { account, replyTo: emailSummary })}
          style={{ marginRight: 4 }}
        >
          <Text style={{ fontSize: 22 }}>↩️</Text>
        </TouchableOpacity>
      ),
    });
  }, [nav, account, emailSummary]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading email…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); }} theme={theme} />
      </View>
    );
  }

  if (!detail) return null;

  const isDark = theme.background === '#0F0F1A';
  const htmlContent = detail.htmlBody
    ? wrapHtml(detail.htmlBody, isDark)
    : detail.textBody
    ? wrapHtml(`<pre style="white-space:pre-wrap">${escapeHtml(detail.textBody)}</pre>`, isDark)
    : wrapHtml('<p style="color:#888">No content</p>', isDark);

  const fromDisplay = detail.from.name
    ? `${detail.from.name} <${detail.from.address}>`
    : detail.from.address;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.subject, { color: theme.text }]} selectable>
          {detail.subject || '(no subject)'}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: theme.textTertiary }]}>From</Text>
            <Text style={[styles.metaValue, { color: theme.text }]} selectable numberOfLines={1}>
              {fromDisplay}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: theme.textTertiary }]}>To</Text>
            <Text style={[styles.metaValue, { color: theme.text }]} selectable numberOfLines={1}>
              {detail.to.map((a) => a.address).join(', ')}
            </Text>
          </View>

          {detail.cc && detail.cc.length > 0 && (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.textTertiary }]}>Cc</Text>
              <Text style={[styles.metaValue, { color: theme.text }]} selectable numberOfLines={1}>
                {detail.cc.map((a) => a.address).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: theme.textTertiary }]}>Date</Text>
            <Text style={[styles.metaValue, { color: theme.textSecondary }]}>
              {new Date(detail.date).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Body via WebView */}
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webview, { height: webViewHeight }]}
        scrollEnabled={false}
        originWhitelist={['*']}
        onMessage={(evt) => {
          const h = parseInt(evt.nativeEvent.data, 10);
          if (!isNaN(h)) setWebViewHeight(h + 40);
        }}
        injectedJavaScript={`
          window.ReactNativeWebView.postMessage(
            String(document.body.scrollHeight)
          ); true;
        `}
        javaScriptEnabled
      />

      {/* Reply button */}
      <TouchableOpacity
        style={[styles.replyBtn, { backgroundColor: account.color }]}
        onPress={() => nav.navigate('Compose', { account, replyTo: emailSummary })}
      >
        <Text style={styles.replyBtnText}>↩  Reply</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subject: {
    ...typography.h3,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  meta: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaLabel: {
    ...typography.label,
    width: 36,
    flexShrink: 0,
  },
  metaValue: {
    ...typography.bodySmall,
    flex: 1,
  },
  webview: {
    width: '100%',
  },
  replyBtn: {
    margin: spacing.md,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  replyBtnText: {
    color: '#FFFFFF',
    ...typography.label,
    fontSize: 15,
  },
});
