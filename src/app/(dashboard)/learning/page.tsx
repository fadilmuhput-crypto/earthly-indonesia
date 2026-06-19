"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Search, Clock, Trash2, Zap, Droplets, Bike, ShoppingBag, BookOpen,
  Lightbulb, X, Leaf, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ActionBadge } from "@/components/shared/action-badge"
import { CATEGORY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ActionCategory } from "@/types"

const CATEGORIES = ["all", "waste", "energy", "water", "transportation", "consumption"] as const
type TabValue = (typeof CATEGORIES)[number]

interface EducationalContent {
  id: number
  title: string
  description: string
  category: ActionCategory
  icon: string
  readTime: string
  content: string
  fact: string
}

const educationalContent: EducationalContent[] = [
  {
    id: 1,
    title: "Cara Memilah Sampah yang Benar",
    description: "Panduan lengkap memilah sampah organik, anorganik, dan B3 di rumah.",
    category: "waste",
    icon: "trash2",
    readTime: "3 menit",
    content:
      "Pemilahan sampah adalah langkah pertama yang paling penting dalam pengelolaan sampah yang baik. Sayangnya, masih banyak masyarakat Indonesia yang belum memahami cara memilah sampah dengan benar. Sampah rumah tangga sebenarnya bisa dikategorikan menjadi tiga jenis utama: organik, anorganik, dan B3 (Bahan Berbahaya dan Beracun).\n\nSampah organik seperti sisa makanan, kulit buah, dan daun-daunan dapat diolah menjadi kompos yang bermanfaat untuk tanaman. Sampah anorganik seperti plastik, kertas, dan logam bisa didaur ulang menjadi barang baru. Sementara sampah B3 seperti baterai bekas, lampu neon, dan kemasan pestisida harus dibuang ke tempat khusus karena mengandung zat berbahaya.\n\nMulailah dengan menyediakan tiga tempat sampah berbeda di rumah. Beri label yang jelas agar seluruh anggota keluarga terbiasa. Dengan kebiasaan sederhana ini, kita sudah berkontribusi besar dalam mengurangi beban Tempat Pemrosesan Akhir (TPA) yang semakin penuh.",
    fact: "Indonesia menghasilkan 64 juta ton sampah per tahun",
  },
  {
    id: 2,
    title: "Hemat Listrik, Hemat Biaya",
    description: "Tips mengurangi tagihan listrik sambil menyelamatkan lingkungan.",
    category: "energy",
    icon: "zap",
    readTime: "4 menit",
    content:
      "Tagihan listrik yang membengkak seringkali membuat kita mengeluh. Tapi tahukah Anda, dengan beberapa perubahan kecil, kita bisa menghemat listrik sekaligus mengurangi emisi karbon? Langkah pertama adalah mengganti semua lampu di rumah dengan lampu LED. Lampu LED mengonsumsi energi 80% lebih sedikit dan bisa bertahan hingga 25 kali lebih lama dibandingkan lampu pijar.\n\nKebiasaan sederhana seperti mematikan lampu saat keluar ruangan, mencabut charger yang tidak digunakan, dan mematikan peralatan elektronik sepenuhnya (bukan standby) bisa menghemat hingga 10% tagihan listrik bulanan. Perangkat dalam mode standby masih mengonsumsi sekitar 10% dari konsumsi listrik normal.\n\nGunakan stop kontak dengan saklar (power strip) untuk memudahkan mematikan beberapa perangkat sekaligus. Atur suhu AC di kisaran 24-26°C, karena setiap derajat lebih dingin meningkatkan konsumsi listrik hingga 6%. Mulai sekarang, setiap langkah kecil berarti untuk dompet dan bumi kita.",
    fact: "Lampu LED menghemat 80% lebih banyak energi",
  },
  {
    id: 3,
    title: "Krisis Air Bersih di Indonesia",
    description: "Memahami krisis air dan bagaimana kita bisa membantu.",
    category: "water",
    icon: "droplets",
    readTime: "5 menit",
    content:
      "Air bersih adalah kebutuhan dasar manusia, namun ironisnya, Indonesia masih menghadapi krisis air bersih yang serius. Menurut data, satu dari tiga orang Indonesia mengalami kesulitan mendapatkan akses air bersih. Perubahan iklim, pencemaran sungai, dan pengelolaan sumber daya air yang buruk menjadi penyebab utama krisis ini.\n\nBanyak daerah di Indonesia, terutama di Jawa dan Nusa Tenggara, mengalami kekeringan setiap musim kemarau. Sementara di saat yang sama, kebiasaan boros air masih sering kita temui di kota-kota besar. Rata-rata keluarga Indonesia menghabiskan sekitar 250 liter air per hari, padahal kebutuhan dasar manusia hanya sekitar 50 liter per hari.\n\nKita bisa mulai dengan kebiasaan sederhana: matikan keran saat menggosok gigi, mandi lebih singkat, tampung air hujan untuk menyiram tanaman, dan perbaiki keran yang bocor. Ingatlah, setiap tetes air sangat berharga bagi masa depan Indonesia.",
    fact: "1 dari 3 orang Indonesia kesulitan akses air bersih",
  },
  {
    id: 4,
    title: "Beralih ke Transportasi Ramah Lingkungan",
    description: "Mengapa dan bagaimana beralih ke transportasi hijau.",
    category: "transportation",
    icon: "bike",
    readTime: "3 menit",
    content:
      "Sektor transportasi menyumbang sekitar 27% dari total emisi CO2 global. Di Indonesia, jumlah kendaraan bermotor yang terus meningkat setiap tahunnya menjadi tantangan besar bagi kualitas udara dan perubahan iklim. Namun, kabar baiknya adalah kita memiliki banyak alternatif transportasi yang lebih ramah lingkungan.\n\nUntuk perjalanan jarak pendek, bersepeda atau berjalan kaki adalah pilihan terbaik. Selain nol emisi, aktivitas ini juga menyehatkan tubuh. Untuk jarak menengah, transportasi umum seperti bus, kereta, atau MRT bisa mengurangi emisi hingga 75% per perjalanan dibandingkan menggunakan mobil pribadi. Jika terpaksa menggunakan kendaraan pribadi, pertimbangkan untuk bergabung dengan program carpooling atau gunakan kendaraan listrik.\n\nBeralih ke transportasi ramah lingkungan memang membutuhkan penyesuaian, tapi manfaatnya luar biasa: udara lebih bersih, tubuh lebih sehat, dan dompet lebih hemat. Mulailah dengan satu perjalanan hijau per minggu, dan tingkatkan secara bertahap.",
    fact: "Transportasi menyumbang 27% emisi CO2 global",
  },
  {
    id: 5,
    title: "Gerakan #BeliLokalIndonesia",
    description: "Mengapa membeli produk lokal penting untuk lingkungan.",
    category: "consumption",
    icon: "shopping-bag",
    readTime: "4 menit",
    content:
      "Gerakan beli produk lokal bukan sekadar tren, tapi sebuah langkah konkret untuk mengurangi jejak karbon dan memperkuat ekonomi Indonesia. Produk impor harus menempuh perjalanan ribuan kilometer menggunakan kapal atau pesawat, menghasilkan emisi CO2 yang besar. Sebaliknya, produk lokal hanya menempuh perjalanan pendek dari produsen ke konsumen.\n\nProduk lokal memiliki jejak karbon hingga lima kali lebih rendah dibandingkan produk impor. Selain itu, dengan membeli produk lokal, kita mendukung petani, pengrajin, dan UMKM Indonesia. Uang yang kita belanjakan akan berputar di dalam negeri dan menciptakan lapangan kerja bagi masyarakat sekitar.\n\nMulailah dengan berbelanja di pasar tradisional, mencari label \"produk lokal\" di supermarket, dan mengurangi konsumsi barang impor yang tidak esensial. Setiap rupiah yang kita belanjakan adalah suara untuk masa depan yang lebih hijau dan berkelanjutan.",
    fact: "Produk lokal memiliki jejak karbon 5x lebih rendah",
  },
  {
    id: 6,
    title: "Komposting untuk Pemula",
    description: "Cara mudah membuat kompos dari sampah dapur.",
    category: "waste",
    icon: "trash2",
    readTime: "6 menit",
    content:
      "Tahukah Anda bahwa 60% sampah rumah tangga adalah sampah organik yang bisa dikompos? Sayangnya, banyak dari sampah ini berakhir di TPA dan menghasilkan gas metana yang 25 kali lebih berbahaya dari CO2. Dengan membuat kompos di rumah, kita tidak hanya mengurangi sampah, tapi juga menghasilkan pupuk organik berkualitas.\n\nCara termudah untuk memulai komposting adalah dengan metode ember tumpuk. Siapkan dua ember yang ditumpuk, dengan ember bawah dilubangi untuk menampung cairan lindi. Masukkan sampah dapur seperti sisa sayuran, kulit buah, dan ampas kopi secara bergantian dengan bahan kering seperti daun kering atau serbuk gergaji. Tambahkan EM4 atau starter kompos untuk mempercepat proses.\n\nDalam waktu 4-6 minggu, kompos siap digunakan. Aplikasikan pada tanaman di pot atau kebun. Cairan lindi yang terkumpul juga bisa diencerkan menjadi pupuk cair. Komposting adalah kegiatan yang mudah, murah, dan memberikan dampak besar bagi lingkungan.",
    fact: "60% sampah rumah tangga adalah organik dan bisa dikompos",
  },
  {
    id: 7,
    title: "Energi Terbarukan di Indonesia",
    description: "Potensi energi surya, angin, dan air di Indonesia.",
    category: "energy",
    icon: "zap",
    readTime: "5 menit",
    content:
      "Indonesia adalah negara yang sangat kaya akan potensi energi terbarukan. Dengan total potensi mencapai 419 Gigawatt (GW), Indonesia memiliki segalanya: sinar matahari yang melimpah sepanjang tahun, angin yang bertiup di wilayah timur, air yang mengalir deras di sungai-sungai, dan panas bumi terbesar di dunia.\n\nSayangnya, pemanfaatan energi terbarukan di Indonesia masih sangat rendah, baru sekitar 2-3% dari total potensi yang ada. PLTS Atap (Pembangkit Listrik Tenaga Surya Atap) menjadi salah satu solusi yang paling mudah diadopsi oleh masyarakat. Dengan investasi sekitar 10-15 juta rupiah, rumah tangga bisa memasang panel surya 1000 Watt dan menghemat tagihan listrik hingga 30%.\n\nPemerintah telah menargetkan bauran energi terbarukan sebesar 23% pada tahun 2025. Namun, target ini membutuhkan partisipasi aktif dari masyarakat. Mulai dari menggunakan panel surya di rumah hingga memilih listrik hijau dari PLN, setiap langkah kita berarti untuk transisi energi Indonesia.",
    fact: "Indonesia memiliki potensi 419 GW energi terbarukan",
  },
  {
    id: 8,
    title: "10 Cara Hemat Air di Rumah",
    description: "Tips praktis menghemat air setiap hari.",
    category: "water",
    icon: "droplets",
    readTime: "3 menit",
    content:
      "Air adalah sumber daya yang terbatas, dan sayangnya masih banyak dari kita yang menggunakannya secara boros. Berikut adalah sepuluh cara mudah untuk menghemat air di rumah: pertama, matikan keran saat menggosok gigi atau menyabun tangan. Kedua, mandi dengan ember dan gayung daripada shower. Ketiga, perbaiki keran dan pipa yang bocor.\n\nKeempat, gunakan mesin cuci dengan kapasitas penuh. Kelima, tampung air bekas cucian sayur untuk menyiram tanaman. Keenam, pasang aerator pada keran untuk mengurangi debit air. Ketujuh, siram tanaman di pagi atau sore hari agar air tidak cepat menguap.\n\nKedelapan, gunakan toilet dual-flush yang memiliki dua tombol siram. Kesembilan, cuci kendaraan dengan ember, bukan selang. Kesepuluh, biasakan menampung air hujan. Dengan menerapkan tips ini, sebuah keluarga bisa menghemat hingga 100 liter air per hari. Mulailah dari sekarang, karena setiap tetes air sangat berharga.",
    fact: "Keluarga Indonesia rata-rata menghabiskan 250 liter air/hari",
  },
  {
    id: 9,
    title: "Manfaat Bersepeda untuk Lingkungan",
    description: "Bersepeda bukan hanya sehat, tapi juga ramah lingkungan.",
    category: "transportation",
    icon: "bike",
    readTime: "3 menit",
    content:
      "Bersepeda adalah salah satu bentuk transportasi paling ramah lingkungan yang bisa kita pilih. Selain menghasilkan nol emisi, bersepeda juga memberikan banyak manfaat kesehatan. Jika Anda bersepeda 10 kilometer setiap hari, dalam setahun Anda bisa menghemat 250 kilogram emisi CO2. Itu setara dengan menanam 4 pohon!\n\nDi berbagai negara maju seperti Belanda, Denmark, dan Jerman, bersepeda sudah menjadi gaya hidup. Pemerintah mereka menyediakan infrastruktur sepeda yang aman dan nyaman, seperti jalur sepeda yang terpisah dari jalan raya, parkir sepeda yang luas, dan sistem bike-sharing yang terintegrasi dengan transportasi umum.\n\nDi Indonesia, tren bersepeda semakin meningkat, terutama setelah pandemi. Banyak kota mulai membangun jalur sepeda, meskipun masih perlu perbaikan. Mulailah bersepeda untuk perjalanan pendek seperti ke warung, kantor pos, atau rumah teman. Selain sehat dan hemat, Anda juga berkontribusi mengurangi kemacetan dan polusi udara.",
    fact: "Bersepeda 10 km/hari menghemat 250 kg CO2/tahun",
  },
  {
    id: 10,
    title: "Mindful Consumption: Belanja Bijak",
    description: "Cara mengurangi konsumsi berlebihan dan dampaknya.",
    category: "consumption",
    icon: "shopping-bag",
    readTime: "4 menit",
    content:
      "Mindful consumption atau konsumsi sadar adalah praktik membeli dan menggunakan barang dengan penuh kesadaran akan dampak lingkungan dan sosialnya. Di era konsumerisme, kita sering membeli barang bukan karena kebutuhan, tapi karena dorongan diskon, tren, atau FOMO (Fear of Missing Out).\n\nLangkah pertama menuju konsumsi sadar adalah menerapkan prinsip 5R: Refuse (menolak barang yang tidak perlu), Reduce (mengurangi konsumsi), Reuse (memakai ulang), Recycle (mendaur ulang), dan Rot (mengompos). Sebelum membeli, tanyakan pada diri sendiri: Apakah saya benar-benar membutuhkan ini? Apakah ada alternatif yang lebih ramah lingkungan?\n\nBudaya belanja impulsif tidak hanya merusak dompet, tapi juga lingkungan. Produksi barang membutuhkan sumber daya alam dan energi, sementara limbahnya mencemari lingkungan. Dengan menerapkan mindful consumption, kita tidak hanya menghemat uang, tapi juga berkontribusi pada masa depan yang lebih berkelanjutan untuk Indonesia.",
    fact: "Rata-rata orang Indonesia membuang 300 kg makanan/tahun",
  },
]

const iconMap: Record<string, React.ReactNode> = {
  trash2: <Trash2 className="size-5 text-orange-500" />,
  zap: <Zap className="size-5 text-yellow-500" />,
  droplets: <Droplets className="size-5 text-blue-500" />,
  bike: <Bike className="size-5 text-purple-500" />,
  "shopping-bag": <ShoppingBag className="size-5 text-pink-500" />,
}

const categoryColors: Record<ActionCategory, string> = {
  waste: "border-l-orange-500",
  energy: "border-l-yellow-500",
  water: "border-l-blue-500",
  transportation: "border-l-purple-500",
  consumption: "border-l-pink-500",
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-1.5 h-4 w-full" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  )
}

export default function LearningPage() {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredContent = useMemo(() => {
    let items = educationalContent
    if (activeTab !== "all") {
      items = items.filter((c) => c.category === activeTab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q),
      )
    }
    return items
  }, [activeTab, search])

  const hasResults = filteredContent.length > 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1.5 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-72" />
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Belajar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tingkatkan pengetahuan lingkunganmu dengan artikel edukatif
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full sm:w-72"
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </motion.div>
      </motion.div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as TabValue)
          setSearch("")
        }}
      >
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <BookOpen className="size-3.5" />
              Semua
            </TabsTrigger>
            {(["waste", "energy", "water", "transportation", "consumption"] as const).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                {iconMap[cat === "waste" ? "trash2" : cat === "energy" ? "zap" : cat === "water" ? "droplets" : cat === "transportation" ? "bike" : "shopping-bag"]}
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-20 text-center"
            >
              <div className="mb-4 rounded-full bg-muted p-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">Artikel tidak ditemukan</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Tidak ada artikel yang sesuai dengan kata kunci &quot;{search}&quot;. Coba gunakan kata kunci lain.
              </p>
              <Button variant="outline" onClick={() => { setSearch(""); setActiveTab("all") }}>
                Reset Pencarian
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card
                          className={cn(
                            "group cursor-pointer overflow-hidden border-l-4 transition-all hover:shadow-md",
                            categoryColors[item.category],
                          )}
                          onClick={() => setSelectedContent(item)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                {iconMap[item.icon]}
                              </div>
                              <ActionBadge category={item.category} />
                            </div>
                            <CardTitle className="mt-2 text-base leading-snug group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-0">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {item.readTime}
                            </div>
                          </CardFooter>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                        <DialogHeader>
                          <div className="mb-1 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                              {iconMap[item.icon]}
                            </div>
                            <ActionBadge category={item.category} />
                          </div>
                          <DialogTitle className="text-xl">{item.title}</DialogTitle>
                          <DialogDescription>{item.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="mt-0.5 size-5 shrink-0 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">Tahu nggak?</p>
                                <p className="mt-0.5 text-sm text-green-700 dark:text-green-300">{item.fact}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 text-sm leading-relaxed text-foreground">
                            {item.content.split("\n\n").map((paragraph, i) => (
                              <p key={i}>{paragraph}</p>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            Waktu baca: {item.readTime}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      {hasResults && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          Menampilkan {filteredContent.length} dari {educationalContent.length} artikel
        </motion.p>
      )}
    </div>
  )
}
