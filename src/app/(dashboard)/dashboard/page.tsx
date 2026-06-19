"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import {
  Leaf, Droplets, Zap, TreePine, Trophy, ArrowRight, Sparkles,
  Target, Loader2, Recycle, Bike, ShoppingBag, Clock, Flame, AlertCircle, Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatCard } from "@/components/shared/stat-card"
import { ProgressBar } from "@/components/shared/progress-bar"
import { ActionBadge } from "@/components/shared/action-badge"
import { CATEGORY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Profile, ActionLog, ChallengeProgress, Action } from "@/types"

const CATEGORIES = ["waste", "energy", "water", "transportation", "consumption"] as const
const CATEGORY_BAR_COLORS: Record<string, string> = {
  waste: "bg-orange-500", energy: "bg-yellow-500", water: "bg-blue-500",
  transportation: "bg-purple-500", consumption: "bg-pink-500",
}
const MAX_CATEGORY_ACTIONS = 10

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`
  return n.toLocaleString("id-ID")
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function getLevelBadge(level: number) {
  if (level <= 2) return { title: "Pejuang Pemula", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
  if (level <= 5) return { title: "Pelestari", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }
  if (level <= 8) return { title: "Pelindung Bumi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }
  return { title: "Pahlawan Lingkungan", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" }
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j lalu`
  return `${Math.floor(hours / 24)}h lalu`
}

function EarthScoreCircle({ score }: { score: number }) {
  const r = 56, circumference = 2 * Math.PI * r, offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90" aria-label={`Earth Score: ${score}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted stroke-[8px]" />
        <motion.circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} className="stroke-green-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span key={score} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }} className="text-3xl font-bold"
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">Earth Score</span>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentActions, setRecentActions] = useState<(ActionLog & { action: Action })[]>([])
  const [challengeProgress, setChallengeProgress] = useState<(ChallengeProgress & { challenge: NonNullable<ChallengeProgress["challenge"]> })[]>([])
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({} as Record<string, number>)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const [{ data: profile }, { data: recent }, { data: challenges }, { data: allLogs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("action_logs").select("*, action:actions(*)").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
        supabase.from("challenge_progress").select("*, challenge:challenges(*)").eq("user_id", user.id).order("started_at", { ascending: false }).limit(3),
        supabase.from("action_logs").select("action:actions(category)").eq("user_id", user.id),
      ])

      setProfile(profile ?? null)
      setRecentActions((recent ?? []) as (ActionLog & { action: Action })[])
      setChallengeProgress((challenges ?? []).filter((cp): cp is ChallengeProgress & { challenge: NonNullable<ChallengeProgress["challenge"]> } => !!cp.challenge) as (ChallengeProgress & { challenge: NonNullable<ChallengeProgress["challenge"]> })[])

      const counts: Record<string, number> = { waste: 0, energy: 0, water: 0, transportation: 0, consumption: 0 }
      if (allLogs) {
        for (const log of allLogs) {
          const a = log.action as unknown as { category: string } | null
          if (a?.category && a.category in counts) counts[a.category]++
        }
      }
      const scores: Record<string, number> = {}
      for (const cat of CATEGORIES) scores[cat] = Math.min(Math.round((counts[cat] / MAX_CATEGORY_ACTIONS) * 100), 100)
      setCategoryScores(scores)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (error) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 size-12 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">Terjadi Kesalahan</h2>
      <p className="mb-6 text-sm text-muted-foreground">{error}</p>
      <Button onClick={fetchDashboard} variant="outline">Coba Lagi</Button>
    </motion.div>
  )

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <Skeleton className="h-80 md:col-span-2" />
        <div className="grid gap-4 md:col-span-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </div>
  )

  const levelBadge = getLevelBadge(profile?.level ?? 1)
  const displayName = profile?.display_name ?? "Pengguna"

  const catIcons: Record<string, React.ReactNode> = {
    waste: <Recycle className="size-5 text-orange-500" />,
    energy: <Zap className="size-5 text-yellow-500" />,
    water: <Droplets className="size-5 text-blue-500" />,
    transportation: <Bike className="size-5 text-purple-500" />,
    consumption: <ShoppingBag className="size-5 text-pink-500" />,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Avatar className="size-14 border-2 border-green-200">
          <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">Halo, {displayName}! <span className="inline-block">🌿</span></h1>
          <p className="text-sm text-muted-foreground">Hari yang cerah untuk menyelamatkan bumi</p>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0", levelBadge.color)}>
          <Flame className="size-3.5" />Lv.{profile?.level ?? 1} {levelBadge.title}
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="size-5 text-yellow-500" />Skor Bumi</CardTitle></CardHeader>
          <CardContent>
            <EarthScoreCircle score={profile?.earth_score ?? 0} />
            <div className="mt-6 space-y-3">
              {CATEGORIES.map((cat, i) => (
                <motion.div key={cat} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                    <span className="font-medium">{categoryScores[cat] ?? 0}%</span>
                  </div>
                  <ProgressBar value={categoryScores[cat] ?? 0} max={100} barClassName={CATEGORY_BAR_COLORS[cat]} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:col-span-3 md:grid-cols-2">
          <StatCard title="CO₂ Disimpan" value={formatNumber(profile?.total_co2_saved ?? 0)} unit="kg" icon={<Leaf className="size-5 text-green-600" />} />
          <StatCard title="Plastik Dikurangi" value={formatNumber(profile?.total_plastic_reduced ?? 0)} unit="kg" icon={<Recycle className="size-5 text-blue-600" />} />
          <StatCard title="Air Dihemat" value={formatNumber(profile?.total_water_saved ?? 0)} unit="L" icon={<Droplets className="size-5 text-cyan-600" />} />
          <StatCard title="Setara Pohon" value={formatNumber(profile?.trees_equivalent ?? 0)} icon={<TreePine className="size-5 text-emerald-600" />} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Zap className="size-5 text-yellow-500" />Aksi Terbaru</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/actions")}>Lihat Semua <ArrowRight className="size-3.5" /></Button>
          </CardHeader>
          <CardContent>
            {recentActions.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 rounded-full bg-green-50 p-4 dark:bg-green-950"><Leaf className="size-8 text-green-500" /></div>
                <p className="mb-1 font-medium">Belum ada aksi</p>
                <p className="mb-4 text-sm text-muted-foreground">Mulai aksi hijau pertamamu sekarang!</p>
                <Button onClick={() => router.push("/actions")}><Plus className="size-4" /> Mulai Aksi</Button>
              </motion.div>
            ) : (
              <ul className="divide-y">
                {recentActions.map((log, i) => (
                  <motion.li key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                      {catIcons[log.action?.category ?? "waste"]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{log.action?.title ?? "Aksi"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ActionBadge category={log.action?.category ?? "waste"} />
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{timeAgo(log.completed_at)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0"><span className="text-sm font-semibold text-green-600">+{log.points_earned}</span><p className="text-xs text-muted-foreground">poin</p></div>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Target className="size-5 text-orange-500" />Tantangan Aktif</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push("/challenges")}>Lihat Semua <ArrowRight className="size-3.5" /></Button>
          </CardHeader>
          <CardContent>
            {challengeProgress.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 rounded-full bg-orange-50 p-4 dark:bg-orange-950"><Trophy className="size-8 text-orange-500" /></div>
                <p className="mb-1 font-medium">Belum ada tantangan</p>
                <p className="mb-4 text-sm text-muted-foreground">Ikuti tantangan untuk mendapat hadiah spesial!</p>
                <Button onClick={() => router.push("/challenges")} variant="outline">Lihat Tantangan</Button>
              </motion.div>
            ) : (
              <ul className="divide-y">
                {challengeProgress.map((cp, i) => (
                  <motion.li key={cp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="py-4 first:pt-0 last:pb-0">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{cp.challenge?.title}</p>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1",
                          cp.challenge?.type === "daily" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        )}>{cp.challenge?.type === "daily" ? "Harian" : "Mingguan"}</span>
                      </div>
                      <span className={cn("text-xs font-medium shrink-0", cp.completed ? "text-green-600" : "text-muted-foreground")}>
                        {cp.completed ? "Selesai ✓" : `${cp.progress}%`}
                      </span>
                    </div>
                    <ProgressBar value={cp.progress} max={100} barClassName={cp.completed ? "bg-green-500" : "bg-orange-500"} />
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={() => router.push("/actions")}><Leaf className="size-5 text-green-500" /><span className="text-xs">Aksi Hijau</span></Button>
        <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={() => router.push("/challenges")}><Trophy className="size-5 text-orange-500" /><span className="text-xs">Tantangan</span></Button>
        <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={() => router.push("/campaigns")}><Target className="size-5 text-blue-500" /><span className="text-xs">Kampanye</span></Button>
        <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={() => router.push("/assessment")}><Sparkles className="size-5 text-purple-500" /><span className="text-xs">Penilaian</span></Button>
      </motion.div>
    </div>
  )
}
