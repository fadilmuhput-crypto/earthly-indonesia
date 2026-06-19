"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  Leaf,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ASSESSMENT_QUESTIONS, CATEGORY_LABELS } from "@/lib/constants"
import type { ActionCategory, AssessmentResult } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/shared/progress-bar"

const TOTAL = ASSESSMENT_QUESTIONS.length
const CATEGORIES: ActionCategory[] = [
  "waste",
  "energy",
  "water",
  "transportation",
  "consumption",
]

function calcCategoryScore(
  answers: Record<number, number>,
  category: ActionCategory
): number {
  const qs = ASSESSMENT_QUESTIONS.filter((q) => q.category === category)
  const vals = qs.map((q) => answers[q.id]).filter((v) => v !== undefined)
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / 10) * 100)
}

function calcResult(
  answers: Record<number, number>
): AssessmentResult {
  const categoryScores = {} as Record<ActionCategory, number>
  for (const c of CATEGORIES) categoryScores[c] = calcCategoryScore(answers, c)
  const overall = Math.round(
    CATEGORIES.reduce((s, c) => s + categoryScores[c], 0) / CATEGORIES.length
  )
  const min = Math.min(...CATEGORIES.map((c) => categoryScores[c]))
  const lowest = CATEGORIES.filter((c) => categoryScores[c] === min)

  const recs: Record<ActionCategory, string> = {
    waste: "Mulai biasakan memilah sampah rumah tangga dan bawa tas belanja sendiri untuk mengurangi sampah plastik.",
    energy: "Hemat energi dengan mengganti lampu ke LED dan mematikan peralatan elektronik yang tidak terpakai.",
    water: "Kurangi pemakaian air dengan mandi lebih cepat dan tampung air hujan untuk menyiram tanaman.",
    transportation: "Kurangi emisi karbon dengan menggunakan transportasi umum atau bersepeda untuk perjalanan pendek.",
    consumption: "Belanja produk lokal dan kurangi food waste dengan merencanakan menu mingguan.",
  }

  return {
    score: overall,
    category_scores: categoryScores,
    recommendations: lowest.map((c) => recs[c]),
  }
}

const catBarColor: Record<ActionCategory, string> = {
  waste: "bg-amber-500",
  energy: "bg-yellow-500",
  water: "bg-blue-500",
  transportation: "bg-emerald-500",
  consumption: "bg-purple-500",
}

const catBadgeColor: Record<ActionCategory, string> = {
  waste: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  energy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  water: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  transportation: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  consumption: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
}

export default function AssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [dir, setDir] = useState(0)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const q = ASSESSMENT_QUESTIONS[step]
  const isLast = step === TOTAL - 1
  const answered = answers[q.id] !== undefined

  function handleSelect(v: number) {
    setAnswers((p) => ({ ...p, [q.id]: v }))
  }

  function handleNext() {
    if (isLast) {
      setResult(calcResult(answers))
      return
    }
    setDir(1)
    setStep((p) => p + 1)
  }

  function handlePrev() {
    setDir(-1)
    setStep((p) => p - 1)
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    setSaveErr(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaveErr("Silakan masuk terlebih dahulu untuk menyimpan hasil.")
      setSaving(false)
      return
    }
    const { error } = await supabase
      .from("profiles")
      .update({ earth_score: result.score })
      .eq("user_id", user.id)
    if (error) {
      setSaveErr(error.message)
      toast.error("Gagal menyimpan hasil penilaian.")
      setSaving(false)
      return
    }
    toast.success("Hasil penilaian berhasil disimpan ke profil Anda!")
    setSaving(false)
  }

  function handleReset() {
    setResult(null)
    setStep(0)
    setAnswers({})
    setDir(0)
    setSaveErr(null)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  if (result) {
    const level =
      result.score >= 80
        ? { label: "Sangat Baik", emoji: "🌳", color: "from-emerald-500 to-green-500" }
        : result.score >= 60
          ? { label: "Baik", emoji: "🌿", color: "from-yellow-500 to-amber-500" }
          : result.score >= 40
            ? { label: "Cukup", emoji: "🌱", color: "from-orange-500 to-red-500" }
            : { label: "Perlu Perbaikan", emoji: "🔥", color: "from-red-500 to-rose-500" }

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-emerald-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-lg pb-12 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${level.color} shadow-lg shadow-emerald-900/10`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{result.score}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                  {level.emoji}
                </div>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Skor Bumi Anda
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {level.label} — {result.score}/100
            </p>
          </motion.div>

          <Card className="mb-6 border-emerald-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-emerald-800/30 dark:bg-zinc-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-emerald-600" />
                Rincian per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CATEGORIES.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{CATEGORY_LABELS[c]}</span>
                    <span className="text-sm font-bold">{result.category_scores[c]}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${catBarColor[c]} transition-all duration-700 ease-out`}
                      style={{ width: `${result.category_scores[c]}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {result.recommendations.length > 0 && (
            <Card className="mb-6 border-emerald-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-emerald-800/30 dark:bg-zinc-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Rekomendasi untuk Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">{rec}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {saveErr && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{saveErr}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Simpan ke Profil
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Ulangi Penilaian
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-emerald-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-lg pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.05 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20"
          >
            <Leaf className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Penilaian Kebugaran Bumi
          </h1>
          <p className="text-sm text-muted-foreground">
            Jawab 10 pertanyaan untuk mengetahui skor lingkungan Anda
          </p>
        </motion.div>

        <div className="mb-6">
          <ProgressBar value={step + 1} max={TOTAL} showLabel />
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="border-emerald-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-emerald-800/30 dark:bg-zinc-900/80">
              <CardHeader>
                <span
                  className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${catBadgeColor[q.category]}`}
                >
                  {CATEGORY_LABELS[q.category]}
                </span>
                <CardTitle className="text-base leading-relaxed">
                  {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt) => {
                  const sel = answers[q.id] === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                        sel
                          ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-700 shadow-sm dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "border-border bg-background hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Sebelumnya
          </Button>

          <span className="text-xs text-muted-foreground">
            {step + 1} / {TOTAL}
          </span>

          <Button onClick={handleNext} disabled={!answered}>
            {isLast ? "Lihat Hasil" : "Selanjutnya"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
