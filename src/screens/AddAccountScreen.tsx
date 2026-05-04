import React, { useState } from 'react';
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
import { RootStackParamList, AccountFormData } from '../types';
import { addAccount, updateAccount } from '../services/accountStorage';
import { testConnection } from '../services/api';
import { useTheme, spacing, radius, typography } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddAccount'>;
type Route = RouteProp<RootStackParamList, 'AddAccount'>;

const DEFAULT_IMAP_PORT = '993';
const DEFAULT_SMTP_PORT = '465';

export function AddAccountScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const theme = useTheme();
  const existingAccount = route.params?.account;

  const [form, setForm] = useState<AccountFormData>({
    name: existingAccount?.name ?? '',
    email: existingAccount?.email ?? '',
    password: existingAccount?.password ?? '',
    imapHost: existingAccount?.imapHost ?? '',
    imapPort: existingAccount ? String(existingAccount.imapPort) : DEFAULT_IMAP_PORT,
    smtpHost: existingAccount?.smtpHost ?? '',
    smtpPort: existingAccount ? String(existingAccount.smtpPort) : DEFAULT_SMTP_PORT,
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function setField(field: keyof AccountFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function autofillHost() {
    if (form.email && !form.imapHost) {
      const domain = form.email.split('@')[1];
      if (domain) {
        setForm((prev) => ({
          ...prev,
          imapHost: prev.imapHost || `mail.${domain}`,
          smtpHost: prev.smtpHost || `mail.${domain}`,
        }));
      }
    }
  }

  function validate(): string | null {
    if (!form.name.trim()) return 'Display name is required.';
    if (!form.email.trim() || !form.email.includes('@')) return 'Valid email address is required.';
    if (!form.password) return 'Password is required.';
    if (!form.imapHost.trim()) return 'IMAP host is required.';
    if (!form.smtpHost.trim()) return 'SMTP host is required.';
    const iport = parseInt(form.imapPort, 10);
    const sport = parseInt(form.smtpPort, 10);
    if (isNaN(iport) || iport < 1 || iport > 65535) return 'Invalid IMAP port.';
    if (isNaN(sport) || sport < 1 || sport > 65535) return 'Invalid SMTP port.';
    return null;
  }

  async function handleTestConnection() {
    const err = validate();
    if (err) { Alert.alert('Validation Error', err); return; }
    setTesting(true);
    try {
      await testConnection({
        id: existingAccount?.id ?? 'test',
        name: form.name,
        email: form.email,
        password: form.password,
        imapHost: form.imapHost,
        imapPort: parseInt(form.imapPort, 10),
        smtpHost: form.smtpHost,
        smtpPort: parseInt(form.smtpPort, 10),
        color: '#000',
        createdAt: '',
      });
      Alert.alert('✅ Connected', 'IMAP connection successful!');
    } catch (e) {
      Alert.alert('Connection Failed', (e as Error).message);
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    const err = validate();
    if (err) { Alert.alert('Validation Error', err); return; }
    setSaving(true);
    try {
      if (existingAccount) {
        await updateAccount(existingAccount.id, form);
      } else {
        await addAccount(form);
      }
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.surfaceVariant,
      borderColor: theme.border,
      color: theme.text,
    },
  ];
  const labelStyle = [styles.label, { color: theme.textSecondary }];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info */}
        <SectionHeader title="Account" theme={theme} />

        <Text style={labelStyle}>Display Name</Text>
        <TextInput
          style={inputStyle}
          value={form.name}
          onChangeText={(v) => setField('name', v)}
          placeholder="e.g. Work Email"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={labelStyle}>Email Address</Text>
        <TextInput
          style={inputStyle}
          value={form.email}
          onChangeText={(v) => setField('email', v)}
          onBlur={autofillHost}
          placeholder="you@yourdomain.com"
          placeholderTextColor={theme.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Text style={labelStyle}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[inputStyle, { flex: 1, marginBottom: 0 }]}
            value={form.password}
            onChangeText={(v) => setField('password', v)}
            placeholder="Webmail password"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TouchableOpacity
            style={[styles.eyeBtn, { borderColor: theme.border, backgroundColor: theme.surfaceVariant }]}
            onPress={() => setShowPassword((p) => !p)}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 18 }}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* IMAP */}
        <SectionHeader title="Incoming Mail (IMAP)" theme={theme} />

        <Text style={labelStyle}>IMAP Host</Text>
        <TextInput
          style={inputStyle}
          value={form.imapHost}
          onChangeText={(v) => setField('imapHost', v)}
          placeholder="mail.yourdomain.com"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="next"
        />

        <Text style={labelStyle}>IMAP Port (SSL)</Text>
        <TextInput
          style={inputStyle}
          value={form.imapPort}
          onChangeText={(v) => setField('imapPort', v)}
          placeholder="993"
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          returnKeyType="next"
        />

        {/* SMTP */}
        <SectionHeader title="Outgoing Mail (SMTP)" theme={theme} />

        <Text style={labelStyle}>SMTP Host</Text>
        <TextInput
          style={inputStyle}
          value={form.smtpHost}
          onChangeText={(v) => setField('smtpHost', v)}
          placeholder="mail.yourdomain.com"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="next"
        />

        <Text style={labelStyle}>SMTP Port (SSL)</Text>
        <TextInput
          style={inputStyle}
          value={form.smtpPort}
          onChangeText={(v) => setField('smtpPort', v)}
          placeholder="465"
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          returnKeyType="done"
        />

        {/* Actions */}
        <TouchableOpacity
          style={[styles.testBtn, { borderColor: theme.primary }]}
          onPress={handleTestConnection}
          disabled={testing || saving}
        >
          {testing ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={[styles.testBtnText, { color: theme.primary }]}>Test Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={saving || testing}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>
              {existingAccount ? 'Save Changes' : 'Add Account'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ title, theme }: { title: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  sectionHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    ...typography.body,
    marginBottom: spacing.xs,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eyeBtn: {
    width: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtn: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  testBtnText: {
    ...typography.label,
    fontSize: 15,
  },
  saveBtn: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveBtnText: {
    color: '#FFFFFF',
    ...typography.label,
    fontSize: 15,
  },
});
