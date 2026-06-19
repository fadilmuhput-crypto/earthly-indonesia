"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "motion/react"
import {
  User, Mail, Award, Leaf, TrendingUp, Calendar, Edit2, Save,
  Loader2, Trophy, Star, Trash2, Zap, Droplets, TreePine, Recycle,
  Sparkles, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/shared/stat-card"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Profile, UserAchievement } from "@/types"

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`
  return n.toLocaleString("id-ID")
}

function getLevelBadge(level: number) {
  if (level <= 2) return { title: "Pejuang Pemula", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
  if (level <= 5) return { title: "Pelestari", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }
  if (level <= 8) return { title: "Pelindung Bumi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }
  return { title: "Pahlawan Lingkungan", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" }
}

function getLevelProgress(level: number): { current: number; next: number } {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
  const idx = Math.min(level, thresholds.length - 1)
  return { current: thresholds[idx - 1] ?? 0, next: thresholds[idx] }
}

function EarthScoreCircle({ score }: { score: number }) {
  const r = 64, circumference = 2 * Math.PI * r, offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90" aria-label={`Earth Score: ${score}`}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted stroke-[8px]" />
        <motion.circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} className="stroke-green-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span key={score} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }} className="text-4xl font-bold"
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

interface AchievementDisplay {
  id: string
  title: string
  description: string
  icon: string
  category: string | null
  points_reward: number
  earned_at: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  leaf: <Leaf className="size-5 text-green-600" />,
  zap: <Zap className="size-5 text-yellow-600" />,
  droplets: <Droplets className="size-5 text-blue-600" />,
  bike: <Bike className="size-5 text-purple-600" />,
  tree: <TreePine className="size-5 text-emerald-600" />,
  trophy: <Trophy className="size-5 text-amber-600" />,
  star: <Star className="size-5 text-yellow-500" />,
  recycle: <Recycle className="size-5 text-orange-600" />,
  sparkles: <Sparkles className="size-5 text-pink-600" />,
}

function Bike({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
    </svg>
  )
}

function getIcon(iconName: string): React.ReactNode {
  return ICON_MAP[iconName.toLowerCase()] ?? <Award className="size-5 text-muted-foreground" />
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>("")
  const [achievements, setAchievements] = useState<AchievementDisplay[]>([])
  const [totalActions, setTotalActions] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchProfile() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/auth/login")
          return
        }
        setEmail(user.email ?? "")

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") throw profileError

        const [{ data: achievementData }, { count: actionCount }] = await Promise.all([
          supabase
            .from("user_achievements")
            .select("*, achievement:achievements(*)")
            .eq("user_id", user.id)
            .order("earned_at", { ascending: false }),
          supabase
            .from("action_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ])

        if (!cancelled) {
          setProfile(profileData ?? null)
          setDisplayName(profileData?.display_name ?? user.email?.split("@")[0] ?? "Pengguna")
          setTotalActions(actionCount ?? 0)
          const mapped: AchievementDisplay[] = (achievementData ?? [])
            .filter((ua): ua is UserAchievement & { achievement: NonNullable<UserAchievement["achievement"]> } => !!ua.achievement)
            .map((ua) => ({
              id: ua.id,
              title: ua.achievement.title,
              description: ua.achievement.description,
              icon: ua.achievement.icon,
              category: ua.achievement.category,
              points_reward: ua.achievement.points_reward,
              earned_at: ua.earned_at,
            }))
          setAchievements(mapped)
        }
      } catch (err) {
        console.error("Profile fetch error:", err)
        if (!cancelled) setError("Gagal memuat data profil")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [router, supabase])

  async function handleSave() {
    if (!profile && !displayName.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Sesi berakhir, silakan login ulang"); router.push("/auth/login"); return }

      const { error: upsertError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

      if (upsertError) throw upsertError

      setProfile((prev) => prev ? { ...prev, display_name: displayName.trim() } : null)
      setIsEditing(false)
      toast.success("Profil berhasil diperbarui")
    } catch {
      toast.error("Gagal menyimpan profil")
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDisplayName(profile?.display_name ?? email.split("@")[0] ?? "Pengguna")
    setIsEditing(false)
  }

  const levelBadge = getLevelBadge(profile?.level ?? 1)
  const levelProgress = getLevelProgress(profile?.level ?? 1)
  const pointsInLevel = (profile?.points ?? 0) - levelProgress.current
  const pointsNeeded = levelProgress.next - levelProgress.current
  const progressPercent = Math.min(Math.round((pointsInLevel / pointsNeeded) * 100), 100)

  if (error) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 size-12 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">Terjadi Kesalahan</h2>
      <p className="mb-6 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => window.location.reload()} variant="outline">Coba Lagi</Button>
    </motion.div>
  )

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-40" /></div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-80 md:col-span-1" />
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Avatar className="size-16 border-2 border-green-200">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold truncate">{displayName}</h1>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0", levelBadge.color)}>
              <Trophy className="size-3.5" /> Lv.{profile?.level ?? 1} {levelBadge.title}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar className="size-3" />
            Bergabung sejak {profile?.created_at ? format(new Date(profile.created_at), "d MMMM yyyy", { locale: id }) : "-"}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="size-5 text-green-500" /> Skor Bumi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <EarthScoreCircle score={profile?.earth_score ?? 0} />
            <div className="mt-6 w-full space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(profile?.points ?? 0)}</p>
                <p className="text-xs text-muted-foreground">Total Poin</p>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {profile?.level ?? 1}</span>
                  <span className="font-medium text-xs">{formatNumber(pointsInLevel)} / {formatNumber(pointsNeeded)} poin</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-5 text-sky-500" /> Informasi Profil
                </CardTitle>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setIsEditing(true)}>
                    <Edit2 className="size-3.5" /> Edit
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Nama Tampilan</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nama kamu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex h-10 w-full items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                        <Mail className="mr-2 size-4" />
                        {email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSave} disabled={saving || !displayName.trim()} className="gap-1.5">
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Simpan
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={saving}>Batal</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <User className="size-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nama Tampilan</p>
                        <p className="text-sm font-medium">{displayName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <Mail className="size-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-5 text-emerald-500" /> Statistik Dampak
                </CardTitle>
                <CardDescription>Total dampak lingkungan yang telah kamu hasilkan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Aksi Selesai"
                    value={formatNumber(totalActions)}
                    icon={<Leaf className="size-5 text-green-600" />}
                  />
                  <StatCard
                    title="CO₂ Disimpan"
                    value={formatNumber(profile?.total_co2_saved ?? 0)}
                    unit="kg"
                    icon={<Zap className="size-5 text-yellow-600" />}
                  />
                  <StatCard
                    title="Plastik Dikurangi"
                    value={formatNumber(profile?.total_plastic_reduced ?? 0)}
                    unit="kg"
                    icon={<Recycle className="size-5 text-blue-600" />}
                  />
                  <StatCard
                    title="Air Dihemat"
                    value={formatNumber(profile?.total_water_saved ?? 0)}
                    unit="L"
                    icon={<Droplets className="size-5 text-cyan-600" />}
                  />
                  <StatCard
                    title="Setara Pohon"
                    value={formatNumber(profile?.trees_equivalent ?? 0)}
                    icon={<TreePine className="size-5 text-emerald-600" />}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="size-5 text-amber-500" /> Prestasi Terbaru
                </CardTitle>
                <CardDescription>Penghargaan yang telah kamu raih dalam perjalanan hijau</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="mb-3 rounded-full bg-amber-50 p-4 dark:bg-amber-950">
                      <Trophy className="size-8 text-amber-400" />
                    </div>
                    <p className="mb-1 font-medium">Belum ada prestasi</p>
                    <p className="text-sm text-muted-foreground">Selesaikan aksi dan tantangan untuk mendapatkan prestasi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((ach, i) => (
                      <motion.div
                        key={ach.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
                          {getIcon(ach.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{ach.title}</p>
                          <p className="text-xs text-muted-foreground">{ach.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-amber-600">+{ach.points_reward}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(ach.earned_at), "d MMM yyyy", { locale: id })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
