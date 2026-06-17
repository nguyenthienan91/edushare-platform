export const GroupCategory = {
  PRODUCTIVITY: 'Productivity',
  DESIGN: 'Design',
  AI_TOOLS: 'AI Tools',
} as const

export type GroupCategoryType = typeof GroupCategory[keyof typeof GroupCategory]
