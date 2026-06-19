"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Compass, Sparkles, Baby, Puzzle, Heart, ArrowRight, Star, Shield, Users } from "lucide-react"

const stats = [
  { value: "500+", label: "Activities" },
  { value: "50+", label: "Cities" },
  { value: "10K+", label: "Happy Parents" },
  { value: "8", label: "Growth Areas" },
]

const ageGroups = [
  { age: "0–2", label: "Babies", icon: Baby, desc: "Sensory play, bonding, and early motor skills" },
  { age: "3–5", label: "Toddlers", icon: Puzzle, desc: "Creative play, language, and social skills" },
  { age: "6–8", label: "Kids", icon: Star, desc: "STEM, sports, and structured learning" },
  { age: "9–12", label: "Pre-teens", icon: Heart, desc: "Leadership, independence, and advanced skills" },
]

const features = [
  { icon: Sparkles, title: "Smart Matching", desc: "AI-powered recommendations tailored to your child's unique profile", color: "text-primary", bg: "bg-primary/10" },
  { icon: Puzzle, title: "Growth Focus", desc: "Activities mapped to 8 key developmental areas for holistic growth", color: "text-accent-foreground", bg: "bg-accent/10" },
  { icon: Shield, title: "Parent Trusted", desc: "Age-appropriate, safety-checked activities you can feel good about", color: "text-green-600", bg: "bg-green-100" },
  { icon: Users, title: "Family Friendly", desc: "Activities the whole family can enjoy together", color: "text-blue-600", bg: "bg-blue-100" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-white to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="mr-1 h-3 w-3" /> Smart Activity Discovery for Kids
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Every Child&apos;s{" "}
              <span className="text-primary">Perfect Activity</span>
              {" "}Starts Here
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              KidPath helps you discover activities tailored to your child&apos;s age, interests,
              and developmental goals — so every moment is a learning moment.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild><Link href="/activities">Find Activities <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link href="#how-it-works">How It Works</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-background p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How KidPath Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Three simple steps to find the perfect activity</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create a Profile", desc: "Tell us about your child — age, interests, and what you want them to develop." },
              { step: "02", title: "Get Recommendations", desc: "Our smart engine matches your child with activities that fit their unique needs." },
              { step: "03", title: "Explore & Save", desc: "Browse, save favorites, and plan your family's next adventure." },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Activities for Every Age</h2>
            <p className="mt-4 text-lg text-muted-foreground">From babies to pre-teens, we have age-appropriate activities</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ageGroups.map((g) => (
              <div key={g.age} className="group rounded-xl border bg-background p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <g.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="mb-2">{g.age}</Badge>
                <h3 className="font-semibold">{g.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Parents Love KidPath</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-16 text-center text-white shadow-xl sm:px-12">
          <Compass className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to Find Your Child&apos;s Next Adventure?</h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">Join thousands of parents discovering the perfect activities for their children.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/activities">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/children">Create Child Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
