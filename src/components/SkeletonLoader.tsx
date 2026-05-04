import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Theme, spacing, radius } from '../theme';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  theme: Theme;
  style?: object;
}

function SkeletonBox({ width, height, theme, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          backgroundColor: theme.skeleton,
          borderRadius: radius.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface EmailSkeletonProps {
  theme: Theme;
}

export function EmailSkeletonItem({ theme }: EmailSkeletonProps) {
  return (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <SkeletonBox width="45%" height={13} theme={theme} />
          <SkeletonBox width="15%" height={11} theme={theme} />
        </View>
        <SkeletonBox width="70%" height={13} theme={theme} style={{ marginTop: 6 }} />
        <SkeletonBox width="90%" height={11} theme={theme} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function AccountCardSkeleton({ theme }: { theme: Theme }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <SkeletonBox width={52} height={52} theme={theme} style={{ borderRadius: 26 }} />
      <View style={[styles.cardContent, { marginLeft: spacing.md }]}>
        <SkeletonBox width="50%" height={14} theme={theme} />
        <SkeletonBox width="70%" height={12} theme={theme} style={{ marginTop: 6 }} />
        <SkeletonBox width="40%" height={10} theme={theme} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
});
