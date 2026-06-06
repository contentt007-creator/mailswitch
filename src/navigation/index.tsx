import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { AddAccountScreen } from '../screens/AddAccountScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { EmailDetailScreen } from '../screens/EmailDetailScreen';
import { ComposeScreen } from '../screens/ComposeScreen';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderLogo({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.headerLogo}>
      <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
        <Text style={styles.logoEmoji}>✉️</Text>
        <Text style={styles.logoArrow}>⇄</Text>
      </View>
      <Text style={[styles.logoText, { color: theme.text }]}>
        Mail<Text style={{ color: theme.primary }}>Switch</Text>
      </Text>
    </View>
  );
}

export function AppNavigator() {
  const scheme = useColorScheme();
  const theme = useTheme();

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.headerBackground,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={HomeScreen}
          options={{
            headerTitle: () => <HeaderLogo theme={theme} />,
            headerLargeTitle: false,
          }}
        />
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={({ route }) => ({
            title: route.params?.account ? 'Edit Account' : 'Add Account',
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Inbox"
          component={InboxScreen}
          options={({ route }) => ({ title: route.params.account.name })}
        />
        <Stack.Screen
          name="EmailDetail"
          component={EmailDetailScreen}
          options={{ title: 'Email' }}
        />
        <Stack.Screen
          name="Compose"
          component={ComposeScreen}
          options={({ route }) => ({
            title: route.params.replyTo ? 'Reply' : 'New Email',
            presentation: 'modal',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 14,
    lineHeight: 18,
  },
  logoArrow: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '900',
    lineHeight: 12,
    marginTop: -2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
