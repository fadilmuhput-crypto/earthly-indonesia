"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "motion/react"
import { Search, Leaf, Zap, Droplets, Bike, ShoppingBag, Award, ChevronRight, CheckCircle, Loader2, Filter, Info, Recycle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ActionBadge } from "@/components/shared/action-badge"
import { CATEGORY_LABELS, DIFFICULTY_LABELS, SEED_ACTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Action, ActionCategory, Difficulty } from "@/types"

const CATEGORIES: ActionCategory[] = ["waste", "energy", "water", "transportation", "consumption"]
const DIFFICULTIES = [
  { value: "all", label: "Semua" },
  ...Object.entries(DIFFICULTY_LABELS).map(([k, v]) => ({ value: k, label: v })),
]
const CATEGORY_ICONS: Record<ActionCategory, React.ReactNode> = {
  waste: <Recycle className="size-4 text-orange-500" />,
  energy: <Zap className="size-4 text-yellow-500" />,
  water: <Droplets className="size-4 text-blue-500" />,
  transportation: <Bike className="size-4 text-purple-500" />,
  consumption: <ShoppingBag className="size-4 text-pink-500" />,
}
const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  hard: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
}
const IMPACT_COLORS = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"]

function getImpactColor(score: number): string {
  if (score <= 20) return IMPACT_COLORS[0]
  if (score <= 40) return IMPACT_COLORS[1]
  if (score <= 60) return IMPACT_COLORS[2]
  if (score <= 80) return IMPACT_COLORS[3]
  return IMPACT_COLORS[4]
}

function formatStat(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

function ActionCard({ action, onSelect }: { action: Action; onSelect: (a: Action) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md" onClick={() => onSelect(action)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {CATEGORY_ICONS[action.category]}
              </div>
              <CardTitle className="text-sm leading-tight truncate">{action.title}</CardTitle>
            </div>
            <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0", DIFFICULTY_STYLES[action.difficulty])}>
              {DIFFICULTY_LABELS[action.difficulty]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <CardDescription className="text-xs leading-relaxed line-clamp-2">{action.description}</CardDescription>
          <div className="mt-3 flex items-center gap-2">
            <ActionBadge category={action.category} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Leaf className="size-3.5 text-green-500" />
              <span className="font-medium text-green-600">{formatStat(action.co2_reduction)} kg</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="size-3.5 text-amber-500" />
              <span className="font-medium text-amber-600">+{action.points}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", getImpactColor(action.impact_score))} style={{ width: `${action.impact_score}%` }} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">{action.impact_score}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button size="sm" className="w-full gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); onSelect(action) }}>
            <Info className="size-3.5" /> Detail Aksi <ChevronRight className="size-3.5 ml-auto" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function ActionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchActions() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("actions").select("*").order("created_at", { ascending: false })
        if (error) throw error
        if (!cancelled) setActions(data ?? [])
      } catch {
        if (!cancelled) setActions(SEED_ACTIONS as Action[])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchActions()
    return () => { cancelled = true }
  }, [supabase])

  const filtered = useMemo(() => actions.filter((a) => {
    if (category !== "all" && a.category !== category) return false
    if (difficulty !== "all" && a.difficulty !== difficulty) return false
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }), [actions, category, difficulty, searchQuery])

  function openDetail(action: Action) { setSelectedAction(action); setDialogOpen(true) }

  async function handleComplete(action: Action) {
    setCompleting(action.id)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error("Silakan login terlebih dahulu")
        router.push("/auth/login")
        return
      }
      const { error } = await supabase.from("action_logs").insert({
        user_id: user.id, action_id: action.id, points_earned: action.points,
        co2_saved: action.co2_reduction, plastic_reduced: action.plastic_reduction, water_saved: action.water_saving,
      })
      if (error) throw error
      toast.success(`Aksi selesai! +${action.points} poin`)
      setDialogOpen(false); setSelectedAction(null)
    } catch { toast.error("Gagal menyelesaikan aksi") }
    finally { setCompleting(null) }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" /> <Skeleton className="h-5 w-48" />
      <Skeleton className="h-9 w-full" /> <Skeleton className="h-9 w-full max-w-md" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold">Perpustakaan Aksi Hijau</h1>
        <p className="mt-1 text-sm text-muted-foreground">Jelajahi dan lakukan aksi nyata untuk bumi Indonesia</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari aksi hijau..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-1.5"><Filter className="size-3.5" /> Semua</TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="gap-1.5">{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        {DIFFICULTIES.map((d) => (
          <Button key={d.value} variant={difficulty === d.value ? "default" : "outline"} size="sm"
            onClick={() => setDifficulty(d.value)}
            className={cn("text-xs", difficulty === d.value && d.value !== "all" && {
              "bg-green-600 hover:bg-green-700": d.value === "easy",
              "bg-yellow-600 hover:bg-yellow-700": d.value === "medium",
              "bg-red-600 hover:bg-red-700": d.value === "hard",
            })}
          >
            {d.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4"><Search className="size-8 text-muted-foreground" /></div>
          <h3 className="mb-1 font-semibold">Tidak ada aksi ditemukan</h3>
          <p className="mb-4 text-sm text-muted-foreground max-w-xs">Coba ubah filter atau kata kunci pencarian untuk menemukan aksi yang cocok</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setCategory("all"); setDifficulty("all") }}>Reset Filter</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((action, i) => (
            <motion.div key={action.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
              <ActionCard action={action} onSelect={openDetail} />
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedAction(null) }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selectedAction && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <ActionBadge category={selectedAction.category} />
                  <Badge variant="outline" className={cn("text-[10px]", DIFFICULTY_STYLES[selectedAction.difficulty])}>
                    {DIFFICULTY_LABELS[selectedAction.difficulty]}
                  </Badge>
                </div>
                <DialogTitle className="text-lg">{selectedAction.title}</DialogTitle>
                <DialogDescription className="text-sm">{selectedAction.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">Dampak Lingkungan</span>
                    <span className="text-muted-foreground">{selectedAction.impact_score}/100</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full transition-all", getImpactColor(selectedAction.impact_score))} style={{ width: `${selectedAction.impact_score}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <Leaf className="mx-auto mb-1 size-5 text-green-500" />
                    <p className="text-xs text-muted-foreground">CO₂</p>
                    <p className="text-sm font-semibold text-green-600">{formatStat(selectedAction.co2_reduction)} kg</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Recycle className="mx-auto mb-1 size-5 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Plastik</p>
                    <p className="text-sm font-semibold text-blue-600">{formatStat(selectedAction.plastic_reduction)} kg</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Droplets className="mx-auto mb-1 size-5 text-cyan-500" />
                    <p className="text-xs text-muted-foreground">Air</p>
                    <p className="text-sm font-semibold text-cyan-600">{formatStat(selectedAction.water_saving)} L</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Langkah-langkah</h4>
                  <ol className="space-y-2">
                    {selectedAction.instructions.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">{i + 1}</span>
                        <span className="pt-0.5 text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedAction.tips.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Tips</h4>
                    <ul className="space-y-1.5">
                      {selectedAction.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400" />
                          <span className="text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hadiah</p>
                      <p className="text-sm font-semibold">{selectedAction.points} poin</p>
                    </div>
                  </div>
                  <Button onClick={() => handleComplete(selectedAction)} disabled={completing === selectedAction.id} className="gap-1.5">
                    {completing === selectedAction.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                    Tandai Selesai
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
