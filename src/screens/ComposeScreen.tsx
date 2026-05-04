import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { sendEmail } from '../services/api';
import { useTheme, spacing, radius, typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Compose'>;
type Route = RouteProp<RootStackParamList, 'Compose'>;

export function ComposeScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const theme = useTheme();
  const { account, replyTo } = route.params;

  const isReply = !!replyTo;

  const [to, setTo] = useState(
    isReply ? (replyTo.from.address ?? '') : '',
  );
  const [subject, setSubject] = useState(
    isReply
      ? replyTo.subject.startsWith('Re:')
        ? replyTo.subject
        : `Re: ${replyTo.subject}`
      : '',
  );
  const [body, setBody] = useState(
    isReply
      ? `\n\n---\nOn ${new Date(replyTo.date).toLocaleString()}, ${replyTo.from.address} wrote:\n`
      : '',
  );
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<TextInput>(null);

  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending}
          style={{ marginRight: 4 }}
        >
          {sending ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={{ color: theme.primary, ...typography.label, fontSize: 16 }}>Send</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [nav, sending, to, subject, body, theme]);

  function validate(): string | null {
    if (!to.trim()) return 'Recipient (To) is required.';
    const addresses = to.split(',').map((a) => a.trim());
    for (const addr of addresses) {
      if (!addr.includes('@')) return `"${addr}" doesn't look like a valid email address.`;
    }
    if (!subject.trim()) return 'Subject is required.';
    if (!body.trim()) return 'Message body is required.';
    return null;
  }

  async function handleSend() {
    const err = validate();
    if (err) { Alert.alert('Before you send…', err); return; }

    setSending(true);
    try {
      await sendEmail({
        account,
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        inReplyTo: replyTo?.messageId,
        references: replyTo?.messageId,
      });
      Alert.alert('✅ Sent', 'Your email was sent successfully.', [
        { text: 'Done', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Send Failed', (e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const inputStyle = [styles.field, { color: theme.text, borderBottomColor: theme.border }];
  const labelStyle = [styles.label, { color: theme.textTertiary }];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Account badge */}
      <View style={[styles.accountBadge, { backgroundColor: theme.surfaceVariant, borderBottomColor: theme.border }]}>
        <View style={[styles.accountDot, { backgroundColor: account.color }]} />
        <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>
          From: {account.name} &lt;{account.email}&gt;
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* To */}
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={labelStyle}>To</Text>
          <TextInput
            style={inputStyle}
            value={to}
            onChangeText={setTo}
            placeholder="recipient@example.com"
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
          />
        </View>

        {/* Subject */}
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={labelStyle}>Subject</Text>
          <TextInput
            style={inputStyle}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
            placeholderTextColor={theme.textTertiary}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
          />
        </View>

        {/* Body */}
        <TextInput
          ref={bodyRef}
          style={[styles.bodyInput, { color: theme.text }]}
          value={body}
          onChangeText={setBody}
          placeholder="Write your message…"
          placeholderTextColor={theme.textTertiary}
          multiline
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Bottom send bar */}
      <View style={[styles.bottomBar, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: account.color }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Send Email</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  accountDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accountLabel: {
    ...typography.bodySmall,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    width: 50,
    flexShrink: 0,
  },
  field: {
    flex: 1,
    ...typography.body,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  bodyInput: {
    flex: 1,
    padding: spacing.md,
    ...typography.body,
    lineHeight: 22,
    minHeight: 300,
  },
  bottomBar: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sendBtn: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    ...typography.label,
    fontSize: 15,
  },
});
