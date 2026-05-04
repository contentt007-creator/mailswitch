import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Email } from '../types';
import { Theme, spacing, radius, typography } from '../theme';

interface Props {
  email: Email;
  accentColor: string;
  onPress: () => void;
  theme: Theme;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function senderDisplay(email: Email): string {
  const { name, address } = email.from;
  return name && name.trim() ? name.trim() : address;
}

export function EmailListItem({ email, accentColor, onPress, theme }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: email.isRead ? theme.surface : theme.unread,
          borderBottomColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {!email.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.sender,
              { color: theme.text, fontWeight: email.isRead ? '400' : '700' },
            ]}
            numberOfLines={1}
          >
            {senderDisplay(email)}
          </Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>
            {formatDate(email.date)}
          </Text>
        </View>

        <Text
          style={[
            styles.subject,
            { color: theme.text, fontWeight: email.isRead ? '400' : '600' },
          ]}
          numberOfLines={1}
        >
          {email.subject || '(no subject)'}
        </Text>

        <Text style={[styles.snippet, { color: theme.textSecondary }]} numberOfLines={1}>
          {email.snippet}
        </Text>
      </View>

      {email.hasAttachments && (
        <Text style={[styles.attachIcon, { color: theme.textTertiary }]}>📎</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    ...typography.label,
    flex: 1,
    marginRight: spacing.sm,
  },
  date: {
    ...typography.caption,
    flexShrink: 0,
  },
  subject: {
    ...typography.body,
  },
  snippet: {
    ...typography.bodySmall,
  },
  attachIcon: {
    marginLeft: spacing.sm,
    fontSize: 14,
  },
});
