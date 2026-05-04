import React from 'react';
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
          options={{ title: 'MailSwitch', headerLargeTitle: true }}
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
