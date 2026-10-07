import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { duration, easing, toastOffset, useReduceMotion } from '../theme/motion';

/**
 * Toasts: one short line, 200 ms in, 2 s on screen, 200 ms out (README → Motion).
 *
 * `useToast().show(text)` from anywhere under <ToastProvider>. A newer toast replaces
 * the one on screen. Sheets are native modals and would cover a toast drawn at the
 * root, so every open sheet mounts a <ToastOutlet/> too and the toast is drawn only
 * in the outlet mounted last — the one on top.
 */

interface ToastApi {
  show: (message: string) => void;
}

interface OutletRegistry {
  register: (id: number) => () => void;
  top: number | null;
  message: string;
  progress: Animated.Value;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });
const OutletContext = createContext<OutletRegistry | null>(null);

let nextOutletId = 1;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState('');
  const [outlets, setOutlets] = useState<number[]>([]);
  const progress = useRef(new Animated.Value(0)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);

  const show = useCallback(
    (text: string) => {
      running.current?.stop();
      setMessage(text);
      progress.setValue(0);
      AccessibilityInfo.announceForAccessibility(text);
      const anim = Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: duration.toast, easing, useNativeDriver: true }),
        Animated.delay(duration.toastVisible),
        Animated.timing(progress, { toValue: 0, duration: duration.toast, easing, useNativeDriver: true }),
      ]);
      running.current = anim;
      anim.start();
    },
    [progress]
  );

  const register = useCallback((id: number) => {
    setOutlets((list) => [...list, id]);
    return () => setOutlets((list) => list.filter((x) => x !== id));
  }, []);

  const api = useMemo(() => ({ show }), [show]);
  const registry = useMemo(
    () => ({ register, top: outlets.length ? outlets[outlets.length - 1] : null, message, progress }),
    [register, outlets, message, progress]
  );

  return (
    <ToastContext.Provider value={api}>
      <OutletContext.Provider value={registry}>{children}</OutletContext.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

/** Where a toast may be drawn. One at the app root, one inside each open sheet. */
export const ToastOutlet = () => {
  const registry = useContext(OutletContext);
  const [id] = useState(() => nextOutletId++);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();

  const register = registry?.register;
  useEffect(() => register?.(id), [register, id]);

  if (!registry || registry.top !== id || !registry.message) return null;

  const translateY = reduceMotion
    ? 0
    : registry.progress.interpolate({ inputRange: [0, 1], outputRange: [toastOffset, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity: registry.progress, transform: [{ translateY }] }]}
    >
      <View
        accessibilityLiveRegion="polite"
        style={[styles.toast, shadows.toast, { backgroundColor: colors.toastBg, shadowColor: colors.shadow }]}
      >
        <Text style={[type.label, styles.text, { color: colors.toastText }]}>{registry.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: sizes.toastBottom,
    alignItems: 'center',
  },
  toast: {
    borderRadius: radius.control,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.m,
  },
  text: {
    textAlign: 'center',
  },
});
