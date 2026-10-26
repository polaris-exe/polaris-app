import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/ui/theme';

interface VoteControlProps {
  readonly votes: number;
  readonly myVote: 'up' | 'down' | null;
  readonly onVote: (pressed: 'up' | 'down') => void;
  readonly horizontal?: boolean;
}

export function VoteControl({
  votes,
  myVote,
  onVote,
  horizontal = false,
}: VoteControlProps) {
  return (
    <View style={[styles.container, horizontal && styles.horizontal]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upvote"
        accessibilityState={{ selected: myVote === 'up' }}
        hitSlop={8}
        onPress={() => onVote('up')}
      >
        <Ionicons
          name={myVote === 'up' ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
          size={26}
          color={myVote === 'up' ? colors.accent : colors.fgMuted}
        />
      </Pressable>
      <Text
        style={[
          styles.count,
          myVote === 'up' && { color: colors.accentStrong },
          myVote === 'down' && { color: colors.danger },
        ]}
      >
        {votes}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Downvote"
        accessibilityState={{ selected: myVote === 'down' }}
        hitSlop={8}
        onPress={() => onVote('down')}
      >
        <Ionicons
          name={
            myVote === 'down' ? 'arrow-down-circle' : 'arrow-down-circle-outline'
          }
          size={26}
          color={myVote === 'down' ? colors.danger : colors.fgMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2, minWidth: 36 },
  horizontal: { flexDirection: 'row', gap: spacing.sm },
  count: { color: colors.fg, fontSize: fontSize.sm, fontWeight: '700' },
});
