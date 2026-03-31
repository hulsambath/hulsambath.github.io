"use client";

import {
  Bike,
  CalendarDays,
  Camera,
  Check,
  Clock,
  CloudRain,
  CloudSun,
  Compass,
  Fuel,
  Map as MapIcon,
  MapPin,
  Moon,
  Mountain,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Timer,
  Trees,
  TriangleAlert,
  Waves,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TripLeg = {
  id: string;
  from: string;
  to: string;
  km: number;
  mins: number;
  roads?: string[];
  note: string;
};

type ItineraryItem = {
  icon:
  | "sunrise"
  | "route"
  | "coffee"
  | "mountain"
  | "hotel"
  | "moon"
  | "fish"
  | "waves"
  | "trees";
  title: string;
  time: string;
  legs: string[];
  bullets: string[];
  roadNote?: string;
};

type TripData = {
  meta: {
    title: string;
    subtitle: string;
    bestTime: string;
    dates: string;
    hotel: { name: string; mapUrl: string };
  };
  legs: TripLeg[];
  itinerary: {
    day1: { summary: string; items: ItineraryItem[] };
    day2: { summary: string; items: ItineraryItem[] };
  };
  places: Array<{
    name: string;
    description: string;
    why: string;
    tags: Array<"nature" | "food" | "scenic" | "coast" | string>;
    mapUrl?: string;
    image?: string;
  }>;
  alternatives: Record<
    "south" | "kampot" | "kep" | "return",
    Array<{ name: string; detour: string; bestFor: string; note: string }>
  >;
  variations: Array<{
    title: string;
    tone: string;
    bullets: string[];
    icon: "coffee" | "mountain";
  }>;
};

const trip: TripData = {
  meta: {
    title: "Kampot South Coast Loop",
    subtitle: "Explore Kampot, Kep & hidden coastal gems",
    bestTime: "Nov–Apr",
    dates: "April 4–5, 2026",
    hotel: {
      name: "Planned hotel (Kampot)",
      mapUrl: "https://maps.app.goo.gl/nBQftgmgnXzXBDdL8?g_st=it",
    },
  },
  legs: [
    {
      id: "pp_to_kampot",
      from: "Phnom Penh",
      to: "Kampot",
      km: 150,
      mins: 165,
      roads: ["NR3 (main)"],
      note:
        "Leave early to escape Phnom Penh traffic. Expect mixed speeds + trucks.",
    },
    {
      id: "kampot_to_saltfields",
      from: "Kampot",
      to: "Salt fields (area)",
      km: 15,
      mins: 25,
      roads: ["local paved"],
      note: "Golden-hour friendly. Watch for dust and slow tractors.",
    },
    {
      id: "saltfields_to_pepper",
      from: "Salt fields (area)",
      to: "Pepper farm area",
      km: 18,
      mins: 35,
      roads: ["local paved (patchy)"],
      note: "Relaxed scenic detour. Slow down near villages and dogs.",
    },
    {
      id: "kampot_to_bokor",
      from: "Kampot",
      to: "Bokor Mountain viewpoints",
      km: 40,
      mins: 75,
      roads: ["Bokor mountain road"],
      note: "Cooler temps + fog possible. Ride smooth; corners can be damp.",
    },
    {
      id: "bokor_to_kampot",
      from: "Bokor",
      to: "Kampot",
      km: 40,
      mins: 75,
      roads: ["Bokor mountain road"],
      note: "Descend with engine braking; watch for misty visibility.",
    },
    {
      id: "kampot_to_kep",
      from: "Kampot",
      to: "Kep (Crab Market)",
      km: 25,
      mins: 40,
      roads: ["NR33 (fast)"],
      note: "Short, easy run. Great for late-morning arrival before crowds.",
    },
    {
      id: "kep_to_hidden_beach",
      from: "Kep",
      to: "Quiet beach stop (choose a calm spot)",
      km: 12,
      mins: 25,
      roads: ["coastal/local"],
      note:
        "Aim early for quieter vibe. Some lanes can be sandy near beach access.",
    },
    {
      id: "kep_to_pp",
      from: "Kep",
      to: "Phnom Penh",
      km: 170,
      mins: 200,
      roads: ["NR3/NR2 connectors (varies)"],
      note:
        "Start the return before afternoon heat peaks. Buffer to avoid dusk.",
    },
  ],
  itinerary: {
    day1: {
      summary:
        "Ride south to Kampot, stop for a Khmer lunch on the way, check in and recharge, then head to Coconut Beach for a lazy afternoon—ending with sunset dinner at Kep Beach.",
      items: [
        {
          icon: "sunrise",
          title: "Pre-ride + departure",
          time: "05:30–06:00",
          legs: [],
          bullets: [
            "Quick bike check: tires, brakes, lights, fuel level",
            "Pack rain layer + cash in an easy pocket",
            "Roll out before the city fully wakes up",
          ],
          roadNote: "City traffic ramps up fast after 06:30.",
        },
        {
          icon: "route",
          title: "Ride: Phnom Penh → Kampot",
          time: "06:00–09:00",
          legs: ["pp_to_kampot"],
          bullets: [
            "Keep a steady pace; don’t weave around trucks",
            "One quick stretch stop halfway if needed",
            "Arrive and reset—hydrate before any detours",
          ],
          roadNote: "NR3 is mostly straightforward but busy; stay predictable.",
        },
        {
          icon: "fish",
          title: "Lunch: អាហារដ្ឋាន ខ្សែរ៉កដឹងព្រែក (Snam Brampi)",
          time: "09:30–11:00",
          legs: [],
          bullets: [
            "Local Khmer food spot near Kampot—great for a proper meal after the ride",
            "Try the fresh seafood or classic Khmer dishes",
            "Relax and hydrate before heading to the hotel",
          ],
          roadNote: "Easy to find via Google Maps pin.",
        },
        {
          icon: "hotel",
          title: "Check-in hotel + reset",
          time: "11:30–13:00",
          legs: [],
          bullets: [
            "Secure parking, shower, and device charging",
            "Quick rest and cool down before the afternoon",
            "Set tomorrow’s Bokor departure time",
          ],
          roadNote:
            "Don’t skip the rest—you’ll need energy for the afternoon beach trip.",
        },
        {
          icon: "waves",
          title: "Afternoon: Coconut Beach",
          time: "13:30–16:30",
          legs: [],
          bullets: [
            "Short ride from Kampot to the beach",
            "Swim, relax under coconut palms, grab a cold drink",
            "Leave by 16:30 to make it to Kep for sunset",
          ],
          roadNote: "Beach access roads can be narrow—ride slowly.",
        },
        {
          icon: "moon",
          title: "Evening: dinner + sunset at Kep Beach",
          time: "17:00–21:00",
          legs: ["kampot_to_kep"],
          bullets: [
            "Ride to Kep Beach for golden hour and sunset views",
            "Dinner: fresh crab, seafood BBQ, or a beachside restaurant",
            "Head back to Kampot hotel after dinner—early sleep for Bokor tomorrow",
          ],
          roadNote: "Ride back to Kampot is short (~25 min). Don’t rush in the dark.",
        },
      ],
    },
    day2: {
      summary:
        "Early morning Bokor Mountain climb for cool air and sweeping views, then a daylight return to Phnom Penh with smart, fatigue-saving breaks.",
      items: [
        {
          icon: "sunrise",
          title: "Early start + depart for Bokor",
          time: "06:00–06:30",
          legs: [],
          bullets: [
            "Light breakfast + coffee at the hotel",
            "Refuel the bike before heading up",
            "Leave early for the best mountain weather and light",
          ],
          roadNote:
            "Bokor is best in the morning—fog and rain increase after midday.",
        },
        {
          icon: "mountain",
          title: "Bokor Mountain: viewpoints + iconic stops",
          time: "06:45–11:00",
          legs: ["kampot_to_bokor", "bokor_to_kampot"],
          bullets: [
            "Lok Yeay Mao shrine + main viewpoints",
            "Old church / historic ruins area (short stop)",
            "Enjoy the cooler air and sweeping cloud views",
            "If fog/rain: shorten the loop, keep visibility priority",
          ],
          roadNote:
            "Bokor weather changes quickly; damp corners demand smooth inputs.",
        },
        {
          icon: "coffee",
          title: "Quick stop in Kampot + prepare for return",
          time: "11:15–12:00",
          legs: [],
          bullets: [
            "Grab lunch or a snack before the long ride back",
            "Top up fuel—don’t ride the gauge low",
            "Check-out hotel if not already done",
          ],
          roadNote: "A proper meal now saves you from a tired, hungry return.",
        },
        {
          icon: "route",
          title: "Return: Kampot → Phnom Penh",
          time: "12:00–15:30",
          legs: ["kep_to_pp"],
          bullets: [
            "Break every 60–90 minutes: water + quick stretch",
            "Keep speed steady; don’t rush to make time",
            "Arrive with daylight buffer for PP traffic",
          ],
          roadNote:
            "Plan to be back before dusk. If delayed, prioritize safety over speed.",
        },
      ],
    },
  },
  places: [
    {
      name: "Kampot Riverside",
      description: "Easy walks, calm cafes, and a slow evening vibe.",
      why: "Perfect base for a 2D1N loop with secure parking + food options.",
      tags: ["nature", "food"],
      mapUrl: "https://www.google.com/maps/search/Kampot+Riverside", /// search for kampot seahourse statue map
      image: "/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967717-w.jpg",
    },
    {
      name: "អាហារដ្ឋាន ខ្សែរ៉កដឹងព្រែក (Snam Brampi)",
      description: "Local Khmer restaurant near Kampot — perfect lunch stop after the morning ride from Phnom Penh.",
      why: "Great Khmer food to refuel before checking in. A proper sit-down meal beats roadside snacks.",
      tags: ["food"],
      mapUrl: "https://www.google.com/maps?q=%E1%9E%A2%E1%9E%B6%E1%9E%A0%E1%9E%B6%E1%9E%9A%E1%9E%8A%E1%9F%92%E1%9E%8B%E1%9E%B6%E1%9E%93+%E1%9E%81%E1%9F%92%E1%9E%9F%E1%9F%82%E1%9E%9A%E1%9F%89%E1%9E%80%E1%9E%8A%E1%9E%84%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%82%E1%9E%80,+Snam+Brampi&ftid=0x310849004d999035:0xb817fe409144af36&entry=gps&g_st=it",
      image: "/trip-images/kampot/image.png", // change image to kampot/image.jpg
    },
    {
      name: "Coconut Beach",
      description: "A laid-back beach with coconut palms, clear water, and a chill afternoon vibe.",
      why: "The perfect afternoon cooldown after checking in — swim, drink, and unwind before sunset.",
      tags: ["coast", "nature"],
      mapUrl: "https://www.google.com/maps?q=G5RM+C22+Coconut+Beach,+Unnamed+Road,+Kampot&ftid=0x3108318cdd38f0ff:0x160ce2eaa76d4b46&entry=gps&shh=CAE&lucs=,94297699,100795625,94284508,94231188,94280568,47071704,94218641,94282134,94286869&g_ep=CAISEjI2LjEyLjIuODg0NjExMjE2MBgAIIgnKlIsOTQyOTc2OTksMTAwNzk1NjI1LDk0Mjg0NTA4LDk0MjMxMTg4LDk0MjgwNTY4LDQ3MDcxNzA0LDk0MjE4NjQxLDk0MjgyMTM0LDk0Mjg2ODY5QgJLSA%3D%3D&skid=66e43861-4d52-4e60-b7aa-08af0d4b29ee&g_st=it",
      image: "/trip-images/kampot/coconut_beach.png",
    },
    {
      name: "Suggested place (Map pin 1)",
      description: "Saved location from your plan—tap to open the pin.",
      why: "Easy to navigate to with Google Maps during the ride.",
      tags: ["scenic"],
      mapUrl: "https://maps.app.goo.gl/aQZrvaCeeMSJ3z6T7?g_st=it",
      image: "/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967722-w.jpg",
    },
    {
      name: "Suggested place (Map pin 2)",
      description: "Saved location from your plan—tap to open the pin.",
      why: "Great as a flexible stop depending on time and weather.",
      tags: ["nature"],
      mapUrl: "https://maps.app.goo.gl/12CcqV4FjhbwY6Aw7?g_st=it",
      image: "/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967708-w.jpg",
    },
    {
      name: "Salt Fields (Kampot area)",
      description: "Wide open scenery with a peaceful, minimal landscape.",
      why: "Quick detour for photos without adding heavy riding time.",
      tags: ["scenic"],
      mapUrl: "https://www.google.com/maps/search/Kampot+Salt+Fields",
      image: "/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967709-w.jpg",
    },
    {
      name: "Pepper Farm Area",
      description: "Countryside roads, shade, and the signature Kampot story.",
      why: "High ‘wow per minute’ and a great midday break before Bokor.",
      tags: ["scenic", "food"],
      mapUrl: "https://www.google.com/maps/search/Kampot+Pepper+Farm",
      image: "/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967718-w copy.jpg",
    },
    {
      name: "Tmor Muk Yeak Cafe",
      description: "A quiet reservoir with breezy viewpoints nearby.",
      why: "A calm stop when you want scenery without crowds.",
      tags: ["nature", "scenic"],
      mapUrl: "https://www.google.com/maps/search/Secret+Lake+Brateak+Krola+Kampot",
      image: "/trip-images/bokor/telegram-cloud-photo-size-5-6221994916015967693-w.jpg",
    },
    {
      name: "Lok Yeay Mao Shrine",
      description: "Winding climb, cooler air, and sweeping cloud views.",
      why: "The most scenic riding segment in the region—ride smooth and early.",
      tags: ["nature", "scenic"],
      mapUrl: "https://www.google.com/maps/search/Bokor+Mountain+Viewpoint+Kampot",
      image: "/trip-images/bokor/telegram-cloud-photo-size-5-6221994916015967696-w.jpg",
    },
    {
      name: "Old Church / Historic Ruins (Bokor area)",
      description: "Iconic spiritual stop on Bokor with big viewpoints.",
      why: "A must-stop landmark and a good rest point mid-climb.",
      tags: ["scenic"],
      mapUrl: "https://www.google.com/maps/search/Lok+Yeay+Mao+Bokor",
      image: "/trip-images/bokor/telegram-cloud-photo-size-5-6221994916015967714-w.jpg",
    },
    {
      name: "Bokor Hill Station Old Church",
      description: "Moody architecture with foggy, cinematic atmosphere.",
      why: "Short stop, high vibe—especially in misty weather.",
      tags: ["scenic"],
      mapUrl: "https://www.google.com/maps/search/Bokor+Hill+Station+Old+Church",
      image: "/trip-images/bokor/telegram-cloud-photo-size-5-6221994916015967715-w.jpg",
    },
    {
      name: "Kep West Cafe",
      description: "Seafood energy, quick bites, and coastal air.",
      why: "Best in the morning or early lunch before it gets crowded.",
      tags: ["food", "coast"],
      mapUrl: "https://www.google.com/maps/search/Kep+Crab+Market",
      image: "/trip-images/kep/telegram-cloud-photo-size-5-6221994916015967719-w.jpg",
    },
    {
      name: "Kep Beach",
      description: "Shaded loops with viewpoints over the coastline.",
      why: "Good leg-stretch before the long return ride.",
      tags: ["nature", "scenic"],
      mapUrl: "https://www.google.com/maps/search/Kep+National+Park",
      image: "/trip-images/kep/telegram-cloud-photo-size-5-6221994916015967721-w.jpg",
    },
    {
      name: "Quiet Beach Stop (choose a calm spot)",
      description: "A low-crowd beach moment—swim, coffee, breathe.",
      why: "Balances the ride with true coastal relaxation.",
      tags: ["coast", "nature"],
      mapUrl: "https://www.google.com/maps/search/Kep+Beach",
      image: "/trip-images/kep/telegram-cloud-photo-size-5-6221994916015967723-w.jpg",
    },
  ],
  alternatives: {
    south: [
      {
        name: "Early roadside coffee stop",
        detour: "+10–15 min",
        bestFor: "energy",
        note:
          "Grab coffee + water early so you don’t push tired on the highway.",
      },
      {
        name: "Quick viewpoint pull-off (safe shoulder only)",
        detour: "+10 min",
        bestFor: "photos",
        note:
          "Stop only where visibility is clear and the shoulder is wide.",
      },
    ],
    kampot: [
      {
        name: "Secret Lake loop",
        detour: "+45–70 min",
        bestFor: "scenery",
        note:
          "Great if you skip one Bokor stop or arrive early in Kampot.",
      },
      {
        name: "Salt fields at golden hour",
        detour: "+30–45 min",
        bestFor: "sunset",
        note:
          "Ideal if Day 1 ends early and you still want a scenic ride.",
      },
    ],
    kep: [
      {
        name: "Short park trail + viewpoint",
        detour: "+45–60 min",
        bestFor: "nature",
        note:
          "Pick a short shaded loop—save your legs for the return ride.",
      },
      {
        name: "Extra beach hop (only if roads are dry)",
        detour: "+30–60 min",
        bestFor: "coast",
        note:
          "If it’s wet or you’re late, skip—sand + rain isn’t worth it.",
      },
    ],
    return: [
      {
        name: "One long break instead of many tiny stops",
        detour: "+20–30 min",
        bestFor: "comfort",
        note:
          "A proper rest reduces fatigue more than repeated 2-minute breaks.",
      },
      {
        name: "Early return for daylight buffer",
        detour: "0 min",
        bestFor: "safety",
        note:
          "The best ‘hack’ is timing—arrive before dusk and you’ll feel fresh.",
      },
    ],
  },
  variations: [
    {
      title: "Relaxed version",
      tone: "More beach + riverside, less mountain intensity.",
      bullets: [
        "Day 1: Skip the full Bokor loop—do salt fields + riverside sunset instead",
        "Day 2: Longer Kep beach time; return earlier to avoid afternoon heat",
        "Best for: chill riders, first timers, or uncertain weather",
      ],
      icon: "coffee",
    },
    {
      title: "Adventure version",
      tone: "More riding + viewpoints, tighter timing and earlier starts.",
      bullets: [
        "Day 1: Earlier departure, full Bokor scenic loop with extra viewpoint stops",
        "Day 2: Sunrise ride + short trail in Kep area, then return with strict break plan",
        "Best for: confident riders who enjoy mountain corners and long days",
      ],
      icon: "mountain",
    },
  ],
};

function formatKm(km: number) {
  return `~${Math.round(km)} km`;
}

function formatRideHours(mins: number) {
  const hours = mins / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `~${rounded} hrs riding`;
}

function sumLegs(legIds: string[]) {
  const legs = trip.legs.filter((l) => legIds.includes(l.id));
  const km = legs.reduce((acc, l) => acc + l.km, 0);
  const mins = legs.reduce((acc, l) => acc + l.mins, 0);
  return { km, mins, legs };
}

function iconForItem(icon: ItineraryItem["icon"]) {
  switch (icon) {
    case "sunrise":
      return Sun;
    case "route":
      return Route;
    case "coffee":
      return CloudSun;
    case "mountain":
      return Mountain;
    case "hotel":
      return MapPin;
    case "moon":
      return Moon;
    case "fish":
      return Waves;
    case "waves":
      return Waves;
    case "trees":
      return Trees;
  }
}

function tagVariant(tag: string) {
  switch (tag) {
    case "coast":
    case "nature":
    case "scenic":
    case "food":
      return "secondary" as const;
    default:
      return "default" as const;
  }
}

type TripImagesManifest = Record<string, string[]>;

export default function KpTripPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  const baseLegIds = React.useMemo(
    () => ["pp_to_kampot", "kampot_to_bokor", "bokor_to_kampot", "kampot_to_kep", "kep_to_pp"],
    []
  );
  const optionalLegIds = React.useMemo(
    () => ["kampot_to_saltfields", "saltfields_to_pepper"],
    []
  );

  const base = React.useMemo(() => sumLegs(baseLegIds), [baseLegIds]);
  const optional = React.useMemo(
    () => sumLegs(optionalLegIds),
    [optionalLegIds]
  );

  const heroDistance = React.useMemo(() => {
    const baseText = formatKm(base.km);
    const optionalText =
      optional.km > 0 ? ` (+${Math.round(optional.km)} km optional)` : "";
    return `${baseText}${optionalText}`;
  }, [base.km, optional.km]);

  const highlights = React.useMemo(() => {
    const highlightCandidates = trip.places
      .filter((p) => p.tags.includes("scenic") || p.tags.includes("coast"))
      .slice(0, 3)
      .map((p) => p.name);

    return [
      ...new Set([
        "Bokor Mountain viewpoints",
        "Kampot riverside",
        ...highlightCandidates,
      ]),
    ].slice(0, 4);
  }, []);

  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/trip-images/manifest.json");
        const json = (await res.json()) as TripImagesManifest;
        const all = Object.values(json).flat().map((p) => `/${p}`);
        if (!cancelled) setGalleryImages(all);
      } catch {
        if (!cancelled) setGalleryImages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#top" className="flex items-center gap-2 font-semibold">
            <Compass className="h-5 w-5 text-primary" />
            <span>RideSouth</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {[
              ["Overview", "#overview"],
              ["Itinerary", "#itinerary"],
              ["Places", "#places"],
              ["Alternatives", "#alternatives"],
              ["Variations", "#variations"],
              ["Tips", "#tips"],
              ["Gallery", "#gallery"],
              ["Route", "#route"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {mounted ? (isDark ? <Sun /> : <Moon />) : <Sun />}
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <a href="#itinerary">Explore Trip Plan</a>
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative">
          <div className="absolute inset-0">
            <img
              src="/trip-images/kampot/telegram-cloud-photo-size-5-6221994916015967709-w.jpg"
              alt="Kampot sunset over water"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
            <div className="w-full max-w-4xl rounded-3xl border border-white/15 bg-black/25 px-6 py-10 backdrop-blur-lg sm:px-12 sm:py-14 md:px-16">
              <Badge className="mb-5 border-white/30 bg-white/15 text-white">
                Cambodia South Coast Loop
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {trip.meta.title}
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-base text-white/80 sm:text-lg">
                {trip.meta.subtitle}
              </p>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                <Button asChild size="lg" className="bg-white text-black shadow-lg hover:bg-white/90">
                  <a href="#itinerary">Explore Trip Plan</a>
                </Button>
                <Button asChild size="lg" className="border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20">
                  <a href="#route">See Route Insights</a>
                </Button>
              </div>

              <div className="mx-auto mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <Route className="h-4 w-4 text-white/50" />
                    {heroDistance}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/50" />
                    {formatRideHours(base.mins)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-white/50" />
                    {trip.meta.bestTime}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-white/50" />
                    {trip.meta.dates}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/50">
                  Built like a rider's plan: early starts, smart breaks,
                  scenic detours, and no risky night riding.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
            <TriangleAlert className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Draft plan</span> — This itinerary is a work in progress and may change at any time. Last updated for{" "}
              <span className="font-semibold">{trip.meta.dates}</span>.
            </p>
          </div>
        </div>

        <section id="overview" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-tight">
                Smart Trip Overview
              </h2>
              <p className="mt-2 text-muted-foreground">
                Quick facts + rider logic to keep the loop realistic.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 w-fit rounded-2xl bg-primary/10 p-2 text-primary">
                    <CalendarDays />
                  </div>
                  <CardDescription>Duration</CardDescription>
                  <CardTitle>2 Days 1 Night</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  One overnight base: Kampot riverside.
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 w-fit rounded-2xl bg-primary/10 p-2 text-primary">
                    <Route />
                  </div>
                  <CardDescription>Estimated Distance</CardDescription>
                  <CardTitle>{heroDistance}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Includes Bokor loop + Kep coast.
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 w-fit rounded-2xl bg-primary/10 p-2 text-primary">
                    <Bike />
                  </div>
                  <CardDescription>Ride Difficulty</CardDescription>
                  <CardTitle>Moderate</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Mostly paved; mountain weather changes.
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 w-fit rounded-2xl bg-primary/10 p-2 text-primary">
                    <ShieldCheck />
                  </div>
                  <CardDescription>Key Highlights</CardDescription>
                  <CardTitle>Top picks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {highlights.map((t) => (
                      <li
                        key={t}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Rider pacing rules</CardTitle>
                      <CardDescription className="mt-1">
                        The plan prioritizes comfort, safety, and scenery.
                      </CardDescription>
                    </div>
                    <div className="hidden rounded-2xl bg-muted p-2 sm:block">
                      <ShieldCheck className="text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Timer,
                      title: "Break rhythm",
                      text: "Stop every 60–90 minutes: stretch, hydrate, quick bike check.",
                    },
                    {
                      icon: Sun,
                      title: "Daylight only",
                      text: "Plan the return so you reach Phnom Penh before dusk.",
                    },
                    {
                      icon: Fuel,
                      title: "Fuel buffer",
                      text: "Top up in Kampot before Bokor. Avoid riding the gauge low.",
                    },
                    {
                      icon: CloudRain,
                      title: "Bokor weather",
                      text: "Expect fog/rain + cooler temps. Pack a light warm layer.",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <Card key={title} className="shadow-none">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="h-4 w-4 text-primary" />
                          {title}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best time to go</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="font-medium text-foreground">Nov–Apr</span>{" "}
                    for dryer roads, clearer Bokor views, and fewer rain
                    interruptions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-muted p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <TriangleAlert className="h-4 w-4 text-primary" />
                      Quick caution
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If the road is wet on Bokor, ride smoother: slower
                      entries, gentler braking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="itinerary"
          className="border-y border-border bg-background px-4 py-20"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Detailed Itinerary
              </h2>
              <p className="mt-2 text-muted-foreground">
                Realistic pacing, smart stops, and scenic flow—without
                backtracking.
              </p>
            </div>

            <div className="space-y-10">
              {([
                ["Day 1 — The Descent to Kampot", trip.itinerary.day1],
                ["Day 2 — Coastal Cruising", trip.itinerary.day2],
              ] as const).map(([title, day]) => (
                <div key={title}>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {day.summary}
                  </p>
                  <div className="mt-6 space-y-4">
                    {day.items.map((item) => {
                      const Icon = iconForItem(item.icon);
                      const legs =
                        item.legs.length > 0 ? sumLegs(item.legs) : null;
                      return (
                        <Card
                          key={item.title + item.time}
                          className="transition-colors hover:border-primary/40"
                        >
                          <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-2 text-primary">
                                  <Icon className="h-5 w-5" />
                                  <span className="font-semibold text-foreground">
                                    {item.title}
                                  </span>
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {item.time}
                                </span>
                              </div>

                              {legs ? (
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <Badge variant="primary">
                                    {Math.round(legs.km)} km
                                  </Badge>
                                  <Badge>
                                    ~{Math.round(legs.mins / 5) * 5} min
                                  </Badge>
                                </div>
                              ) : null}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-muted-foreground">
                              {item.bullets.map((b) => (
                                <li key={b}>{b}</li>
                              ))}
                            </ul>
                            {item.icon === "hotel" ? (
                              <div className="mt-4">
                                <Button asChild variant="outline" size="sm">
                                  <a
                                    href={trip.meta.hotel.mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <MapPin />
                                    Open hotel in Maps
                                  </a>
                                </Button>
                              </div>
                            ) : null}
                            {item.roadNote ? (
                              <div className="mt-4 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                  Road note:
                                </span>{" "}
                                {item.roadNote}
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Card className="mt-10">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <MapIcon />
                  </div>
                  <div>
                    <CardTitle>Estimated travel times (key legs)</CardTitle>
                    <CardDescription className="mt-1">
                      Practical rider estimates; add buffer for photo stops,
                      rain, and traffic leaving Phnom Penh.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {trip.legs
                  .filter((l) =>
                    ["pp_to_kampot", "kampot_to_bokor", "kampot_to_kep", "kep_to_pp"].includes(
                      l.id
                    )
                  )
                  .map((leg) => {
                    const hrs = Math.round((leg.mins / 60) * 10) / 10;
                    const roads = (leg.roads || []).join(" • ");
                    return (
                      <div
                        key={leg.id}
                        className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold">
                              {leg.from} → {leg.to}
                            </div>
                            <Badge>{leg.km} km</Badge>
                            <Badge>~{hrs} hr</Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {roads}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {leg.note}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="places" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Suggested Places (Auto-Expanded)
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Main stops + hidden gems that fit a 2D1N route.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {["coast", "nature", "scenic"].map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trip.places.map((p) => (
                <Card
                  key={p.name}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  {p.image && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t) => (
                          <Badge key={t} className="border-white/20 bg-black/50 text-xs text-white backdrop-blur-sm">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Why visit:
                      </span>{" "}
                      {p.why}
                    </div>
                    {p.mapUrl && (
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={p.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MapPin className="h-4 w-4" />
                            Open in Google Maps
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="alternatives"
          className="border-y border-border bg-background px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-tight">
                Suggested Alternative Stops
              </h2>
              <p className="mt-2 text-muted-foreground">
                Swap-in stops based on mood, weather, or time—without breaking
                the route flow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {(
                [
                  ["On the way south", "south"],
                  ["Around Kampot", "kampot"],
                  ["Around Kep", "kep"],
                  ["On the way back", "return"],
                ] as const
              ).map(([title, key]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="mt-1">
                      {key === "south"
                        ? "Easy add-ons to make NR3 feel less like a straight push."
                        : key === "kampot"
                          ? "Scenic detours with high “wow per minute”."
                          : key === "kep"
                            ? "Coastline, seafood, and a quiet viewpoint option."
                            : "Keep it smooth: quick breaks, safe daylight arrival."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trip.alternatives[key].map((item) => (
                      <div
                        key={item.name}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold">{item.name}</div>
                          <div className="flex gap-2">
                            <Badge>{item.detour}</Badge>
                            <Badge variant="primary">{item.bestFor}</Badge>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="variations" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-tight">
                Trip Variations
              </h2>
              <p className="mt-2 text-muted-foreground">
                Choose your pace: more chill time or more riding adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {trip.variations.map((v) => (
                <Card key={v.title} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        {v.icon === "coffee" ? <CloudSun /> : <Mountain />}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{v.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {v.tone}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {v.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="tips"
          className="border-y border-border bg-background px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Travel Tips (Expert-Level)
              </h2>
              <p className="mt-2 text-muted-foreground">
                Small habits that make the ride safer, smoother, and more fun.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: BackpackIcon,
                  title: "What to bring",
                  bullets: [
                    "Helmet + eye protection (dust + bugs)",
                    "Rain layer + light warm layer (Bokor)",
                    "Power bank + offline map download",
                    "Cash + small change (fuel/snacks)",
                  ],
                },
                {
                  icon: ShieldAlert,
                  title: "Road safety",
                  bullets: [
                    "Leave Phnom Penh early to avoid aggressive traffic",
                    "Watch for trucks, sand, dogs, and random U-turns",
                    "Avoid night riding—visibility drops fast",
                    "If rain starts, ride smoother (no sharp braking)",
                  ],
                },
                {
                  icon: Fuel,
                  title: "Fuel + bike strategy",
                  bullets: [
                    "Check tires + brakes before leaving (cold check)",
                    "Fill up in Kampot before Bokor (buffer matters)",
                    "Keep chain lubed if you’ll hit wet roads",
                    "Hydrate often—fatigue is the real risk",
                  ],
                },
              ].map(({ icon: Icon, title, bullets }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="mb-2 w-fit rounded-2xl bg-primary/10 p-2 text-primary">
                      <Icon />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Gallery</h2>
              <p className="mt-2 text-muted-foreground">
                A travel vibe: roads, coast, mountain air, and coffee stops.
              </p>
            </div>

            <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
              {(galleryImages.length ? galleryImages : []).map((src) => (
                <figure
                  key={src}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border shadow-sm"
                >
                  <img
                    src={src}
                    alt="Trip photo"
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </figure>
              ))}
              {galleryImages.length === 0 ? (
                <Card className="mb-4 break-inside-avoid">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    Gallery images will appear here (loaded from{" "}
                    <span className="font-mono">/trip-images/manifest.json</span>
                    ).
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="route"
          className="border-t border-border bg-background px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-tight">
                Route Insight
              </h2>
              <p className="mt-2 text-muted-foreground">
                How the loop flows, what roads feel like, and where to slow
                down.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Flow</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-medium text-foreground">
                      Phnom Penh → Kampot → Bokor loop → Kep coast → return
                    </span>
                    . You’ll base overnight in Kampot to keep Day 2 flexible:
                    beach, seafood, short hike, then a daylight return.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Route,
                      title: "Main roads",
                      text: "Faster stretches are where you maintain steady, predictable riding and save time.",
                    },
                    {
                      icon: Mountain,
                      title: "Scenic segments",
                      text: "Bokor climb + coast detours: slower pace, more stops, better photos.",
                    },
                    {
                      icon: TriangleAlert,
                      title: "Where to slow down",
                      text: "Village entries, intersections, wet corners on Bokor, and anywhere you see sand/gravel.",
                    },
                    {
                      icon: Camera,
                      title: "Photo strategy",
                      text: "Take quick photo stops during daylight; avoid stopping on blind curves.",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-primary" />
                        {title}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your decision points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {[
                    {
                      title: "Traffic leaving PP",
                      text: "If it’s heavy, keep it simple: direct ride to Kampot, then do scenic stops later.",
                    },
                    {
                      title: "Bokor weather",
                      text: "If fog/rain rolls in, shorten the summit loop and prioritize safe visibility.",
                    },
                    {
                      title: "Return timing",
                      text: "Keep a buffer so you arrive before dusk—comfort beats rushing.",
                    },
                  ].map((d) => (
                    <div
                      key={d.title}
                      className="rounded-2xl border border-border bg-muted p-4"
                    >
                      <div className="font-semibold text-foreground">
                        {d.title}
                      </div>
                      <p className="mt-1">{d.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background px-4 py-12 text-center">
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          <div className="mb-4 flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">
              RideSouth
            </span>
          </div>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Built for riders and explorers — coastal air, mountain fog, and
            small roadside coffees.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RideSouth. Ride safe.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BackpackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
      <path d="M6 19h12" />
      <path d="M8 11h8" />
      <path d="M9 5h6" />
    </svg>
  );
}
