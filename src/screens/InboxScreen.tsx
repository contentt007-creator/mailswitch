import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Email } from '../types';
import { fetchEmails } from '../services/api';
import { getCachedEmails, setCachedEmails } from '../services/emailCache';
import { EmailListItem } from '../components/EmailListItem';
import { EmailSkeletonItem } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { useTheme, spacing, typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Inbox'>;
type Route = RouteProp<RootStackParamList, 'Inbox'>;

const PAGE_SIZE = 30;

export function InboxScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const theme = useTheme();
  const { account } = route.params;

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!append) setError(null);

      try {
        // Show cached data immediately on first load
        if (pageNum === 1 && !append) {
          const cached = await getCachedEmails(account.id);
          if (cached) {
            setEmails(cached);
            setLoading(false);
          }
        }

        const result = await fetchEmails({ account, page: pageNum, pageSize: PAGE_SIZE });

        if (append) {
          setEmails((prev) => {
            const existingUids = new Set(prev.map((e) => e.uid));
            const newOnes = result.filter((e) => !existingUids.has(e.uid));
            return [...prev, ...newOnes];
          });
        } else {
          setEmails(result);
          setCachedEmails(account.id, result);
        }

        setHasMore(result.length === PAGE_SIZE);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [account],
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    load(1, false);
  }, [load]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    load(next, true);
  }, [loadingMore, hasMore, page, load]);

  const handleEmailPress = useCallback(
    (email: Email) => {
      nav.navigate('EmailDetail', { account, email });
    },
    [nav, account],
  );

  // Update read state when returning from detail
  const updateReadState = useCallback((uid: string) => {
    setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, isRead: true } : e)));
  }, []);

  // Header compose button
  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => nav.navigate('Compose', { account })}
          style={{ marginRight: 4 }}
        >
          <Text style={{ color: theme.primary, fontSize: 28, fontWeight: '300', lineHeight: 32 }}>
            ✏️
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [nav, account, theme]);

  if (loading && emails.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {[...Array(8)].map((_, i) => (
          <EmailSkeletonItem key={i} theme={theme} />
        ))}
      </View>
    );
  }

  if (error && emails.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState
          message={error}
          onRetry={() => { setLoading(true); load(1, false); }}
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Non-blocking error banner when we have cached data */}
      {error && emails.length > 0 && (
        <View style={[styles.errorBanner, { backgroundColor: theme.error }]}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={emails}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <EmailListItem
            email={item}
            accentColor={account.color}
            onPress={() => handleEmailPress(item)}
            theme={theme}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Inbox is empty
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={emails.length === 0 ? { flex: 1 } : undefined}
        style={{ backgroundColor: theme.surface }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorBanner: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorBannerText: {
    color: '#FFFFFF',
    ...typography.bodySmall,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
