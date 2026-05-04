import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Account } from '../types';
import { Theme, spacing, radius, typography } from '../theme';

interface Props {
  account: Account;
  unreadCount: number | null;
  loading: boolean;
  onPress: () => void;
  onLongPress: () => void;
  theme: Theme;
}

export function AccountCard({ account, unreadCount, loading, onPress, onLongPress, theme }: Props) {
  const initials = account.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: account.color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
          {account.email}
        </Text>
        <View style={styles.hostRow}>
          <Text style={[styles.host, { color: theme.textTertiary }]} numberOfLines={1}>
            {account.imapHost}
          </Text>
        </View>
      </View>

      <View style={styles.badge}>
        {loading ? (
          <ActivityIndicator size="small" color={account.color} />
        ) : unreadCount !== null && unreadCount > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: account.color }]}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        ) : (
          <View style={[styles.checkDot, { backgroundColor: theme.success }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.h3,
  },
  email: {
    ...typography.bodySmall,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  host: {
    ...typography.caption,
  },
  badge: {
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
