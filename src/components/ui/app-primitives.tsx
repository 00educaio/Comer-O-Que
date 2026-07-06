import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type SurfaceTone =
  | 'default'
  | 'warm'
  | 'soft'
  | 'sun'
  | 'mint'
  | 'peach'
  | 'danger';

type SurfaceCardProps = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  gradientColors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
};

type PillTone = 'red' | 'cream' | 'sun' | 'mint' | 'dark' | 'outline';

type AppPillProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  tone?: PillTone;
};

type AppButtonVariant = 'primary' | 'secondary' | 'soft';

type AppButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title: string;
  variant?: AppButtonVariant;
};

type SectionHeadingProps = {
  description?: string;
  eyebrow?: string;
  title: string;
};

type FormFieldProps = TextInputProps & {
  fieldStyle?: StyleProp<ViewStyle>;
  hint?: string;
  inputStyle?: StyleProp<TextStyle>;
  label: string;
  rightLabel?: string;
  variant?: 'default' | 'code';
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

const surfaceTones: Record<SurfaceTone, { backgroundColor: string; borderColor: string }> = {
  danger: {
    backgroundColor: '#FFF1F1',
    borderColor: colors.primaryStrong,
  },
  default: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
  },
  mint: {
    backgroundColor: colors.mint,
    borderColor: colors.cardBorderSoft,
  },
  peach: {
    backgroundColor: colors.peach,
    borderColor: colors.cardBorderSoft,
  },
  soft: {
    backgroundColor: colors.surfaceTinted,
    borderColor: colors.cardBorderSoft,
  },
  sun: {
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorderSoft,
  },
  warm: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
  },
};

const pillTones: Record<PillTone, { backgroundColor: string; borderColor: string; color: string }> = {
  cream: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    color: colors.primaryDark,
  },
  dark: {
    backgroundColor: colors.text,
    borderColor: colors.text,
    color: colors.textInverted,
  },
  mint: {
    backgroundColor: colors.mint,
    borderColor: colors.cardBorderSoft,
    color: colors.text,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.cardBorderSoft,
    color: colors.text,
  },
  red: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primarySoft,
    color: colors.primaryDark,
  },
  sun: {
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorderSoft,
    color: colors.text,
  },
};

export function Reveal({ children, delay = 0, style }: RevealProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(18)}
      style={style}>
      {children}
    </Animated.View>
  );
}

export function SurfaceCard({
  children,
  contentStyle,
  gradientColors,
  style,
  tone = 'default',
}: SurfaceCardProps) {
  const palette = surfaceTones[tone];

  return (
    <View
      style={[
        styles.cardFrame,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}>
      {gradientColors ? (
        <LinearGradient colors={gradientColors} style={[styles.cardBody, contentStyle]}>
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.cardBody, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

export function AppPill({
  label,
  style,
  textStyle,
  tone = 'red',
}: AppPillProps) {
  const palette = pillTones[tone];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}>
      <Text style={[styles.pillText, { color: palette.color }, textStyle]}>{label}</Text>
    </View>
  );
}

export function AppButton({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  onPress,
  style,
  textStyle,
  title,
  variant = 'primary',
}: AppButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonFrame,
        variant === 'secondary' && styles.buttonFrameSecondary,
        variant === 'soft' && styles.buttonFrameSoft,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        style,
      ]}>
      {isPrimary ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryStrong]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.buttonFill}>
          <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.buttonFill}>
          <Text
            style={[
              variant === 'soft' ? styles.softButtonText : styles.secondaryButtonText,
              textStyle,
            ]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function SectionHeading({
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    </View>
  );
}

export function FormField({
  fieldStyle,
  hint,
  inputStyle,
  label,
  rightLabel,
  variant = 'default',
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={[styles.field, fieldStyle]}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {rightLabel ? <Text style={styles.fieldRightLabel}>{rightLabel}</Text> : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSoft}
        style={[
          styles.input,
          variant === 'code' && styles.codeInput,
          inputProps.multiline && styles.multilineInput,
          inputStyle,
        ]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonFill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 62,
    paddingHorizontal: spacing.xl,
  },
  buttonFrame: {
    ...shadows.soft,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  buttonFrameSecondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderWidth: 1,
  },
  buttonFrameSoft: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  cardBody: {
    borderRadius: radius.xl - 2,
    minHeight: 0,
    padding: spacing.lg,
  },
  cardFrame: {
    ...shadows.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  codeInput: {
    ...typography.code,
    backgroundColor: colors.primaryGlow,
    letterSpacing: 4.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  field: {
    gap: spacing.sm,
  },
  fieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldHint: {
    ...typography.body,
    color: colors.textMuted,
  },
  fieldLabel: {
    ...typography.subheading,
    color: colors.text,
  },
  fieldRightLabel: {
    ...typography.caption,
    color: colors.textSoft,
  },
  input: {
    ...typography.bodyStrong,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    minHeight: 62,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 180,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typography.label,
    textTransform: 'uppercase',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionEyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xs,
  },
  softButtonText: {
    ...typography.button,
    color: colors.primaryDark,
    textAlign: 'center',
  },
});
