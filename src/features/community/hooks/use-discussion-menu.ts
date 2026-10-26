import { useCallback } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import type { DiscussionResponse } from '@/contracts';

import { useHiddenContent } from '../hidden-content-context';

/**
 * "…" menu on someone else's post: report the post or block its author.
 * Both only hide content on this device; `onHidden` runs after either so the
 * detail screen can close.
 */
export function useDiscussionMenu() {
  const { reportDiscussion, blockAuthor } = useHiddenContent();

  return useCallback(
    (discussion: DiscussionResponse, onHidden?: () => void) => {
      const authorName = discussion.author.display_name || 'người dùng này';

      const confirmReport = () =>
        Alert.alert(
          'Báo cáo bài viết?',
          'Bài viết sẽ bị ẩn khỏi bảng tin của bạn.',
          [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Báo cáo',
              style: 'destructive',
              onPress: () => {
                reportDiscussion(discussion.id);
                onHidden?.();
              },
            },
          ],
        );

      const confirmBlock = () =>
        Alert.alert(
          `Chặn ${authorName}?`,
          'Bạn sẽ không thấy bài viết của người này nữa. Có thể bỏ chặn trong tab Tài khoản.',
          [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Chặn',
              style: 'destructive',
              onPress: () => {
                blockAuthor(discussion.author);
                onHidden?.();
              },
            },
          ],
        );

      const reportLabel = 'Báo cáo bài viết';
      const blockLabel = `Chặn ${authorName}`;

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: [reportLabel, blockLabel, 'Huỷ'],
            destructiveButtonIndex: [0, 1],
            cancelButtonIndex: 2,
            userInterfaceStyle: 'dark',
          },
          (index) => {
            if (index === 0) confirmReport();
            if (index === 1) confirmBlock();
          },
        );
        return;
      }

      Alert.alert('Tuỳ chọn bài viết', undefined, [
        { text: reportLabel, onPress: confirmReport },
        { text: blockLabel, onPress: confirmBlock },
        { text: 'Huỷ', style: 'cancel' },
      ]);
    },
    [reportDiscussion, blockAuthor],
  );
}
