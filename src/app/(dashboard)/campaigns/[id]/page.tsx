"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "motion/react"
import {
  Users, MapPin, Calendar, Target, ArrowLeft, Trophy, Medal,
  Loader2, CheckCircle, LogOut, AlertCircle, UserPlus, Leaf,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ActionBadge } from "@/components/shared/action-badge"
import { ProgressBar } from "@/components/shared/progress-bar"
import { StatCard } from "@/components/shared/stat-card"
import { CATEGORY_LABELS } from "@/lib/constants"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Campaign, CampaignMember, Profile } from "@/types"

interface MemberWithProfile extends CampaignMember {
  profile: Profile
}

interface LeaderboardEntry {
  rank: number
  user: Profile
  contribution: number
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`
  return n.toLocaleString("id-ID")
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setCurrentUserId(user.id)

      const { data: campaignData, error: campaignErr } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single()

      if (campaignErr) throw campaignErr
      if (!campaignData) {
        setError("Kampanye tidak ditemukan")
        return
      }
      setCampaign(campaignData as Campaign)

      const { data: membersData } = await supabase
        .from("campaign_members")
        .select("*, profile:profiles(*)")
        .eq("campaign_id", id)
        .order("contribution", { ascending: false })

      const typedMembers = (membersData ?? []) as unknown as MemberWithProfile[]
      setMembers(typedMembers)
      setIsJoined(typedMembers.some((m) => m.user_id === user.id))
    } catch (err) {
      console.error("Campaign detail fetch error:", err)
      setError("Gagal memuat detail kampanye")
    } finally {
      setLoading(false)
    }
  }, [id, router, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleJoin = async () => {
    if (!currentUserId || !campaign || joining) return
    setJoining(true)
    try {
      const { error: joinErr } = await supabase
        .from("campaign_members")
        .insert({ campaign_id: id, user_id: currentUserId, contribution: 0 })

      if (joinErr) throw joinErr

      const { error: updateErr } = await supabase.rpc(
        "increment_campaign_participants",
        { campaign_id: id }
      )

      if (updateErr) {
        await supabase.from("campaign_members").delete().match({
          campaign_id: id,
          user_id: currentUserId,
        })
        throw updateErr
      }

      setIsJoined(true)
      setCampaign((prev) =>
        prev ? { ...prev, current_participants: prev.current_participants + 1 } : prev
      )
      toast.success("Berhasil bergabung dengan kampanye!")
      fetchData()
    } catch (err) {
      console.error("Join campaign error:", err)
      toast.error("Gagal bergabung dengan kampanye")
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!currentUserId || !campaign || leaving) return
    setLeaving(true)
    try {
      const { error: deleteErr } = await supabase
        .from("campaign_members")
        .delete()
        .match({ campaign_id: id, user_id: currentUserId })

      if (deleteErr) throw deleteErr

      const { error: decrementErr } = await supabase.rpc(
        "decrement_campaign_participants",
        { campaign_id: id }
      )

      if (decrementErr) throw decrementErr

      setIsJoined(false)
      setCampaign((prev) =>
        prev ? { ...prev, current_participants: Math.max(0, prev.current_participants - 1) } : prev
      )
      toast.success("Berhasil meninggalkan kampanye")
      fetchData()
    } catch (err) {
      console.error("Leave campaign error:", err)
      toast.error("Gagal meninggalkan kampanye")
    } finally {
      setLeaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 md:col-span-2" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <AlertCircle className="mb-4 size-12 text-destructive" />
        <h2 className="mb-2 text-lg font-semibold">
          {error ?? "Kampanye tidak ditemukan"}
        </h2>
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Kembali ke Kampanye
        </Button>
      </motion.div>
    )
  }

  const progress = Math.round(
    (campaign.current_participants / campaign.target_participants) * 100
  )

  const leaderboard: LeaderboardEntry[] = members.map((m, i) => ({
    rank: i + 1,
    user: m.profile,
    contribution: m.contribution,
  }))

  const userMemberEntry = members.find((m) => m.user_id === currentUserId)

  const rankIcons: Record<number, React.ReactNode> = {
    1: <Trophy className="size-4 text-yellow-500" />,
    2: <Medal className="size-4 text-gray-400" />,
    3: <Medal className="size-4 text-amber-600" />,
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground"
          onClick={() => router.push("/campaigns")}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl"
      >
        {campaign.cover_image_url ? (
          <div className="relative aspect-[21/9] overflow-hidden">
            <img
              src={campaign.cover_image_url}
              alt={campaign.title}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="flex aspect-[21/9] items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600">
            <Target className="size-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ActionBadge category={campaign.category} />
                <Badge
                  variant={campaign.is_active ? "default" : "secondary"}
                  className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                >
                  {campaign.is_active ? "Aktif" : "Selesai"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-sm md:text-3xl">
                {campaign.title}
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Tentang Kampanye</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {campaign.description}
                </p>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3.5" />
                      Lokasi
                    </span>
                    <p className="font-medium">
                      {campaign.location ?? "Online"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      Mulai
                    </span>
                    <p className="font-medium">
                      {format(new Date(campaign.start_date), "d MMM yyyy", { locale: localeId })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      Selesai
                    </span>
                    <p className="font-medium">
                      {format(new Date(campaign.end_date), "d MMM yyyy", { locale: localeId })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5" />
                      Kategori
                    </span>
                    <p className="font-medium">
                      {CATEGORY_LABELS[campaign.category]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-5 text-yellow-500" />
                  Papan Peringkat
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {members.length} peserta
                </span>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Users className="mb-3 size-10 text-muted-foreground" />
                    <p className="font-medium">Belum ada peserta</p>
                    <p className="text-sm text-muted-foreground">
                      Jadilah yang pertama bergabung!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.user.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-3 transition-colors",
                          entry.user.id === currentUserId
                            ? "bg-green-50 dark:bg-green-950"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex w-8 items-center justify-center text-sm font-bold text-muted-foreground">
                          {rankIcons[entry.rank] ?? (
                            <span className="text-muted-foreground">
                              {entry.rank}
                            </span>
                          )}
                        </div>
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              entry.user.display_name ?? "User"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {entry.user.display_name}
                            {entry.user.id === currentUserId && (
                              <span className="ml-1.5 text-xs text-green-600">
                                (Kamu)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {entry.user.level}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">
                            {entry.contribution}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            kontribusi
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  Partisipasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">
                    {formatNumber(campaign.current_participants)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    target {formatNumber(campaign.target_participants)}
                  </span>
                </div>

                <ProgressBar
                  value={campaign.current_participants}
                  max={campaign.target_participants}
                  showLabel
                />

                {userMemberEntry && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      Kontribusimu
                    </p>
                    <p className="text-lg font-bold">
                      {userMemberEntry.contribution}
                    </p>
                  </div>
                )}

                {isJoined ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleLeave}
                    disabled={leaving}
                  >
                    {leaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                    Tinggalkan Kampanye
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={handleJoin}
                    disabled={joining}
                  >
                    {joining ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    Gabung Kampanye
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid gap-4"
          >
            <StatCard
              title="Total CO₂ Disimpan"
              value={formatNumber(campaign.total_co2_saved)}
              unit="kg"
              icon={<Leaf className="size-5 text-green-600" />}
            />
            <StatCard
              title="Total Plastik Dikurangi"
              value={formatNumber(campaign.total_plastic_reduced)}
              unit="kg"
              icon={<Leaf className="size-5 text-blue-600" />}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
