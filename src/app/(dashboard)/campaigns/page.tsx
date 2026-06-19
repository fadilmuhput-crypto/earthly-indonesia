"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "motion/react"
import { Users, MapPin, Calendar, Target, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ActionBadge } from "@/components/shared/action-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Campaign } from "@/types"

function getCampaignStatus(campaign: Campaign): "active" | "upcoming" | "ended" {
  const now = new Date()
  const start = new Date(campaign.start_date)
  const end = new Date(campaign.end_date)
  if (now < start) return "upcoming"
  if (now > end) return "ended"
  return "active"
}

const statusTabs = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "upcoming", label: "Akan Datang" },
  { value: "ended", label: "Selesai" },
] as const

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  ended: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

const statusLabels: Record<string, string> = {
  active: "Aktif",
  upcoming: "Akan Datang",
  ended: "Selesai",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export default function CampaignsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    let mounted = true
    async function fetchCampaigns() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from("campaigns")
          .select("*")
          .order("start_date", { ascending: false })

        if (err) throw err
        if (mounted) setCampaigns(data ?? [])
      } catch (err) {
        console.error("Fetch campaigns error:", err)
        if (mounted) setError("Gagal memuat kampanye")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCampaigns()
    return () => { mounted = false }
  }, [supabase])

  const filtered = campaigns.filter((c) => {
    if (statusFilter === "all") return true
    return getCampaignStatus(c) === statusFilter
  })

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <AlertCircle className="mb-4 size-12 text-destructive" />
        <h2 className="mb-2 text-lg font-semibold">Terjadi Kesalahan</h2>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Coba Lagi
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold tracking-tight">Kampanye</h1>
        <p className="text-muted-foreground">
          Ikuti kampanye lingkungan dan berkontribusi bersama komunitas
        </p>
      </motion.div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Target className="mb-4 size-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">Belum Ada Kampanye</h2>
          <p className="text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "Belum ada kampanye yang tersedia"
              : `Tidak ada kampanye dengan status "${statusFilter === "active" ? "Aktif" : statusFilter === "upcoming" ? "Akan Datang" : "Selesai"}"`}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign, i) => {
            const progress = Math.round(
              (campaign.current_participants / campaign.target_participants) * 100
            )
            const status = getCampaignStatus(campaign)

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {campaign.cover_image_url ? (
                      <img
                        src={campaign.cover_image_url}
                        alt={campaign.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600">
                        <Target className="size-12 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <ActionBadge category={campaign.category} />
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusColors[status]
                        )}
                      >
                        {statusLabels[status]}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                      <p className="text-sm font-semibold text-white drop-shadow-sm">
                        {campaign.current_participants}/{campaign.target_participants} Peserta
                      </p>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-1 text-lg">
                      {campaign.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 pb-3">
                    <Progress value={Math.min(progress, 100)} />

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {campaign.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {campaign.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(campaign.start_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      <span>
                        {campaign.current_participants} dari{" "}
                        {campaign.target_participants} peserta
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      Lihat Detail
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
