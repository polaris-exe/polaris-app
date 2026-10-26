import { Fragment } from 'react';
import { View } from 'react-native';
import { useMarkdown, type useMarkdownHookOptions } from 'react-native-marked';

import { colors, fontSize } from '@/ui/theme';

const MARKDOWN_OPTIONS: useMarkdownHookOptions = {
  colorScheme: 'dark',
  theme: {
    colors: {
      text: colors.fg,
      link: colors.accentStrong,
      code: colors.surface2,
      border: colors.border,
    },
  },
  styles: {
    text: { fontSize: fontSize.md, lineHeight: 24 },
    codespan: { fontSize: fontSize.sm },
  },
};

/**
 * Renders discussion markdown as plain elements (not the library's FlatList
 * component) so it can live inside the detail ScrollView.
 */
export function DiscussionMarkdown({ value }: { readonly value: string }) {
  const elements = useMarkdown(value, MARKDOWN_OPTIONS);
  return (
    <View>
      {elements.map((element, index) => (
        <Fragment key={index}>{element}</Fragment>
      ))}
    </View>
  );
}
