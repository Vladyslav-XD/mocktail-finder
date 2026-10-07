import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { duration, useReduceMotion } from '../theme/motion';

/**
 * Bubbles from the 1.2 handoff (prototype `mfbubble`): each rises from 9 to −6 viewBox
 * units over a 3.4 s loop, fading in by 22 % and out after 72 %, the four a quarter
 * cycle apart. Static with Reduce Motion.
 */
interface BubbleConfig {
  id: number;
  path: string;
  /** Start of the bubble's cycle, as a fraction of the loop (prototype delays 0, −0.85, −1.7, −2.55 s). */
  phase: number;
}

const BUBBLES: BubbleConfig[] = [
  { id: 1, phase: 0, path: "M45.1879 42.7637C45.1879 43.3989 44.6649 43.9132 44.0188 43.9132C43.3731 43.9132 42.8496 43.3989 42.8496 42.7637C42.8496 42.1285 43.3731 41.6143 44.0188 41.6143C44.6649 41.6143 45.1879 42.1285 45.1879 42.7637Z" },
  { id: 2, phase: 0.25, path: "M38.8462 38.7699C38.8462 39.2712 38.433 39.6774 37.9235 39.6774C37.4136 39.6774 37 39.2712 37 38.7699C37 38.2685 37.4136 37.8623 37.9235 37.8623C38.433 37.8623 38.8462 38.2685 38.8462 38.7699Z" },
  { id: 3, phase: 0.5, path: "M42.028 31.3883C42.028 31.9789 41.541 32.4573 40.9408 32.4573C40.3401 32.4573 39.8535 31.9789 39.8535 31.3883C39.8535 30.7986 40.3401 30.3193 40.9408 30.3193C41.541 30.3193 42.028 30.7986 42.028 31.3883Z" },
  { id: 4, phase: 0.75, path: "M51.1591 29.1495C51.1591 29.7842 50.6356 30.2993 49.9899 30.2993C49.3442 30.2993 48.8203 29.7842 48.8203 29.1495C48.8203 28.5147 49.3442 28 49.9899 28C50.6356 28 51.1591 28.5147 51.1591 29.1495Z" },
];

/** Rise in viewBox units (prototype keyframes: translateY 9px → −6px). */
const RISE_FROM = 9;
const RISE_TO = -6;

export const LOGO_VIEWBOX = '27 28 25 49';

/** The martini glass of the app logo (handoff assets/logo-martini.svg). Also on the share card. */
export const LOGO_GLASS_PATH = "M51.1278 46.0696C51.4618 45.7577 51.4756 45.239 51.1586 44.9107C50.8413 44.5823 50.3137 44.5688 49.9795 44.8804L48.0175 46.7116C46.5608 48.0714 44.5497 48.7258 42.5633 48.4302C42.0431 48.3528 41.5353 48.2133 41.0522 48.0011C39.915 47.5018 38.981 46.6576 37.8292 46.1894C37.1378 45.9083 36.4021 45.7577 35.6575 45.721L32.6974 37.4827C32.5632 37.1089 32.1462 36.9131 31.7666 37.0451C31.3867 37.177 31.1872 37.5867 31.3214 37.9605L35.65 50.0252L33.5929 45.8987C32.7894 46.0747 32.0126 46.3703 31.3088 46.7647L31.3074 46.7655C30.9826 46.9495 30.5734 46.9014 30.3015 46.6477L28.408 44.8804C28.074 44.5688 27.5464 44.5823 27.2291 44.9107C26.9121 45.239 26.9256 45.7577 27.2599 46.0696L38.36 56.4298V74.6905C38.36 74.7162 38.3387 74.7377 38.3126 74.7383C35.6451 74.8208 33.6058 75.2709 33.6058 75.8136C33.6058 76.4151 36.1075 76.9025 39.194 76.9025C42.2802 76.9025 44.7819 76.4151 44.7819 75.8136C44.7819 75.2709 42.7426 74.8208 40.0751 74.7383C40.049 74.7377 40.0277 74.7162 40.0277 74.6905V56.4298L51.1278 46.0696Z";

const BubbleView = ({
  config,
  color,
  scaleRatio,
  still,
}: {
  config: BubbleConfig;
  color: string;
  scaleRatio: number;
  still: boolean;
}) => {
  const progress = useRef(new Animated.Value(config.phase)).current;

  useEffect(() => {
    if (still) return;
    let loop: Animated.CompositeAnimation | null = null;
    // First the rest of this bubble's cycle, then whole cycles from the start.
    const first = Animated.timing(progress, {
      toValue: 1,
      duration: duration.logoBubbles * (1 - config.phase),
      easing: Easing.linear,
      useNativeDriver: true,
    });
    first.start(({ finished }) => {
      if (!finished) return;
      progress.setValue(0);
      loop = Animated.loop(
        Animated.timing(progress, { toValue: 1, duration: duration.logoBubbles, easing: Easing.out(Easing.ease), useNativeDriver: true })
      );
      loop.start();
    });
    return () => {
      first.stop();
      loop?.stop();
    };
  }, [config.phase, progress, still]);

  // viewBox units → points (the glass is drawn 24 pt wide for a 25-unit viewBox).
  const unit = (24 * scaleRatio) / 25;
  const translateY = still
    ? 0
    : progress.interpolate({ inputRange: [0, 1], outputRange: [RISE_FROM * unit, RISE_TO * unit] });
  const opacity = still
    ? 1
    : progress.interpolate({ inputRange: [0, 0.22, 0.72, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View style={{ position: 'absolute', opacity, transform: [{ translateY }] }}>
      <Svg width={24 * scaleRatio} height={48 * scaleRatio} viewBox="27 28 25 49">
        <Path d={config.path} fill={color} />
      </Svg>
    </Animated.View>
  );
};

interface AnimatedMartiniIconProps {
  size?: number;
  color?: string;
  disablePulsing?: boolean;
  /** Duration of one direction of the breathing pulse (ms). Default 2000 = a 4 s breath. */
  pulseDuration?: number;
}

export const AnimatedMartiniIcon = ({
  size = 24,
  color = '#FFFFFF',
  disablePulsing = false,
  pulseDuration = 2000,
}: AnimatedMartiniIconProps) => {
  const logoScale = useRef(new Animated.Value(0.98)).current;
  const scaleRatio = size / 24;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (disablePulsing || reduceMotion) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.04,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.98,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [disablePulsing, reduceMotion, pulseDuration, logoScale]);

  return (
    <Animated.View
      style={{
        width: 24 * scaleRatio,
        height: 48 * scaleRatio,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: logoScale }],
      }}
    >
      <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Svg width={24 * scaleRatio} height={48 * scaleRatio} viewBox={LOGO_VIEWBOX}>
          <Path d={LOGO_GLASS_PATH} fill={color} />
        </Svg>
      </View>

      {BUBBLES.map((b) => (
        <BubbleView key={b.id} config={b} color={color} scaleRatio={scaleRatio} still={reduceMotion} />
      ))}
    </Animated.View>
  );
};
