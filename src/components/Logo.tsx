import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, radius } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  theme: Theme;
  showText?: boolean;
}

const sizes = {
  sm: { box: 32, icon: 14, text: 16 },
  md: { box: 44, icon: 20, text: 22 },
  lg: { box: 72, icon: 32, text: 32 },
};

export function Logo({ size = 'md', theme, showText = false }: Props) {
  const s = sizes[size];

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBox,
          {
            width: s.box,
            height: s.box,
            borderRadius: s.box * 0.22,
            backgroundColor: theme.primary,
          },
        ]}
      >
        {/* Envelope top flap */}
        <Text style={{ fontSize: s.icon, lineHeight: s.box, textAlign: 'center' }}>
          ✉️
        </Text>
      </View>

      {showText && (
        <View style={styles.textGroup}>
          <Text style={[styles.name, { color: theme.text, fontSize: s.text }]}>
            Mail<Text style={{ color: theme.primary }}>Switch</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

// Inline SVG-style logo rendered purely with Views — no image dependency
export function LogoMark({ theme }: { theme: Theme }) {
  return (
    <View style={[styles.mark, { backgroundColor: theme.primary }]}>
      {/* Envelope */}
      <View style={styles.envelope}>
        <View style={[styles.envBody, { borderColor: '#fff' }]} />
        <View style={styles.envFlap}>
          <View style={[styles.envFlapLeft, { borderColor: '#fff' }]} />
          <View style={[styles.envFlapRight, { borderColor: '#fff' }]} />
        </View>
      </View>
      {/* Switch arrows */}
      <Text style={styles.arrows}>⇄</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textGroup: {
    justifyContent: 'center',
  },
  name: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelope: {
    position: 'relative',
  },
  envBody: {
    width: 22,
    height: 15,
    borderWidth: 2,
    borderRadius: 2,
  },
  envFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  envFlapLeft: {
    width: 11,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
  },
  envFlapRight: {
    width: 11,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
  },
  arrows: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
});
