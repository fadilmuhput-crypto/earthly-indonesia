import type {
  AssessmentQuestion,
  ActionCategory,
  Difficulty,
} from "@/types"

export const APP_NAME = "Earthly Indonesia"
export const APP_TAGLINE = "Bumi Hijau, Indonesia Maju"
export const APP_DESCRIPTION =
  "Platform aksi lingkungan untuk membantu masyarakat Indonesia mengadopsi kebiasaan ramah lingkungan"

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  waste: "Pengelolaan Sampah",
  energy: "Hemat Energi",
  water: "Hemat Air",
  transportation: "Transportasi",
  consumption: "Konsumsi Bijak",
}

export const CATEGORY_ICONS: Record<ActionCategory, string> = {
  waste: "trash2",
  energy: "zap",
  water: "droplets",
  transportation: "bike",
  consumption: "shopping-bag",
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-green-500 bg-green-50 dark:bg-green-950",
  medium: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  hard: "text-red-500 bg-red-50 dark:bg-red-950",
}

export const NAV_ITEMS = [
  { label: "Beranda", href: "/dashboard", icon: "home" },
  { label: "Aksi Hijau", href: "/actions", icon: "leaf" },
  { label: "Tantangan", href: "/challenges", icon: "trophy" },
  { label: "Kampanye", href: "/campaigns", icon: "users" },
  { label: "Belajar", href: "/learning", icon: "book-open" },
]

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: "Seberapa sering Anda memilah sampah rumah tangga?",
    category: "waste",
    options: [
      { label: "Selalu", value: 10 },
      { label: "Sering", value: 7 },
      { label: "Kadang-kadang", value: 4 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 2,
    question: "Apakah Anda membawa tas belanja sendiri saat berbelanja?",
    category: "waste",
    options: [
      { label: "Selalu", value: 10 },
      { label: "Sering", value: 7 },
      { label: "Kadang-kadang", value: 4 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 3,
    question: "Seberapa sering Anda mematikan peralatan elektronik saat tidak digunakan?",
    category: "energy",
    options: [
      { label: "Selalu", value: 10 },
      { label: "Sering", value: 7 },
      { label: "Kadang-kadang", value: 4 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 4,
    question: "Apakah Anda menggunakan lampu hemat energi (LED)?",
    category: "energy",
    options: [
      { label: "Ya, semua", value: 10 },
      { label: "Sebagian", value: 6 },
      { label: "Tidak", value: 0 },
    ],
  },
  {
    id: 5,
    question: "Seberapa sering Anda mematikan keran saat menggosok gigi?",
    category: "water",
    options: [
      { label: "Selalu", value: 10 },
      { label: "Sering", value: 7 },
      { label: "Kadang-kadang", value: 4 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 6,
    question: "Apakah Anda menampung air hujan untuk menyiram tanaman?",
    category: "water",
    options: [
      { label: "Ya", value: 10 },
      { label: "Kadang-kadang", value: 5 },
      { label: "Tidak", value: 0 },
    ],
  },
  {
    id: 7,
    question: "Bagaimana transportasi utama Anda sehari-hari?",
    category: "transportation",
    options: [
      { label: "Jalan kaki/sepeda", value: 10 },
      { label: "Transportasi umum", value: 7 },
      { label: "Motor", value: 4 },
      { label: "Mobil pribadi", value: 1 },
    ],
  },
  {
    id: 8,
    question: "Seberapa sering Anda menggunakan kendaraan umum?",
    category: "transportation",
    options: [
      { label: "Setiap hari", value: 10 },
      { label: "Beberapa kali seminggu", value: 7 },
      { label: "Jarang", value: 3 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 9,
    question: "Apakah Anda membeli produk lokal untuk mengurangi jejak karbon?",
    category: "consumption",
    options: [
      { label: "Selalu", value: 10 },
      { label: "Sering", value: 7 },
      { label: "Kadang-kadang", value: 4 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 10,
    question: "Seberapa sering Anda mengurangi konsumsi daging (Meatless Monday)?",
    category: "consumption",
    options: [
      { label: "Sering (3+ hari/minggu)", value: 10 },
      { label: "Kadang-kadang", value: 6 },
      { label: "Jarang", value: 3 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
]

export const SEED_ACTIONS = [
  {
    title: "Pilah Sampah Rumah Tangga",
    description: "Mulai memilah sampah organik, anorganik, dan B3 di rumah Anda. Ini langkah pertama menuju gaya hidup nol sampah.",
    category: "waste" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 70,
    co2_reduction: 50,
    plastic_reduction: 5,
    water_saving: 0,
    points: 15,
    instructions: [
      "Siapkan 3 tempat sampah berbeda (organik, anorganik, B3)",
      "Beri label setiap tempat sampah",
      "Pilah sampah setiap hari sebelum dibuang",
      "Sampah organik bisa dijadikan kompos",
    ],
    tips: [
      "Gunakan ember bekas sebagai tempat sampah pilah",
      "Libatkan seluruh anggota keluarga",
    ],
  },
  {
    title: "Bawa Tas Belanja Sendiri",
    description: "Kurangi penggunaan kantong plastik dengan membawa tas belanja reusable setiap kali berbelanja.",
    category: "waste" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 60,
    co2_reduction: 20,
    plastic_reduction: 10,
    water_saving: 0,
    points: 10,
    instructions: [
      "Siapkan tas belanja di dalam tas atau mobil",
      "Ingatkan diri sendiri sebelum berangkat belanja",
      "Gunakan tas yang dilipat kecil agar mudah dibawa",
    ],
    tips: ["Simpan tas belanja di tempat yang mudah terlihat"],
  },
  {
    title: "Ganti ke Lampu LED",
    description: "Ganti semua lampu di rumah Anda dengan lampu LED yang lebih hemat energi hingga 80%.",
    category: "energy" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 75,
    co2_reduction: 100,
    plastic_reduction: 0,
    water_saving: 0,
    points: 20,
    instructions: [
      "Hitung jumlah lampu yang perlu diganti",
      "Beli lampu LED sesuai kebutuhan",
      "Ganti lampu lama dengan LED",
      "Daur ulang lampu lama di tempat yang tepat",
    ],
    tips: [
      "LED bisa bertahan 25 kali lebih lama dari lampu pijar",
      "Pilih LED dengan warna warm white untuk kenyamanan",
    ],
  },
  {
    title: "Matikan Elektronik yang Tidak Dipakai",
    description: "Cabut charger dan matikan peralatan elektronik yang tidak digunakan untuk menghemat listrik.",
    category: "energy" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 55,
    co2_reduction: 75,
    plastic_reduction: 0,
    water_saving: 0,
    points: 10,
    instructions: [
      "Biasakan mematikan TV, komputer, dan lampu saat tidak digunakan",
      "Cabut charger setelah selesai mengisi daya",
      "Gunakan stop kontak dengan saklar untuk memudahkan",
    ],
    tips: [
      "Perangkat dalam mode standby masih mengonsumsi 10% listrik",
      "Gunakan power strip untuk mematikan banyak perangkat sekaligus",
    ],
  },
  {
    title: "Kurangi Waktu Mandi",
    description: "Kurangi waktu mandi Anda 5 menit untuk menghemat ribuan liter air per bulan.",
    category: "water" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 50,
    co2_reduction: 0,
    plastic_reduction: 0,
    water_saving: 500,
    points: 10,
    instructions: [
      "Pasang timer atau gunakan jam",
      "Matikan air saat menggosok sabun",
      "Targetkan mandi maksimal 5 menit",
    ],
    tips: [
      "Gunakan ember dan gayung untuk kontrol pemakaian air",
      "Setiap menit menghemat 10 liter air",
    ],
  },
  {
    title: "Tampung Air Hujan",
    description: "Pasang sistem penampungan air hujan untuk menyiram tanaman dan mencuci kendaraan.",
    category: "water" as ActionCategory,
    difficulty: "medium" as Difficulty,
    impact_score: 80,
    co2_reduction: 0,
    plastic_reduction: 0,
    water_saving: 2000,
    points: 25,
    instructions: [
      "Siapkan drum atau ember besar",
      "Pasang talang air ke drum penampungan",
      "Pasang kran di bagian bawah drum",
      "Gunakan air untuk menyiram tanaman atau mencuci",
    ],
    tips: [
      "Tutup drum untuk mencegah nyamuk berkembang biak",
      "Tambahkan saringan untuk menyaring kotoran",
    ],
  },
  {
    title: "Bersepeda ke Tempat Terdekat",
    description: "Ganti perjalanan pendek dengan sepeda untuk mengurangi emisi karbon dan menjaga kesehatan.",
    category: "transportation" as ActionCategory,
    difficulty: "medium" as Difficulty,
    impact_score: 85,
    co2_reduction: 200,
    plastic_reduction: 0,
    water_saving: 0,
    points: 30,
    instructions: [
      "Identifikasi rute yang aman untuk bersepeda",
      "Pastikan sepeda dalam kondisi baik",
      "Gunakan helm dan perlengkapan keselamatan",
      "Mulai dengan rute pendek (1-2 km)",
    ],
    tips: [
      "Bawa pakaian ganti jika berkeringat",
      "Gunakan aplikasi peta untuk mencari rute sepeda",
    ],
  },
  {
    title: "Gunakan Transportasi Umum",
    description: "Beralih ke transportasi umum untuk mengurangi emisi karbon hingga 75% per perjalanan.",
    category: "transportation" as ActionCategory,
    difficulty: "medium" as Difficulty,
    impact_score: 80,
    co2_reduction: 300,
    plastic_reduction: 0,
    water_saving: 0,
    points: 25,
    instructions: [
      "Cari tahu rute transportasi umum terdekat",
      "Beli kartu transportasi elektronik",
      "Rencanakan perjalanan lebih awal",
      "Nikmati perjalanan sambil membaca atau mendengarkan podcast",
    ],
    tips: [
      "Aplikasi transportasi umum membantu merencanakan rute",
      "Berangkat lebih awal untuk menghindari keterlambatan",
    ],
  },
  {
    title: "Belanja Produk Lokal",
    description: "Dukung petani dan produsen lokal sambil mengurangi jejak karbon dari transportasi barang impor.",
    category: "consumption" as ActionCategory,
    difficulty: "easy" as Difficulty,
    impact_score: 65,
    co2_reduction: 80,
    plastic_reduction: 3,
    water_saving: 0,
    points: 15,
    instructions: [
      "Kunjungi pasar tradisional atau petani lokal",
      "Cari label 'produk lokal' di supermarket",
      "Belanja musiman untuk produk yang lebih segar",
    ],
    tips: [
      "Produk lokal biasanya lebih segar dan lebih murah",
      "Kurangi emisi transportasi hingga 10x lipat",
    ],
  },
  {
    title: "Kurangi Makanan Sisa (Food Waste)",
    description: "Rencanakan menu mingguan dan olah sisa makanan menjadi kompos untuk mengurangi sampah makanan.",
    category: "consumption" as ActionCategory,
    difficulty: "medium" as Difficulty,
    impact_score: 75,
    co2_reduction: 150,
    plastic_reduction: 2,
    water_saving: 0,
    points: 20,
    instructions: [
      "Buat rencana menu mingguan sebelum belanja",
      "Beli bahan makanan sesuai kebutuhan",
      "Simpan makanan dengan benar agar tahan lama",
      "Olah sisa makanan menjadi kompos",
    ],
    tips: [
      "Sisa makanan di Indonesia mencapai 300 kg/orang/tahun",
      "Buat kompos dari sisa sayuran dan buah",
    ],
  },
]
