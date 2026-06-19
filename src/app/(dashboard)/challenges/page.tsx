"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "motion/react"
import {
  Trophy, Target, Calendar, Clock, Award, Users, Zap,
  Loader2, CheckCircle, Star, Sparkles, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/shared/progress-bar"
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Challenge, ChallengeProgress } from "@/types"

function daysRemaining(endDate: string): { label: string; urgent: boolean } {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return { label: "Berakhir", urgent: true }
  const days = Math.ceil(diff / 86400000)
  if (days === 1) return { label: "1 hari lagi", urgent: true }
  return { label: `${days} hari lagi`, urgent: days <= 2 }
}

const difficultyVariants: Record<string, "outline" | "secondary" | "destructive"> = {
  easy: "outline",
  medium: "secondary",
  hard: "destructive",
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export default function ChallengesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, ChallengeProgress>>(new Map())
  const [joining, setJoining] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const fetchChallenges = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date().toISOString()
      const [{ data: challenges }, { data: progress }] = await Promise.all([
        supabase
          .from("challenges")
          .select("*")
          .lte("start_date", now)
          .gte("end_date", now)
          .order("end_date", { ascending: true }),
        supabase
          .from("challenge_progress")
          .select("*")
          .eq("user_id", user.id),
      ])

      setChallenges(challenges ?? [])
      const map = new Map<string, ChallengeProgress>()
      if (progress) {
        for (const cp of progress) map.set(cp.challenge_id, cp)
      }
      setProgressMap(map)
    } catch (err) {
      console.error("Challenges fetch error:", err)
      setError("Gagal memuat tantangan")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchChallenges() }, [fetchChallenges])

  const joinChallenge = async (challenge: Challenge) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setJoining((prev) => new Set(prev).add(challenge.id))
    try {
      const { data, error: err } = await supabase
        .from("challenge_progress")
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress: 0,
          completed: false,
        })
        .select()
        .single()
      if (err) throw err
      if (data) {
        setProgressMap((prev) => {
          const next = new Map(prev)
          next.set(challenge.id, data as ChallengeProgress)
          return next
        })
      }
    } catch (err) {
      console.error("Join challenge error:", err)
    } finally {
      setJoining((prev) => { const next = new Set(prev); next.delete(challenge.id); return next })
    }
  }

  const markProgress = async (cp: ChallengeProgress) => {
    setUpdating((prev) => new Set(prev).add(cp.challenge_id))
    try {
      const newProgress = Math.min(cp.progress + 25, 100)
      const completed = newProgress >= 100
      const { error: err } = await supabase
        .from("challenge_progress")
        .update({
          progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", cp.id)
      if (err) throw err
      setProgressMap((prev) => {
        const next = new Map(prev)
        next.set(cp.challenge_id, { ...cp, progress: newProgress, completed, completed_at: completed ? new Date().toISOString() : null })
        return next
      })
    } catch (err) {
      console.error("Update progress error:", err)
    } finally {
      setUpdating((prev) => { const next = new Set(prev); next.delete(cp.challenge_id); return next })
    }
  }

  const dailyChallenges = challenges.filter((c) => c.type === "daily")
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly")

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-4 size-12 text-destructive" />
        <h2 className="mb-2 text-lg font-semibold">Terjadi Kesalahan</h2>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={fetchChallenges} variant="outline">Coba Lagi</Button>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-44" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Trophy className="size-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tantangan</h1>
            <p className="text-sm text-muted-foreground">Tingkatkan kebiasaan ramah lingkunganmu</p>
          </div>
        </div>
      </motion.div>

      {challenges.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mb-4 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:from-amber-950/50 dark:to-orange-950/50">
            <Trophy className="size-12 text-amber-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Belum Ada Tantangan</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Tantangan baru akan segera hadir! Pantau terus halaman ini untuk mendapatkan tantangan eksklusif dan raih hadiahnya.
          </p>
          <Sparkles className="size-5 text-amber-400" />
        </motion.div>
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="size-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Tantangan Hari Ini</h2>
            </div>
            {dailyChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <Target className="mb-3 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Tidak ada tantangan harian saat ini</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {dailyChallenges.map((challenge, i) => {
                  const progress = progressMap.get(challenge.id)
                  const remaining = daysRemaining(challenge.end_date)
                  return (
                    <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    >
                      <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
                        <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent" />
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{challenge.title}</CardTitle>
                            <Badge variant={difficultyVariants[challenge.difficulty] ?? "outline"}
                              className={cn("shrink-0", DIFFICULTY_COLORS[challenge.difficulty])}
                            >
                              {DIFFICULTY_LABELS[challenge.difficulty]}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs leading-relaxed line-clamp-2">
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="size-3.5 text-amber-500" />
                              <span className="font-medium text-amber-600 dark:text-amber-400">{challenge.points_reward}</span> poin
                            </span>
                            {challenge.badge_reward && (
                              <span className="flex items-center gap-1">
                                <Star className="size-3.5 text-purple-500" />
                                {challenge.badge_reward}
                              </span>
                            )}
                            <span className={cn("flex items-center gap-1", remaining.urgent && "text-red-500")}>
                              <Clock className="size-3.5" />
                              {remaining.label}
                            </span>
                          </div>
                          {progress && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className={cn("font-medium", progress.completed && "text-green-600")}>
                                  {progress.completed ? "Selesai" : `${progress.progress}%`}
                                </span>
                              </div>
                              <ProgressBar value={progress.progress} max={100}
                                barClassName={progress.completed ? "bg-green-500" : "bg-blue-500"}
                              />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="gap-2">
                          {!progress ? (
                            <Button size="sm" className="w-full gap-1.5"
                              disabled={joining.has(challenge.id)}
                              onClick={() => joinChallenge(challenge)}
                            >
                              {joining.has(challenge.id) ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Zap className="size-3.5" />
                              )}
                              Ikuti
                            </Button>
                          ) : !progress.completed ? (
                            <Button size="sm" variant="secondary" className="w-full gap-1.5"
                              disabled={updating.has(challenge.id)}
                              onClick={() => markProgress(progress)}
                            >
                              {updating.has(challenge.id) ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="size-3.5" />
                              )}
                              Selesaikan
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              <CheckCircle className="size-3.5 text-green-500" />
                              <span className="text-green-600">Terkunci</span>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Users className="size-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Tantangan Minggu Ini</h2>
            </div>
            {weeklyChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <Target className="mb-3 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Tidak ada tantangan mingguan saat ini</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {weeklyChallenges.map((challenge, i) => {
                  const progress = progressMap.get(challenge.id)
                  const remaining = daysRemaining(challenge.end_date)
                  return (
                    <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    >
                      <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
                        <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500/5 to-transparent" />
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{challenge.title}</CardTitle>
                            <Badge variant={difficultyVariants[challenge.difficulty] ?? "outline"}
                              className={cn("shrink-0", DIFFICULTY_COLORS[challenge.difficulty])}
                            >
                              {DIFFICULTY_LABELS[challenge.difficulty]}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs leading-relaxed line-clamp-2">
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="size-3.5 text-amber-500" />
                              <span className="font-medium text-amber-600 dark:text-amber-400">{challenge.points_reward}</span> poin
                            </span>
                            {challenge.badge_reward && (
                              <span className="flex items-center gap-1">
                                <Star className="size-3.5 text-purple-500" />
                                {challenge.badge_reward}
                              </span>
                            )}
                            <span className={cn("flex items-center gap-1", remaining.urgent && "text-red-500")}>
                              <Clock className="size-3.5" />
                              {remaining.label}
                            </span>
                          </div>
                          {progress && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className={cn("font-medium", progress.completed && "text-green-600")}>
                                  {progress.completed ? "Selesai" : `${progress.progress}%`}
                                </span>
                              </div>
                              <ProgressBar value={progress.progress} max={100}
                                barClassName={progress.completed ? "bg-green-500" : "bg-purple-500"}
                              />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="gap-2">
                          {!progress ? (
                            <Button size="sm" className="w-full gap-1.5"
                              disabled={joining.has(challenge.id)}
                              onClick={() => joinChallenge(challenge)}
                            >
                              {joining.has(challenge.id) ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Zap className="size-3.5" />
                              )}
                              Ikuti
                            </Button>
                          ) : !progress.completed ? (
                            <Button size="sm" variant="secondary" className="w-full gap-1.5"
                              disabled={updating.has(challenge.id)}
                              onClick={() => markProgress(progress)}
                            >
                              {updating.has(challenge.id) ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="size-3.5" />
                              )}
                              Selesaikan
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              <CheckCircle className="size-3.5 text-green-500" />
                              <span className="text-green-600">Terkunci</span>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
