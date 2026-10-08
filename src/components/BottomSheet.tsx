import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { radius, sizes, spacing } from '../theme/spacing';
import { duration, easing, useReduceMotion } from '../theme/motion';
import { ToastOutlet } from './Toast';
import { useOverlayOpen } from '../onboarding/OverlayContext';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Tall sheet that reaches just under the status bar and lays out its own
   * scrolling (My Bar → Add ingredients). Otherwise the sheet hugs its content
   * up to `sizes.sheetTopGap` from the top and scrolls inside.
   */
  fullHeight?: boolean;
  /** VoiceOver label of the grabber, which closes the sheet when activated ("Close"). */
  closeLabel: string;
}

/** A drag on the grabber further than this closes the sheet. */
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.5;

/**
 * Bottom sheet: grabber, top radius 20, scrim. Slides up in 360 ms on the shared
 * easing while the scrim fades in 300 ms; with Reduce Motion it only fades. Built
 * on the native Modal, so VoiceOver cannot reach the screen underneath.
 */
export const BottomSheet = ({ visible, onClose, children, fullHeight = false, closeLabel }: BottomSheetProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const reduceMotion = useReduceMotion();

  const [mounted, setMounted] = useState(visible);
  // Hints stay away while any sheet is up.
  useOverlayOpen(visible);
  const sheet = useRef(new Animated.Value(0)).current;
  const scrim = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
    }
    const to = visible ? 1 : 0;
    const anim = Animated.parallel([
      Animated.timing(sheet, { toValue: to, duration: duration.sheet, easing, useNativeDriver: true }),
      Animated.timing(scrim, { toValue: to, duration: duration.scrim, easing, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => anim.stop();
  }, [visible, sheet, scrim, drag]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
          onCloseRef.current();
        } else {
          Animated.timing(drag, { toValue: 0, duration: duration.toast, easing, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!mounted) return null;

  const slide = reduceMotion
    ? 0
    : sheet.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });

  const frame = fullHeight
    ? { top: insets.top + spacing.s }
    : { maxHeight: windowHeight - sizes.sheetTopGap };

  const bottomPad = insets.bottom + spacing.m;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.fill}>
        <TouchableWithoutFeedback onPress={onClose} accessible={false}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: scrim }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={[
            styles.sheet,
            frame,
            {
              backgroundColor: colors.sheetBg,
              opacity: reduceMotion ? sheet : 1,
              transform: [{ translateY: Animated.add(slide, drag) }],
            },
          ]}
        >
          <View
            {...pan.panHandlers}
            accessible
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onAccessibilityTap={onClose}
            style={styles.grabberZone}
          >
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          </View>
          {fullHeight ? (
            <View style={[styles.fill, { paddingBottom: bottomPad }]}>{children}</View>
          ) : (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
            >
              {children}
            </ScrollView>
          )}
        </Animated.View>
        <ToastOutlet />
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  grabberZone: {
    paddingTop: spacing.s,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  grabber: {
    width: sizes.grabberWidth,
    height: sizes.grabberHeight,
    borderRadius: radius.grabber,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
});
