import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedProps,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import {
  fetchAllUsersTotalCo2Saved,
  subscribeCo2TotalUpdated,
} from "../services/missions";

// Animated SVG Circle for smooth strokeDashoffset updates
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type GoalProgressCircleProps = {
  size?: number; // total size of the square view
  strokeWidth?: number; // width of the progress ring
  trackColor?: string; // background track color
  progressColor?: string; // progress ring color (default matches primary button)
  // Optional: override computed values if you already have them to skip fetching
  goalKg?: number | null;
  totalReductionKg?: number | null;
  showPercent?: boolean;
  // Optional accessibility label prefix
  accessibilityLabel?: string;
};

/**
 * GoalProgressCircle
 *
 * Donut-style circular progress that:
 * - Fetches goal from `app_goal.target_co2_kg` (single row, id = true)
 * - Fetches total reduction by summing all users' values (tries users.total_reduction_kg, or user_reductions.*)
 * - Animates progress with rounded ends
 *
 * Dependencies (assumed installed):
 * - react-native-svg
 * - react-native-reanimated
 *
 * Usage:
 *   <GoalProgressCircle size={120} strokeWidth={12} />
 */
export default function GoalProgressCircle({
  size = 120,
  strokeWidth = 12,
  trackColor = "rgba(0,0,0,0.08)",
  progressColor = "#2f7147",
  goalKg: goalOverride,
  totalReductionKg: totalOverride,
  showPercent = true,
  accessibilityLabel = "Målprogress",
}: GoalProgressCircleProps) {
  // Data state
  const [goalKg, setGoalKg] = useState<number | null>(
    typeof goalOverride === "number" ? goalOverride : null
  );
  const [totalReductionKg, setTotalReductionKg] = useState<number | null>(
    typeof totalOverride === "number" ? totalOverride : null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Geometry
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Animated value (0..1)
  const progressValue = useSharedValue(0);

  // Compute final progress number clamped to [0, 1]
  const progress = useMemo(() => {
    if (!goalKg || goalKg <= 0 || !totalReductionKg || totalReductionKg < 0) {
      return 0;
    }
    const ratio = totalReductionKg / goalKg;
    return Math.max(0, Math.min(1, ratio));
  }, [goalKg, totalReductionKg]);

  // Animate when progress changes
  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressValue]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressValue.value);
    return {
      strokeDashoffset,
    };
  });

  // Data fetching
  useEffect(() => {
    let mounted = true;
    let unsubLocal: (() => void) | null = null;
    // Skip fetching if caller provided both values
    if (typeof goalOverride === "number" && typeof totalOverride === "number") {
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1) Read goal from app_goal (exactly one row, id = true)
        let goalVal = goalOverride ?? null;
        if (goalVal == null) {
          const { data: goalRow, error: goalErr } = await supabase
            .from("app_goal")
            .select("target_co2_kg")
            .eq("id", true)
            .maybeSingle();
          if (goalErr) {
            throw goalErr;
          }
          goalVal = (goalRow?.target_co2_kg as number | null) ?? null;
        }

        // 2) Sum all users' reductions using shared service
        let totalVal = totalOverride ?? null;
        if (totalVal == null) {
          totalVal = await fetchAllUsersTotalCo2Saved();
        }

        if (mounted) {
          setGoalKg(typeof goalVal === "number" ? goalVal : 0);
          setTotalReductionKg(typeof totalVal === "number" ? totalVal : 0);
        }

        // Local pub/sub to refresh after logging new actions
        unsubLocal = subscribeCo2TotalUpdated(async () => {
          const latest = await fetchAllUsersTotalCo2Saved();
          if (mounted) setTotalReductionKg(latest);
        });
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Kunde inte hämta data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
      if (unsubLocal) unsubLocal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalOverride, totalOverride]);

  // Derived label
  const percentText = useMemo(() => {
    const pct = Math.round(progress * 100);
    return `${pct} % av målet`;
  }, [progress]);

  // Responsive font sizes based on component size
  const percentFontSize = useMemo(() => Math.max(16, size * 0.32), [size]);
  const subLabelFontSize = useMemo(() => Math.max(10, size * 0.12), [size]);
  const metaFontSize = useMemo(() => Math.max(9, size * 0.1), [size]);
  const belowMargin = useMemo(() => Math.max(6, size * 0.08), [size]);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={[
          styles.container,
          { width: size, height: size },
        ]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{
          now: Math.round(progress * 100),
          min: 0,
          max: 100,
          text: percentText,
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

          {/* Rotate -90deg so progress starts at top */}
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            {/* Track circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />

            {/* Progress arc */}
            <AnimatedCircle
              animatedProps={animatedProps}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              // Rounded ends for visual polish
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center label */}
        <View pointerEvents="none" style={styles.centerContent}>
          {error ? (
            <Text style={[styles.label, { color: "#c00" }]} numberOfLines={2}>
              Fel
            </Text>
          ) : (
            <View style={{ alignItems: "center" }}>
              {showPercent && (
                <Text
                  style={[styles.percent, { fontSize: percentFontSize }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {Math.round(progress * 100)}%
                </Text>
              )}
              <Text
                style={[styles.subLabel, { fontSize: subLabelFontSize }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                av målet
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Below-the-circle meta text */}
      {!loading && goalKg != null && totalReductionKg != null && !error && (
        <Text
          style={[styles.meta, { fontSize: metaFontSize, marginTop: belowMargin, textAlign: "center" }]}
          numberOfLines={1}
        >
          {formatKg(totalReductionKg)} / {formatKg(goalKg)}
        </Text>
      )}
    </View>
  );

  /**
   * Returns a formatted string like "1 234 kg"
   */
  function formatKg(value: number) {
    try {
      return `${new Intl.NumberFormat("sv-SE").format(Math.max(0, value))} kg`;
    } catch {
      // Fallback if Intl not available
      return `${Math.round(Math.max(0, value))} kg`;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: 0, // overridden below to scale with size via parent
    // We'll scale via container size; set large base and let RN fit
    fontWeight: "700",
    color: "#1C2834",
    includeFontPadding: false,
    textAlignVertical: "center",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  subLabel: {
    marginTop: -2,
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
  },
});

