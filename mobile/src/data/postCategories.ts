// Categories a blog post can be tagged with. Keep in sync with what staff expect to post.
export const POST_CATEGORIES = [
  { value: 'youth_night', label: 'Youth night' },
  { value: 'sermon', label: 'Sermon' },
  { value: 'camp', label: 'Camp' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'other', label: 'Other' },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]['value'];

export function categoryLabel(value: string | null): string | null {
  return POST_CATEGORIES.find((c) => c.value === value)?.label ?? null;
}
