import React, { useRef, useState } from 'react';
import { Modal, PixelRatio, Share, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './Toast';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { shareCardCanvas, sharePreviewColors as P, sharePreviewSize } from '../theme/shareCard';
import { ShareCard, ShareCardContent } from './ShareCard';
import { ShareIcon, XIcon } from './icons';
import { useOverlayOpen } from '../onboarding/OverlayContext';

interface ShareCardSheetProps {
  visible: boolean;
  content: ShareCardContent;
  onClose: () => void;
}


/**
 * "Share as card" (Pro): a preview of the 1080 × 1350 card, then the native share
 * sheet with the PNG. The full-size copy is drawn off-screen and captured.
 */
export const ShareCardSheet = ({ visible, content, onClose }: ShareCardSheetProps) => {
  const { t } = useLanguage();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const capture = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  useOverlayOpen(visible);
  const { width: windowWidth } = useWindowDimensions();
  // Prototype: 345 pt wide; narrower on the smallest iPhones.
  const previewWidth = Math.min(sharePreviewSize.width, windowWidth - 2 * spacing.screen);
  const previewScale = previewWidth / shareCardCanvas.width;

  const share = async () => {
    if (!capture.current || busy) return;
    setBusy(true);
    try {
      // Drawn at 1 / PixelRatio, so the file is exactly 1080 × 1350 px.
      const uri = await captureRef(capture, { format: 'png', quality: 1, result: 'tmpfile' });
      await Share.share({ url: uri });
    } catch {
      toast.show(t('pleaseTryAgain'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View
        accessibilityViewIsModal
        onAccessibilityEscape={onClose}
        style={[styles.backdrop, { paddingTop: insets.top + spacing.s, paddingBottom: insets.bottom + spacing.l }]}
      >
        <View style={styles.top}>
          <Text accessibilityRole="header" style={[type.titleS, { color: P.text }]}>
            {t('shareCard')}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={opacity.pressed}
            accessibilityRole="button"
            accessibilityLabel={t('a11yClose')}
            style={[styles.close, { backgroundColor: P.closeFill }]}
          >
            <XIcon size={sizes.icon.l} color={P.text} />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.preview, { width: previewWidth, height: previewWidth * (shareCardCanvas.height / shareCardCanvas.width) }]}
          accessible accessibilityLabel={`${content.title}. ${content.tags}. ${content.line}`}>
          <ShareCard {...content} scale={previewScale} />
        </View>
        <Text style={[type.caption, styles.size, { color: P.muted }]}>
          {shareCardCanvas.width} × {shareCardCanvas.height}
        </Text>

        <View style={styles.fill} />
        <TouchableOpacity
          onPress={share}
          disabled={busy}
          activeOpacity={opacity.pressed}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: P.button }, busy && styles.busy]}
        >
          <ShareIcon size={sizes.icon.m} color={P.text} />
          <Text style={[type.button, { color: P.text }]}>{t('share')}</Text>
        </TouchableOpacity>

        {/* Full-size copy for the capture, outside the visible area. */}
        <View style={styles.offscreen} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ShareCard ref={capture} {...content} scale={1 / PixelRatio.get()} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: P.backdrop,
    paddingHorizontal: spacing.screen,
    alignItems: 'center',
  },
  top: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: sizes.roundButton,
    height: sizes.roundButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    marginTop: spacing.l,
    borderRadius: sharePreviewSize.radius,
    overflow: 'hidden',
  },
  size: {
    marginTop: spacing.sm,
  },
  fill: {
    flex: 1,
  },
  button: {
    alignSelf: 'stretch',
    height: sizes.button,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  busy: {
    opacity: opacity.disabled,
  },
  offscreen: {
    position: 'absolute',
    left: -shareCardCanvas.width * 2,
    top: 0,
  },
});
