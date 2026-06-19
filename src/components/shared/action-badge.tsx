"use client"

import { cn } from "@/lib/utils"
import type { ActionCategory } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"

interface ActionBadgeProps {
  category: ActionCategory
  className?: string
}

const categoryStyles: Record<ActionCategory, string> = {
  waste: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  energy: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  water: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  transportation: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  consumption: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
}

export function ActionBadge({ category, className }: ActionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryStyles[category],
        className
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
