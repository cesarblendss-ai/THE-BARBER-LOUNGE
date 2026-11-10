# Graph Report - workspace  (2026-11-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1461 nodes · 3679 edges · 64 communities (60 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0868733e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61

## God Nodes (most connected - your core abstractions)
1. `next` - 88 edges
2. `SITE` - 42 edges
3. `react` - 36 edges
4. `SectionLabel()` - 33 edges
5. `ruleBasedBookingReply()` - 32 edges
6. `isDatabaseConfigured()` - 28 edges
7. `EditableText()` - 27 edges
8. `normalizeBarberKey()` - 25 edges
9. `verifyAdminKey()` - 25 edges
10. `Button()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `run()` --indirect_call--> `checkAvailability()`  [INFERRED]
  scripts/test-booking-fallback.ts → src/lib/appointments-store.ts
- `flowStep()` --indirect_call--> `checkAvailability()`  [INFERRED]
  scripts/test-booking-fallback.ts → src/lib/appointments-store.ts
- `step()` --indirect_call--> `checkAvailability()`  [INFERRED]
  scripts/test-booking-fallback.ts → src/lib/appointments-store.ts
- `main()` --calls--> `refreshAvailabilitySnapshot()`  [EXTRACTED]
  scripts/smoke-booksy-sync.ts → src/lib/availability-sync.ts
- `POST()` --indirect_call--> `checkAvailability()`  [INFERRED]
  src/app/api/booking-chat/route.ts → src/lib/appointments-store.ts

## Import Cycles
- None detected.

## Communities (64 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (75): stripe@^22.5.0, stripe, main(), dynamic, POST(), RouteContext, runtime, dynamic (+67 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (43): react, fraunces, inter, metadata, RootLayout(), viewport, AnalyticsTracker(), onClick() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (52): @prisma/client@^6.19.3, @prisma/client, POST(), runtime, GET(), PATCH(), checkAnalyticsRateLimit(), closePageView() (+44 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (43): @vercel/analytics@^2.0.1, @vercel/analytics, BookingChatbot(), BookingFab(), ChatBubbleIcon(), ChipButton(), ChipGroup(), DayOption (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (44): GET(), POST(), runtime, GET(), isAuthorized(), POST(), runtime, POST() (+36 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (46): dependencies, next@^15.1.0, react@^19.0.0, react-dom@^19.0.0, devDependencies, eslint@^9.17.0, eslint-config-next@^15.1.0, postcss@^8.4.49 (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (23): apply_source_crop(), defringe_rgba(), force_remove_source_wall(), get_session(), harden_wall_alpha(), is_definite_source_wall(), is_wall_pixel(), keep_largest_foreground() (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (33): AdminEstimatesPage(), dynamic, metadata, PageProps, BlogPage(), metadata, BlogPostPage(), generateMetadata() (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (26): nextConfig, next, AreaLandingPage(), generateMetadata(), generateStaticParams(), Props, BeardStudioPage(), metadata (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (28): format_memory_prompt(), active_llm_provider(), _call_anthropic(), _call_openai(), discover_clients(), extract_blog_topics(), generate_schema(), get_anthropic_client() (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (34): main(), dynamic, GET(), POST(), runtime, withSyncMeta(), getAvailableSlotsForDate(), getUpcomingBookableDays() (+26 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (23): BulkItemStatus, BulkUploadItem, confidenceBadge(), formatBytes(), GalleryBulkUpload(), handleUploadAll(), GalleryBulkUploadProps, validateImageFile() (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (25): AboutPage(), metadata, BarberProfileGrid(), BarberProfileGridProps, BookCtaButtonProps, ContactForm(), handleSubmit(), ContactFormProps (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (26): test(), PATCH(), dbSetBlockedHoursForDate(), dbToggleBlockedSlot(), activeAppointments(), AppointmentsFile, availabilityEngine, blockMatchesBarber() (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.10
Nodes (22): BookPage(), metadata, ANY_BARBER, BOOK_NAV, CalendarIcon(), DayOption, formatSyncedAgo(), MoonIcon() (+14 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (25): formatDisplayTimeWithMinutes(), resolveSlotFromDate(), AvailabilityEngine, createAvailabilityEngine(), checkAvailabilityWithStore(), findAlternatives(), generateSlotsForDate(), isHourWithinBusinessHours() (+17 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (18): _append_jsonl(), append_rank_scan(), append_run(), build_memory_context(), detect_completed_steps(), ensure_memory_dir(), extract_slugs_from_output(), extract_topics_from_output() (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (21): main(), BOOKSY_ANY_STAFFER_ID, BooksyClock, BooksyDaySlots, booksyEndYmd(), booksyTodayYmd(), fetchAllStafferBooksySlots(), FetchBooksySlotsInput (+13 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (24): ALLOWED_EXTENSIONS, getExtension(), POST(), runtime, HERO_VIDEOS, HeroVideoSlot, ensureHeroVideoPlaceholders(), GALLERY_DIR (+16 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (18): ContactPage(), MAPS_QUERY, metadata, metadata, ServicesPage(), CinematicHero(), CinematicHeroProps, HeroVideoItem (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (23): DELETE(), getExtension(), POST(), runtime, ALLOWED_EXTENSIONS, ensureGalleryDir(), GALLERY_DIR, GalleryUploadPreview (+15 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (19): GalleryGridProps, ServiceCard(), ServiceCardProps, CollageImage(), CollageLayout, ServiceImageCollage(), ServiceImageCollageProps, isPrimaryService() (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.26
Nodes (17): build_parser(), c(), cmd_competitor_watch(), cmd_full(), cmd_memory(), cmd_publish_check(), cmd_rank(), cmd_seo() (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (20): isAuthorized(), POST(), runtime, GET(), POST(), runtime, asciiHeader(), booksyHandoffUrlForAppointment() (+12 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (23): buildServiceKeywords(), casualServicePhrase(), designFollowUpReply(), detectIntent(), emptyResponse(), extractDay(), extractGuestCount(), extractName() (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (17): build_markdown(), _build_query(), CityResult, _competitor_label(), _extract_title(), _extract_url(), found_display(), _location_string() (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (19): ALLOWED_INTENTS, dynamic, GET(), isValidEmail(), LeadBody, parseIntent(), POST(), runtime (+11 more)

### Community 27 - "Community 27"
Cohesion: 0.23
Nodes (19): loadEnvLocal(), main(), GET(), runtime, formatOwnerReceiptSms(), formatReceiptSms(), formatServiceLine(), getSmsBody() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (17): DELETE(), GET(), isEditModeEnabled(), GET(), runtime, dynamic, GET(), POST() (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.19
Nodes (21): withGalleryCacheBust(), altFromFilename(), buildRegisteredLookup(), categorizeFilename(), discoverGalleryImages(), discoverImagesByCategory(), filterExistingImages(), GALLERY_DIR (+13 more)

### Community 30 - "Community 30"
Cohesion: 0.19
Nodes (15): AdminHubPage(), metadata, TILES, metadata, ReviewPage(), metadata, ReviewQrPage(), PrintButton() (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (15): FaqPage(), metadata, EditableText(), cancelEditing(), handleBlur(), handleInput(), handleKeyDown(), save() (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.21
Nodes (8): has_flat_bone_bg(), main(), save_original(), main(), run_competitor_watch(), search_competitors(), show_history(), append_competitor_snapshot()

### Community 34 - "Community 34"
Cohesion: 0.26
Nodes (13): main(), main(), BOOKSY_STAFFER, getBooksyBookingUrl(), barberNameFromServiceLabel(), BookingHandoffFields, BooksyHandoffInput, getBooksyHandoffFromBooking() (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (14): BlockedSlot, appointmentMatchesBarber(), barberFromServiceLabel(), expandHourRange(), getAlexisPreset(), isAlexisServiceLabel(), isUnscopedService(), KNOWN_STAFFER_IDS (+6 more)

### Community 36 - "Community 36"
Cohesion: 0.48
Nodes (10): BeardTrimAntiochGroomingContent(), BestBarberAntiochContent(), BestFadesBarbershopAntiochContent(), BlogPostLink(), BookOnlineLink(), PhoneLink(), ServicesLink(), FadeVsTaperHaircutAntiochContent() (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.14
Nodes (8): content, JsonAppointment, JsonStore, JsonProduct, JsonStore, envPath, kept, lines

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (9): AgentBlog, format_report(), _latest_output_with_blogs(), main(), _parse_agent_blog(), _parse_site_blog_posts(), PublishReport, run_publish_check() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.16
Nodes (12): assert(), messages, Msg, run(), flowStep(), step(), engine, isHourWithinBusinessHours (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (13): CalendarSyncAdminPage(), formatAge(), SyncStatus, AdminBusyBlocks(), adminHeaders(), BarberSelection, BusyBlocksProps, DayAppointment (+5 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (12): buildSystemPrompt(), enrichWithAvailability(), OpenAiMessage, parseBookingResponse(), ToolCall, TOOLS, tryOpenAiReply(), formatAlternativesText() (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (8): AdminGalleryPage(), AdminGalleryPageProps, metadata, formatBytes(), GalleryUpload(), GalleryUploadFooter(), GalleryUploadProps, UploadState

### Community 43 - "Community 43"
Cohesion: 0.26
Nodes (11): AvailabilityResult, BookingAgent, BookingAgentConfig, BookingAgentHandleOptions, BookingChatPhase, BookingChatResponse, ChatMessage, CheckAvailabilityFn (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.15
Nodes (7): result, url, candidates, [cmd, ...args], content, fromProcess, result

### Community 45 - "Community 45"
Cohesion: 0.21
Nodes (10): cases, bookingErrorMessage(), normalizePhone(), POST(), RequestBody, runtime, PushNotificationResult, formatPhoneDisplay() (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.26
Nodes (11): GET(), POST(), runtime, classifyGalleryImage(), defaultGalleryClassification(), GalleryClassification, GalleryClassificationConfidence, isGalleryAiEnabled() (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (10): metadata, TestimonialsPage(), StarIcon(), LeaveReviewSection(), LeaveReviewSectionProps, Quote, TestimonialCarousel(), TestimonialCarouselProps (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.31
Nodes (7): component_name(), existing_slugs(), find_latest_output(), main(), parse_blog_md(), scaffold_tsx(), slugify()

### Community 49 - "Community 49"
Cohesion: 0.31
Nodes (8): GET(), RouteParams, runtime, Appointment, getAppointmentByCode(), formatLocalIcs(), generateAppointmentIcs(), pad()

### Community 50 - "Community 50"
Cohesion: 0.28
Nodes (7): AdminLeadsPage(), dynamic, metadata, PageProps, AdminLeads(), AdminLeadsProps, Lead

### Community 51 - "Community 51"
Cohesion: 0.28
Nodes (8): GET(), rebuildAvailability(), runtime, AppointmentStatus, listAppointments(), SetBlockedHoursMode, generateSlotsForDate, SHOP_WIDE_BARBER

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (7): bookingAgent, ChatMessage, GET(), isAiEnabled(), POST(), runtime, createBookingAgent()

### Community 53 - "Community 53"
Cohesion: 0.47
Nodes (8): dbGetAppointmentByCode(), dbInsertAppointment(), dbLoadStore(), dbMigrateStore(), dbUpdateAppointmentStatus(), mapAppointment(), mapBlockedSlot(), requirePrisma()

### Community 54 - "Community 54"
Cohesion: 0.32
Nodes (5): AdminEditPage(), AdminEditPageProps, metadata, AdminEditForm(), AdminEditPageProps

### Community 55 - "Community 55"
Cohesion: 0.57
Nodes (5): dynamic, GET(), isAuthorized(), POST(), runtime

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (5): GET(), runtime, getSmsSetupStatus(), isConfigured(), SmsSetupStatus

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (5): buildCommand, crons, framework, installCommand, $schema

### Community 58 - "Community 58"
Cohesion: 0.50
Nodes (4): AdminHeroPage(), AdminHeroPageProps, metadata, HeroVideoUploadFooter()

### Community 59 - "Community 59"
Cohesion: 0.50
Nodes (4): HeroVideoCell(), HeroVideoGrid(), HeroVideoGridProps, HeroVideoItem

## Knowledge Gaps
- **1 isolated node(s):** `next/core-web-vitals`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 436 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 26`, `Community 27`, `Community 28`, `Community 30`, `Community 31`, `Community 36`, `Community 42`, `Community 45`, `Community 46`, `Community 47`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 54`, `Community 55`, `Community 56`, `Community 58`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05231724796942188 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 36`, `Community 7`, `Community 40`, `Community 42`, `Community 11`, `Community 12`, `Community 14`, `Community 47`, `Community 50`, `Community 19`, `Community 54`, `Community 59`, `Community 31`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05257936507936508 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06994535519125683 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.056866303690260134 - nodes in this community are weakly interconnected._