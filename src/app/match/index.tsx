import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientBackground } from "@/components/ui/ambient-background";
import { colors, radius, shadows, spacing, typography } from "@/theme/theme";

const howItWorks = [
  {
    emoji: "🧑‍🍳",
    text: "Cada pessoa entra com apelido temporário e sem login.",
  },
  {
    emoji: "💌",
    text: "O convite funciona por código curto e por link compartilhável.",
  },
  {
    emoji: "👍",
    text: "Quando os dois curtem a mesma comida, o match aparece na hora.",
  },
] as const;

const quickFacts = [
  "Feito para 2 pessoas",
  "Sala expira em 2 horas",
  "Rodada continua após o match",
];

export default function MatchIndexScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <AmbientBackground style={styles.ambient} tone="match">
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>ModoMatch online</Text>
            </View>

            <Image
              accessible={false}
              contentFit="contain"
              source={require("../../../assets/images/ComerOQue/mode-match-coming-soon-illustration.png")}
              style={styles.heroImage}
            />

            <Text accessibilityRole="header" style={styles.title}>
              Decidir em dupla agora tem cara de produto de verdade.
            </Text>
            <Text style={styles.subtitle}>
              Convide outra pessoa, votem nos cards e deixem a rodada seguir até
              pintar mais de um match.
            </Text>

            <View style={styles.quickFacts}>
              {quickFacts.map((fact) => (
                <View key={fact} style={styles.quickFactChip}>
                  <Text style={styles.quickFactText}>{fact}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.stepsCard}>
            <Text style={styles.sectionEyebrow}>Como funciona</Text>
            <Text style={styles.sectionTitle}>
              Uma dinâmica simples, rápida e gostosa de usar.
            </Text>
            <View style={styles.steps}>
              {howItWorks.map((step) => (
                <View key={step.text} style={styles.stepRow}>
                  <View style={styles.stepEmojiBubble}>
                    <Text style={styles.stepEmoji}>{step.emoji}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              Sala enxuta, experiência caprichada
            </Text>
            <Text style={styles.noticeText}>
              O v1 é focado em 2 pessoas, com filtro por categoria e começo
              manual pelo criador.
            </Text>
          </View>

          <View style={styles.actions}>
            <Link href="/match/create" asChild>
              <Pressable
                accessibilityHint="Abre a criação de uma nova sala"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Criar sala</Text>
              </Pressable>
            </Link>

            <Link href="/match/join" asChild>
              <Pressable
                accessibilityHint="Abre a tela para entrar com um código"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  Entrar com código
                </Text>
              </Pressable>
            </Link>
          </View>
        </AmbientBackground>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  ambient: {
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    width: "100%",
  },
  heroCard: {
    ...shadows.floating,
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  heroImage: {
    height: 260,
    marginTop: spacing.sm,
    width: "100%",
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 540,
    textAlign: "center",
  },
  quickFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  quickFactChip: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickFactText: {
    ...typography.caption,
    color: colors.text,
  },
  stepsCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.xl,
    padding: spacing.lg,
    width: "100%",
  },
  sectionEyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    marginTop: spacing.sm,
  },
  steps: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stepRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  stepEmojiBubble: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  stepEmoji: {
    fontSize: 28,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  noticeCard: {
    ...shadows.soft,
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: "100%",
  },
  noticeTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  noticeText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
    width: "100%",
  },
  primaryButton: {
    ...shadows.soft,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: spacing.xl,
  },
  secondaryButton: {
    ...shadows.soft,
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
