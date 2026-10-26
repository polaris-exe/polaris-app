import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { colors } from '@/ui/theme';

export function DiscussionMenuButton({ onPress }: { readonly onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Báo cáo hoặc chặn"
      hitSlop={10}
      onPress={onPress}
    >
      <Ionicons name="ellipsis-horizontal" size={22} color={colors.fgMuted} />
    </Pressable>
  );
}
