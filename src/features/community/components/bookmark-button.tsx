import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { colors } from '@/ui/theme';

export function BookmarkButton({
  bookmarked,
  onPress,
}: {
  readonly bookmarked: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={bookmarked ? 'Bỏ lưu' : 'Lưu bài'}
      accessibilityState={{ selected: bookmarked }}
      hitSlop={10}
      onPress={onPress}
    >
      <Ionicons
        name={bookmarked ? 'bookmark' : 'bookmark-outline'}
        size={22}
        color={bookmarked ? colors.accentStrong : colors.fgMuted}
      />
    </Pressable>
  );
}
