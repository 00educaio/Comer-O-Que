import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AmbientBackground, type AmbientTone } from '@/components/ui/ambient-background';
import { colors, layout, spacing } from '@/theme/theme';

type ScreenShellProps = {
  ambientStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  safeAreaStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  tone?: AmbientTone;
};

export function ScreenShell({
  ambientStyle,
  children,
  contentContainerStyle,
  edges = ['bottom'],
  keyboardShouldPersistTaps,
  safeAreaStyle,
  showsVerticalScrollIndicator = false,
  tone = 'default',
}: ScreenShellProps) {
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      style={styles.screen}>
      <SafeAreaView edges={edges} style={[styles.safeArea, safeAreaStyle]}>
        <AmbientBackground style={[styles.ambient, ambientStyle]} tone={tone}>
          {children}
        </AmbientBackground>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ambient: {
    minHeight: '100%',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.contentWidth,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
