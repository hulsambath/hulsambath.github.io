# Portfolio — Achievements in this Workspace

_Compiled 2026-06-10 for Sambath HUL (hulsambath14@gmail.com), Phnom Penh, Cambodia._

## Snapshot

| Metric | Value |
|---|---|
| Production apps built/maintained | **8** (+ 1 shared package) |
| Operator brands you shipped to stores | **2** — iBus, BS Bus Cambodia |
| Total Dart source files | **~2,100+** |
| Platform targets covered | Android, iOS, Web, macOS, Windows, Linux (6 OS) |
| Your tracked commits across repos | **~431+** |
| Experience span | **3 Years (2023 – 2026)** |

Primary domain: **mobile transportation, ticketing & booking platforms** (Flutter),
plus a **live TV-show voting / vendor app** and **developer tooling**.

---

## 1. BookMeBus — Consumer Travel Super-App
`bookmebus-flutter/` · Flutter · v9.3.8

The flagship consumer-facing travel booking app for the BookMeBus platform.

- **Scale:** 622 Dart files · 81 dependencies · **80 screen modules**
- **Platforms:** Android, iOS, Web
- **Booking verticals:** bus, ferry, hotel, airport transfer, private taxi
  (includes the **`bxpress`** sub-brand with its own networking/provider stack)
- **Notable features:** ABA payment integration, live chat & customer service,
  coupon/promo codes, multi-language, push notifications, booking history &
  transaction history, account deletion / privacy compliance flows
- **Your role:** feature work & maintenance (12 commits, May 2026)

## 2. Operator App — White-Label B2B Platform
`operator-app-flutter/` · Flutter (migrated from React Native 0.61)

A single Flutter codebase with a flavor-based build system that targets multiple
branded operator apps (bus & ferry themes). The repo contains entrypoints for 10
brands, but **the two you personally built and released to production are:**

- **iBus** — own configs, signing key, asset set, Android source set, and a run
  of dedicated feature branches (search-trip UI, departure-date scrolling, app
  adjustments)
- **BS Bus Cambodia** — the `bstransport` flavor (`appName: 'BS Bus Cambodia'`)

Details:

- **Scale:** 560 Dart files · 51 dependencies · 21 screen modules
- **Platforms:** Android, iOS
- **Engineering highlight:** flavor-based build system + per-brand theming;
  contributed to the **React Native → Flutter migration**
- **Your role:** 61 commits (Nov 2025 – Jun 2026)

## 3. Hang Meas (CM Vendor App) — Live Voting & Vendor App
`cm-market-vendor-app/hang_meas/` · Flutter · v1.0.13

Multi-tenant vendor app; the live tenant is **Hang Meas**, a TV-show voting &
event-ticketing app (largest codebase in the workspace).

- **Scale:** 564 Dart files · 85 dependencies — **the biggest app**
- **Platforms:** Android, iOS, Web, macOS, Windows, Linux (**6 targets**)
- **Notable features:** YouTube **live-stream** integration with viewer count,
  **interactive vote tap-counter**, event & show details, ticketing, top-up
  vote / in-app purchase, social login, maps
- **Architecture:** multi-tenant monorepo, MVVM + ServiceLocator + Repository,
  full i18n, code-gen pipeline, style-guide enforced via Claude hooks
- **Your role:** **primary author/maintainer — 358 commits** (Oct 2024 – Jun 2026)

## 4. Oudong Express — Second Tenant on Shared Core
`cm-market-vendor-app/oudong_express/`

A second tenant proving out the multi-tenant architecture, sharing the common
`core` package with dedicated prod/staging flavors and Firebase configs.
Includes documented **performance-optimization** work
(`OUDONG_EXPRESS_PERFORMANCE_IMPROVEMENTS.md`).

### Shared `core` package
`cm-market-vendor-app/packages/core/` — 360 Dart files of reusable
HTTP clients, models, services and extensions powering every tenant.

## 5. VisionCareAI Detect & Consult — Full-Stack AI Healthcare Platform
`VisionCareAI-Detect-Consult/` · Flutter + Laravel + Python TFLite

An end-to-end ophthalmic disease detection, doctor consultation, and appointment booking system.

- **Stack:** Flutter 3.38+ (Dart 3.10+), Laravel 11.22+ (PHP 8.3+), Python 3.13 Flask ML microservice, TensorFlow Lite
- **Dual-Model Vision Pipeline:**
  - `Eye_or_noteye.tflite`: Binary classification to filter non-eye images with automated retake UX
  - `DenseNet.tflite`: 5-class disease classification (Diabetic Retinopathy, Glaucoma, Cataract, AMD, Normal)
  - Preprocessing: OpenCV CLAHE (Contrast Limited Adaptive Histogram Equalization) on LAB color space
- **Hybrid Edge + Cloud Inference:** `OnDeviceAiService` queries online Flask endpoints when connected and falls back seamlessly to on-device TFLite models for 100% offline edge diagnostic resilience
- **Backend Architecture:** Layered Service-Repository pattern, Sanctum token authentication, 18 database migrations, standardized JSON `ApiResponse` trait, and Cambodian healthcare seeders (`CambodianDataSeeder`)
- **Mobile UX & Tooling:** Cupertino-first design system with Khmer/English i18n, zero-overflow typography, dynamic local network host discovery (`AppConfig`), and unified service management CLI (`manage_backend_ml.sh`)

## 6. CAO Farm Book — Agricultural Management & Tracking
`cammob/cao-farm-book` · Flutter + REST API · CamMob

Digital record-keeping and agricultural tracking mobile application designed for farmers and agricultural managers.

- **Stack:** Flutter, Dart, RESTful APIs, Local Caching & Sync
- **Key Features:** Crop cycle logging, financial & yield accounting, field activity scheduling, and offline-first mobile operations for rural connectivity environments
- **Impact:** Shipped to Google Play Store and Apple App Store, digitizing traditional paper-based farm management

## 7. Trovara — Travel Discovery & Trip Planning
`trovara-app` · Flutter + Firebase · Personal Project

Modern travel exploration and personalized itinerary planning mobile application.

- **Stack:** Flutter, Firebase Auth, Firestore, Google Maps API, Material 3
- **Key Features:** Interactive trip planners, destination curation, interactive maps, bookmarking, and collaborative itinerary sharing

## 8. Netflix Clone — Streaming UI Architecture & Media Catalog
`netflex_api/` · Flutter + TMDB REST API · Personal Project

High-fidelity entertainment streaming application recreating the Netflix mobile experience.

- **Stack:** Flutter, Dart, TMDB REST API, Video Player, Shimmer Loading
- **Key Features:** Dynamic category carousels, responsive video player integration, multi-genre filtering, fast search with debounce, and custom theme matching Netflix design specifications

---

## Developer Tooling & Infrastructure

- **`mcp-http-bridge/`** — Node.js MCP (Model Context Protocol) HTTP bridge server
  (Dockerized) for AI-assisted development tooling.
- **`copy-file-reference/`** — a published **VS Code extension** (`.vsix`) for
  copying file references.
- **AI-assisted workflow:** custom Claude Code skills, hooks, and style-guide
  automation across the monorepos (MVVM, Repository pattern, i18n, tests).

---

## Engineering Themes (for resume bullets)

- Architected and maintained **multi-tenant / white-label Flutter platforms**;
  on the operator platform, built and **released 2 branded apps (iBus & BS Bus
  Cambodia)** from a shared flavor-based codebase.
- Engineered **hybrid Edge + Cloud AI mobile architectures** with offline on-device
  TFLite fallback and dual-stage computer vision pipelines for healthcare diagnostics.
- Built production-ready **Laravel 11 RESTful APIs** with Sanctum authentication,
  layered service architecture, and automated database migrations.
- Contributed to the **React Native → Flutter migration** of a production B2B
  operator app.
- Built **real-time features**: YouTube live streaming, live viewer counts, and
  an interactive voting tap-counter for a national TV show.
- Delivered **cross-platform** apps spanning up to **6 OS targets** from one
  Flutter codebase.
- Integrated **payments (ABA), in-app purchases, social login, push
  notifications, and privacy-compliance** flows.
- Sole/primary author and maintainer with **358 commits** over ~20 months.

