import Storage from 'expo-sqlite/kv-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { DiscussionAuthorResponse, DiscussionResponse } from '@/contracts';

import {
  EMPTY_HIDDEN_CONTENT,
  isDiscussionHidden,
  parseHiddenContent,
  withBlockedAuthor,
  withoutBlockedAuthor,
  withReportedDiscussion,
  type HiddenContent,
} from './hidden-content';

interface HiddenContentContextValue {
  readonly blockedAuthors: readonly DiscussionAuthorResponse[];
  readonly isHidden: (discussion: DiscussionResponse) => boolean;
  readonly reportDiscussion: (discussionId: string) => void;
  readonly blockAuthor: (author: DiscussionAuthorResponse) => void;
  readonly unblockAuthor: (userId: string) => void;
}

const HiddenContentContext = createContext<HiddenContentContextValue | undefined>(
  undefined,
);

/**
 * Reports and blocks per signed-in account, persisted in the SQLite-backed
 * key-value store so they survive restarts. Mounted inside the signed-in
 * stack, which unmounts on logout, so a provider never sees two accounts.
 */
export function HiddenContentProvider({
  userId,
  children,
}: {
  readonly userId: string | null;
  readonly children: ReactNode;
}) {
  const storageKey = userId ? `polaris.community.hidden.${userId}` : null;
  const [hidden, setHidden] = useState<HiddenContent>(() =>
    storageKey
      ? parseHiddenContent(Storage.getItemSync(storageKey))
      : EMPTY_HIDDEN_CONTENT,
  );

  useEffect(() => {
    if (storageKey) Storage.setItemSync(storageKey, JSON.stringify(hidden));
  }, [storageKey, hidden]);

  const isHidden = useCallback(
    (discussion: DiscussionResponse) => isDiscussionHidden(discussion, hidden),
    [hidden],
  );
  const reportDiscussion = useCallback(
    (discussionId: string) =>
      setHidden((prev) => withReportedDiscussion(prev, discussionId)),
    [],
  );
  const blockAuthor = useCallback(
    (author: DiscussionAuthorResponse) =>
      setHidden((prev) => withBlockedAuthor(prev, author)),
    [],
  );
  const unblockAuthor = useCallback(
    (blockedUserId: string) =>
      setHidden((prev) => withoutBlockedAuthor(prev, blockedUserId)),
    [],
  );

  const value = useMemo(
    () => ({
      blockedAuthors: hidden.blockedAuthors,
      isHidden,
      reportDiscussion,
      blockAuthor,
      unblockAuthor,
    }),
    [hidden.blockedAuthors, isHidden, reportDiscussion, blockAuthor, unblockAuthor],
  );

  return (
    <HiddenContentContext.Provider value={value}>
      {children}
    </HiddenContentContext.Provider>
  );
}

export function useHiddenContent(): HiddenContentContextValue {
  const context = useContext(HiddenContentContext);
  if (!context) {
    throw new Error('useHiddenContent must be used within a HiddenContentProvider');
  }
  return context;
}
