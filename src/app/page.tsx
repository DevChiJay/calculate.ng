import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Heart, DollarSign, Palette } from "lucide-react";
import { ThemeShowcase } from "@/components/layout/theme-showcase";

const calculators = [
  {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index with support for metric and imperial units",
    icon: Heart,
    href: "/bmi-calculator",
    theme: "Ocean",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Tax Calculator",
    description: "Calculate Nigerian income tax with current brackets and allowances",
    icon: DollarSign,
    href: "/tax-calculator",
    theme: "Royal",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Inflation Calculator",
    description: "Track inflation impact using Consumer Price Index data",
    icon: TrendingUp,
    href: "/inflation-calculator",
    theme: "Sunset",
    color: "from-orange-500 to-red-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calculator className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Calculate.ng
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your comprehensive Nigerian calculator suite featuring BMI, Tax, and Inflation calculators
            with beautiful themes and modern design.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            <span>Try different themes using the palette icon in the header</span>
          </div>
        </div>

        {/* Calculator Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {calculators.map((calc) => (
            <Card key={calc.href} className="calculator-card group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${calc.color} flex items-center justify-center mb-4`}>
                  <calc.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {calc.title}
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    {calc.theme}
                  </span>
                </CardTitle>
                <CardDescription>{calc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={calc.href}>
                  <Button className="w-full group-hover:scale-105 transition-transform">
                    Start Calculating
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Theme Showcase Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Dynamic Theme System</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each calculator features its own custom color scheme that automatically applies when you visit the page.
            You can also manually switch themes using the palette selector.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <ThemeShowcase />
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Health Focused</h3>
            <p className="text-sm text-muted-foreground">
              BMI calculator with personalized health recommendations
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Tax Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Up-to-date Nigerian tax brackets and allowances
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Economic Data</h3>
            <p className="text-sm text-muted-foreground">
              Real CPI data for accurate inflation calculations
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Beautiful Themes</h3>
            <p className="text-sm text-muted-foreground">
              Dynamic color schemes that adapt to each calculator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
