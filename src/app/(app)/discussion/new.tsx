import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { DiscussionCategory } from '@/contracts';
import { toUserMessage } from '@/api/api-error-message';
import { useAuth } from '@/features/auth/auth-context';
import { FormErrorBanner } from '@/features/auth/components/form-error-banner';
import {
  CATEGORY_LABELS,
  creatableCategories,
  DISCUSSION_LIMITS,
  parseTagsInput,
  validateDiscussionDraft,
  type DiscussionDraftErrors,
} from '@/features/community/community-format';
import {
  useCreateDiscussion,
  useProjectOptions,
} from '@/features/community/hooks/use-create-discussion';
import { Button } from '@/ui/button';
import { Chip } from '@/ui/chip';
import { TextField } from '@/ui/text-field';
import { colors, fontSize, spacing } from '@/ui/theme';

export default function NewDiscussionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createDiscussion = useCreateDiscussion();
  const projects = useProjectOptions();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>('general');
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [errors, setErrors] = useState<DiscussionDraftErrors>({});

  const categories = creatableCategories(user?.role ?? 'student');

  function handleSubmit() {
    const tags = parseTagsInput(tagsInput);
    const nextErrors = validateDiscussionDraft({ title, content, tags });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createDiscussion.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        category,
        ...(projectSlug ? { project_slug: projectSlug } : {}),
        ...(tags.length > 0 ? { tags } : {}),
      },
      {
        onSuccess: ({ discussion }) =>
          router.replace({
            pathname: '/discussion/[id]',
            params: { id: discussion.id },
          }),
      },
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          placeholder="VD: Stage 3 bị timeout khi gọi Redis"
          maxLength={DISCUSSION_LIMITS.titleMax}
        />

        <TextField
          label="Nội dung"
          value={content}
          onChangeText={setContent}
          error={errors.content}
          hint="Hỗ trợ Markdown. Mô tả vấn đề, bạn đã thử gì, log lỗi."
          placeholder="Mô tả chi tiết câu hỏi của bạn…"
          multiline
          textAlignVertical="top"
          style={styles.contentInput}
          maxLength={DISCUSSION_LIMITS.contentMax}
        />

        <TextField
          label="Tag"
          value={tagsInput}
          onChangeText={setTagsInput}
          error={errors.tags}
          hint={`Cách nhau bởi dấu phẩy, tối đa ${DISCUSSION_LIMITS.tagsMax} tag.`}
          placeholder="go, redis, cache"
          autoCapitalize="none"
        />

        <View style={styles.section}>
          <Text style={styles.label}>Chủ đề</Text>
          <View style={styles.chips}>
            {categories.map((value) => (
              <Chip
                key={value}
                label={CATEGORY_LABELS[value]}
                selected={category === value}
                onPress={() => setCategory(value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dự án liên quan</Text>
          <View style={styles.chips}>
            <Chip
              label="Không"
              selected={projectSlug === null}
              onPress={() => setProjectSlug(null)}
            />
            {(projects.data ?? []).map((project) => (
              <Chip
                key={project.slug}
                label={project.title}
                selected={projectSlug === project.slug}
                onPress={() => setProjectSlug(project.slug)}
              />
            ))}
          </View>
        </View>

        <FormErrorBanner
          message={
            createDiscussion.isError ? toUserMessage(createDiscussion.error) : null
          }
        />
        <Button
          label="Đăng câu hỏi"
          loading={createDiscussion.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  contentInput: { minHeight: 180 },
  section: { gap: spacing.sm },
  label: { color: colors.fgMuted, fontSize: fontSize.sm, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
