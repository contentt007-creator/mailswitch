import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Account, RootStackParamList } from '../types';
import { getAllAccounts, deleteAccount } from '../services/accountStorage';
import { fetchUnreadCount } from '../services/api';
import { AccountCard } from '../components/AccountCard';
import { useTheme, spacing, radius, typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const theme = useTheme();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number | null>>({});
  const [loadingCounts, setLoadingCounts] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const loadAccounts = useCallback(async () => {
    const all = await getAllAccounts();
    setAccounts(all);
    return all;
  }, []);

  const fetchCounts = useCallback(async (accs: Account[]) => {
    if (accs.length === 0) return;

    // Mark all as loading
    const loading: Record<string, boolean> = {};
    accs.forEach((a) => (loading[a.id] = true));
    setLoadingCounts(loading);

    // Fetch in parallel
    await Promise.allSettled(
      accs.map(async (acc) => {
        try {
          const count = await fetchUnreadCount(acc);
          setUnreadCounts((prev) => ({ ...prev, [acc.id]: count }));
        } catch {
          setUnreadCounts((prev) => ({ ...prev, [acc.id]: null }));
        } finally {
          setLoadingCounts((prev) => ({ ...prev, [acc.id]: false }));
        }
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const all = await loadAccounts();
        if (!cancelled) fetchCounts(all);
      })();
      return () => {
        cancelled = true;
      };
    }, [loadAccounts, fetchCounts]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const all = await loadAccounts();
    await fetchCounts(all);
    setRefreshing(false);
  }, [loadAccounts, fetchCounts]);

  const handleDelete = useCallback(
    (account: Account) => {
      Alert.alert(
        'Remove Account',
        `Remove "${account.name}" from MailSwitch?\n\nThis only removes it from the app — your emails are untouched.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await deleteAccount(account.id);
              const all = await loadAccounts();
              fetchCounts(all);
            },
          },
        ],
      );
    },
    [loadAccounts, fetchCounts],
  );

  const handleLongPress = useCallback(
    (account: Account) => {
      Alert.alert(account.name, account.email, [
        {
          text: 'Edit',
          onPress: () => nav.navigate('AddAccount', { account }),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleDelete(account),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [nav, handleDelete],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {accounts.length === 0 ? (
          <EmptyState theme={theme} onAdd={() => nav.navigate('AddAccount', {})} />
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </Text>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                unreadCount={unreadCounts[account.id] ?? null}
                loading={loadingCounts[account.id] ?? false}
                onPress={() => nav.navigate('Inbox', { account })}
                onLongPress={() => handleLongPress(account)}
                theme={theme}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => nav.navigate('AddAccount', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ theme, onAdd }: { theme: ReturnType<typeof useTheme>; onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>📬</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No accounts yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Add your cPanel webmail accounts to get started. Switch between them with one tap.
      </Text>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.primary }]}
        onPress={onAdd}
      >
        <Text style={styles.addBtnText}>Add First Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl + (Platform.OS === 'ios' ? 16 : 0),
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: -2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  addBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  addBtnText: {
    color: '#FFFFFF',
    ...typography.label,
    fontSize: 16,
  },
});
