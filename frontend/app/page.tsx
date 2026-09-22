'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Clock, Star, Quote, Mail, Flame, Gift, Percent, Rocket, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { formatPrice, timeLeftUntil } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Product = Database['public']['Tables']['products']['Row'];
type Banner = Database['public']['Tables']['banners']['Row'];
type PromoCard = Database['public']['Tables']['promo_cards']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Tutorial = Database['public']['Tables']['tutorials']['Row'];

const reviews = [
  { name: 'Rahul Sharma', role: 'Engineering Student', rating: 5, text: 'Qrobo has been my go-to for all electronics projects. The quality of components and fast delivery is unmatched. The Arduino starter kit is perfect for beginners!' },
  { name: 'Priya Patel', role: 'Maker & Hobbyist', rating: 5, text: 'Amazing selection of sensors and modules. The website is easy to navigate and the product descriptions are very detailed. Highly recommend for DIY enthusiasts.' },
  { name: 'Arun Kumar', role: 'Robotics Educator', rating: 5, text: 'I buy all my robotics kit supplies from Qrobo for my workshops. The quality is consistent and the prices are very competitive. The project guides are a great bonus.' },
  { name: 'Sneha Reddy', role: '3D Printing Enthusiast', rating: 4, text: 'Great selection of 3D printing supplies. The PLA filament quality is excellent and the prices are better than other stores. Fast shipping too!' },
];

export default function HomePage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
  const [deals, setDeals] = useState<(Deal & { product: Product })[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [roboticsProducts, setRoboticsProducts] = useState<Product[]>([]);
  const [devBoardProducts, setDevBoardProducts] = useState<Product[]>([]);
  const [sensorProducts, setSensorProducts] = useState<Product[]>([]);
  const [arduinoProducts, setArduinoProducts] = useState<Product[]>([]);
  const [threeDProducts, setThreeDProducts] = useState<Product[]>([]);
  const [diyProducts, setDiyProducts] = useState<Product[]>([]);
  const [studentProducts, setStudentProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [
        bannersRes, promoRes, dealsRes,
        featuredRes, bestSellerRes, newArrivalRes,
        roboticsRes, devBoardRes, sensorRes, arduinoRes,
        threeDRes, diyRes, studentRes, projectsRes, tutorialsRes
      ] = await Promise.all([
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('promo_cards').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('deals').select('*, product:products(*)').eq('is_active', true).limit(8),
        supabase.from('products').select('*').eq('is_featured', true).eq('is_published', true).limit(10),
        supabase.from('products').select('*').eq('is_bestseller', true).eq('is_published', true).limit(10),
        supabase.from('products').select('*').eq('is_new_arrival', true).eq('is_published', true).limit(10),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'robotics-kits').maybeSingle()).data?.id, (await supabase.from('categories').select('id').eq('slug', 'robotics').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'development-boards').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'sensors').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'arduino').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', '3d-printing').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'diy-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('products').select('*').eq('is_published', true).in('category_id', [(await supabase.from('categories').select('id').eq('slug', 'student-project-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        supabase.from('projects').select('*').eq('is_published', true).limit(6),
        supabase.from('tutorials').select('*').eq('is_published', true).limit(6),
      ]);

      setBanners(bannersRes.data || []);
      setPromoCards(promoRes.data || []);
      setDeals((dealsRes.data as any) || []);
      setFeaturedProducts(featuredRes.data || []);
      setBestSellers(bestSellerRes.data || []);
      setNewArrivals(newArrivalRes.data || []);
      setRoboticsProducts(roboticsRes.data || []);
      setDevBoardProducts(devBoardRes.data || []);
      setSensorProducts(sensorRes.data || []);
      setArduinoProducts(arduinoRes.data || []);
      setThreeDProducts(threeDRes.data || []);
      setDiyProducts(diyRes.data || []);
      setStudentProducts(studentRes.data || []);
      setProjects(projectsRes.data || []);
      setTutorials(tutorialsRes.data || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <div className="skeleton-shimmer h-80 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[420px]">
            {/* Main banner */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[300px] sm:h-[380px] lg:h-full">
              {banners.map((banner, i) => (
                <div
                  key={banner.id}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-700',
                    i === currentBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                >
                  <div className="relative w-full h-full">
                    {banner.image_url && (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/65 to-transparent" />
                    <div className="absolute inset-0 campaign-grid opacity-20" />
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[18px] border-yellow-300/20 campaign-float" />
                    <div className="absolute right-8 top-8 hidden rotate-6 rounded-xl bg-yellow-300 px-4 py-2 text-center shadow-xl sm:block campaign-pulse">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-800">Limited drop</p>
                      <p className="text-2xl font-black leading-none text-red-700">HOT</p>
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 max-w-xl">
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg">
                        <Flame className="h-3.5 w-3.5" />
                        Qrobo live drop
                      </span>
                      {banner.category_label && (
                        <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider mb-3">
                          {banner.category_label}
                        </span>
                      )}
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight tracking-tight" style={{ textShadow: '0 3px 18px rgba(0,0,0,0.35)' }}>
                        {banner.title}
                      </h1>
                      <p className="text-sm sm:text-base text-gray-200 mb-6 max-w-md line-clamp-3">
                        {banner.description}
                      </p>
                      <div>
                        <Link href={banner.cta_link}>
                          <Button size="lg" className="campaign-pulse gap-2 bg-yellow-300 font-black text-red-900 hover:bg-yellow-200">
                            {banner.cta_text}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentBanner(i)}
                        className={cn(
                          'h-2 rounded-full transition-all',
                          i === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Promo cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {promoCards.map((card) => (
                <Link
                  key={card.id}
                  href={card.cta_link}
                  className={cn(
                    'group relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer h-[140px] lg:h-full',
                    card.background_color || 'bg-blue-50'
                  )}
                >
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-primary group-hover:underline">
                      {card.cta_text}
                    </span>
                    {card.image_url && (
                      <img src={card.image_url} alt={card.title} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campaign spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/deals" className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 campaign-grid opacity-25" />
            <div className="campaign-shine absolute -inset-y-1/2 left-0 w-1/3 bg-white/25 blur-xl" />
            <Flame className="absolute right-5 top-5 h-12 w-12 text-yellow-200/80 campaign-float" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"><Sparkles className="h-3 w-3" /> Hot right now</span>
                <h2 className="mt-4 text-3xl font-black leading-none text-white">SUPER<br />DEALS</h2>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-yellow-100">Shop the fire <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
          <Link href="/shop?category=3d-printing" className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -right-7 -top-7 h-32 w-32 rounded-full border-[14px] border-white/15 campaign-float" />
            <div className="absolute bottom-0 right-5 text-[90px] font-black leading-none text-white/10">3D</div>
            <Rocket className="absolute right-6 top-6 h-10 w-10 text-cyan-100" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-100">Fresh collection</span>
                <h2 className="mt-4 text-2xl font-black leading-tight text-white">PRINT.<br />PLAY. REPEAT.</h2>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-white">Explore 3D toys <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
          <Link href="/shop?sort=newest" className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-blue-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 campaign-grid opacity-20" />
            <div className="absolute right-5 top-5 flex h-16 w-16 rotate-6 items-center justify-center rounded-full border-4 border-yellow-300 bg-yellow-300 text-center shadow-lg">
              <span className="text-xs font-black leading-tight text-red-800">NEW<br />DROP</span>
            </div>
            <Percent className="absolute bottom-5 right-16 h-10 w-10 text-blue-300/40" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-300"><Gift className="h-3 w-3" /> Just landed</span>
                <h2 className="mt-4 text-2xl font-black leading-tight text-white">BUILD<br />WHAT'S NEXT</h2>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-200">See new arrivals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Daily Deals */}
      {deals.length > 0 && (
        <Section title="Daily Deals" subtitle="Limited time offers - grab them before they're gone" link="/deals" linkLabel="View all deals">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {deals.slice(0, 4).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </Section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <Section title="Best Sellers" subtitle="Our most popular products chosen by makers like you" link="/shop?sort=popularity" linkLabel="View all">
          <ProductRow products={bestSellers} />
        </Section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <Section title="New Arrivals" subtitle="The latest additions to our catalog" link="/shop?sort=newest" linkLabel="View all">
          <ProductRow products={newArrivals} />
        </Section>
      )}

      {/* Robotics & Automation */}
      {roboticsProducts.length > 0 && (
        <Section title="Robotics & Automation" subtitle="Build robots with our robotics kits and components" link="/shop?category=robotics" linkLabel="View all">
          <ProductRow products={roboticsProducts} />
        </Section>
      )}

      {/* Development Boards */}
      {devBoardProducts.length > 0 && (
        <Section title="Development Boards" subtitle="Microcontroller and single-board computers for every project" link="/shop?category=development-boards" linkLabel="View all">
          <ProductRow products={devBoardProducts} />
        </Section>
      )}

      {/* Sensors & Modules */}
      {sensorProducts.length > 0 && (
        <Section title="Sensors & Modules" subtitle="Detect and measure the world around your projects" link="/shop?category=sensors" linkLabel="View all">
          <ProductRow products={sensorProducts} />
        </Section>
      )}

      {/* Arduino / ESP / Raspberry Pi */}
      {arduinoProducts.length > 0 && (
        <Section title="Arduino & Development Boards" subtitle="Official Arduino boards and compatible alternatives" link="/shop?category=arduino" linkLabel="View all">
          <ProductRow products={arduinoProducts} />
        </Section>
      )}

      {/* 3D Printing */}
      {threeDProducts.length > 0 && (
        <Section title="3D Printing" subtitle="3D printers, filament, and upgrade parts" link="/shop?category=3d-printing" linkLabel="View all">
          <ProductRow products={threeDProducts} />
        </Section>
      )}

      {/* 3D Printing Toys */}
      {threeDProducts.length > 0 && (
        <Section title="3D Printing Toys & Figures" subtitle="Fun 3D-printed toys, figurines, and creative prints" link="/shop?category=3d-printing" linkLabel="View all">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {threeDProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      {/* DIY Project Kits */}
      {diyProducts.length > 0 && (
        <Section title="DIY Project Kits" subtitle="Complete kits with everything you need to build amazing projects" link="/shop?category=diy-kits" linkLabel="View all">
          <ProductRow products={diyProducts} />
        </Section>
      )}

      {/* Student Project Products */}
      {studentProducts.length > 0 && (
        <Section title="Student Project Products" subtitle="Educational kits perfect for school and college projects" link="/shop?category=student-project-kits" linkLabel="View all">
          <ProductRow products={studentProducts} />
        </Section>
      )}

      {/* Recommended Products */}
      {featuredProducts.length > 0 && (
        <Section title="Recommended For You" subtitle="Handpicked products we think you'll love" link="/shop" linkLabel="View all">
          <ProductRow products={featuredProducts} />
        </Section>
      )}

      {/* Projects / Tutorials */}
      {projects.length > 0 && (
        <Section title="Projects & Tutorials" subtitle="Learn and build with our curated project guides" link="/projects" linkLabel="Browse all projects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {project.image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-50">
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-md',
                      project.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      project.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {project.difficulty}
                    </span>
                    {project.estimated_cost && (
                      <span className="text-xs text-muted-foreground">~{formatPrice(project.estimated_cost)}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Learn Section */}
      {tutorials.length > 0 && (
        <Section title="Learn" subtitle="Expand your knowledge with our tutorials and guides" link="/learn" linkLabel="Browse all tutorials">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.slice(0, 3).map((tutorial) => (
              <Link
                key={tutorial.id}
                href={`/learn/${tutorial.slug}`}
                className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {tutorial.image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-50">
                    <img src={tutorial.image_url} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary">{tutorial.category}</span>
                  <h3 className="text-sm font-bold text-navy mb-1 group-hover:text-primary transition-colors">{tutorial.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tutorial.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tutorial.read_time} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Customer Reviews */}
      <Section title="Customer Reviews" subtitle="What our customers say about Qrobo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white">
              <Quote className="w-8 h-8 text-blue-100 mb-3" />
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{review.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-blue-900 to-navy p-8 sm:p-12 text-center">
          <div className="absolute inset-0 campaign-grid opacity-15" />
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-[14px] border-blue-400/15 campaign-float" />
          <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full border-[16px] border-yellow-300/10 campaign-float" style={{ animationDelay: '1s' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Qrobo insider
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Stay Updated</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for the latest products, deals, and project tutorials
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-300"
              />
              <Button type="submit" size="lg" className="campaign-pulse bg-yellow-300 font-black text-red-900 hover:bg-yellow-200">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, subtitle, link, linkLabel, children }: {
  title: string;
  subtitle?: string;
  link?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {link && linkLabel && (
          <Link href={link} className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0">
            {linkLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.slice(0, 5).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function DealCard({ deal }: { deal: Deal & { product: Product } }) {
  const [timeLeft, setTimeLeft] = useState(timeLeftUntil(deal.ends_at));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(timeLeftUntil(deal.ends_at)), 1000);
    return () => clearInterval(timer);
  }, [deal.ends_at]);

  return (
    <Link href={`/product/${deal.product.slug}`}>
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {deal.product.primary_image && (
            <img src={deal.product.primary_image} alt={deal.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          <span className="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3" />
            -{deal.discount_percentage ?? 0}%
          </span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-navy line-clamp-2 mb-2">{deal.product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-bold text-red-500">{formatPrice(deal.sale_price)}</span>
            <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.original_price)}</span>
          </div>
          {!timeLeft.expired ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          ) : (
            <p className="text-xs text-red-500 font-medium">Deal ended</p>
          )}
        </div>
      </div>
    </Link>
  );
}


