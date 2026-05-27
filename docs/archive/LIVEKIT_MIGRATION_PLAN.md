# LiveKit Components-JS → Svelte 5 Migration Plan

> **Archived 2026-05-27.** Port is complete under `src/lib/livekit/`. App integration uses `createLiveSession()` + prefabs. See `docs/LIVEKIT_DELETION_CANDIDATES.md` for remaining cleanup.

## Objective
Migrate the entire `@livekit/components-react` library (from `reference/livekit-components-js/`) into a generic, reusable Svelte 5 component library inside this repo. The result must match or exceed the reference implementation in capability, while integrating seamlessly with our design tokens, RTL layout, and SvelteKit architecture.

## Architecture Decision
Create **`src/lib/livekit/`** as a standalone module (generic component library). Keep existing `src/lib/features/live/` as the app-specific integration layer. This avoids breaking existing Pilates room logic while giving us a drop-in Meet-style prefab.

```
src/lib/livekit/
├── index.ts                    # Public API exports
├── types.ts                    # Shared types
├── contexts/                   # Svelte context providers
│   ├── layout-context.svelte.ts
│   ├── participant-context.svelte.ts
│   ├── track-ref-context.svelte.ts
│   ├── room-context.svelte.ts
│   ├── chat-context.svelte.ts
│   └── pin-context.svelte.ts
├── hooks/                      # Svelte 5 runes-based hooks
│   ├── useTracks.svelte.ts
│   ├── usePinnedTracks.svelte.ts
│   ├── useGridLayout.svelte.ts
│   ├── usePagination.svelte.ts
│   ├── useVisualStableUpdate.svelte.ts
│   ├── useSwipe.svelte.ts
│   ├── useParticipantTile.svelte.ts
│   ├── useChat.svelte.ts
│   ├── useLocalParticipantPermissions.svelte.ts
│   ├── usePersistentUserChoices.svelte.ts
│   ├── useIsEncrypted.svelte.ts
│   ├── useMultibandTrackVolume.svelte.ts
│   ├── useBarAnimator.svelte.ts
│   ├── useConnectionStatus.svelte.ts
│   ├── useParticipants.svelte.ts
│   ├── useLocalParticipant.svelte.ts
│   ├── useRoomInfo.svelte.ts
│   ├── useIsMuted.svelte.ts
│   ├── useIsSpeaking.svelte.ts
│   ├── useMediaDeviceSelect.svelte.ts
│   ├── useMediaDevices.svelte.ts
│   ├── useStartAudio.svelte.ts
│   └── index.ts
├── components/
│   ├── layout/
│   │   ├── GridLayout.svelte
│   │   ├── FocusLayout.svelte
│   │   ├── FocusLayoutContainer.svelte
│   │   ├── CarouselLayout.svelte
│   │   └── TrackLoop.svelte
│   ├── participant/
│   │   ├── ParticipantTile.svelte
│   │   ├── ParticipantName.svelte
│   │   ├── ParticipantAudioTile.svelte
│   │   ├── AudioTrack.svelte
│   │   ├── VideoTrack.svelte
│   │   ├── ConnectionQualityIndicator.svelte
│   │   ├── TrackMutedIndicator.svelte
│   │   ├── AudioVisualizer.svelte
│   │   ├── BarVisualizer.svelte
│   │   └── ParticipantPlaceholder.svelte
│   ├── controls/
│   │   ├── TrackToggle.svelte
│   │   ├── ChatToggle.svelte
│   │   ├── FocusToggle.svelte
│   │   ├── DisconnectButton.svelte
│   │   ├── MediaDeviceSelect.svelte
│   │   ├── MediaDeviceMenu.svelte
│   │   ├── StartAudio.svelte
│   │   ├── StartMediaButton.svelte
│   │   ├── SettingsMenuToggle.svelte
│   │   ├── PaginationControl.svelte
│   │   └── PaginationIndicator.svelte
│   ├── ChatEntry.svelte
│   ├── Chat.svelte
│   ├── ConnectionState.svelte
│   ├── ConnectionStateToast.svelte
│   ├── LiveKitRoom.svelte
│   ├── RoomAudioRenderer.svelte
│   ├── RoomName.svelte
│   └── Toast.svelte
├── prefabs/
│   ├── VideoConference.svelte
│   ├── AudioConference.svelte
│   ├── ControlBar.svelte
│   ├── PreJoin.svelte
│   └── VoiceAssistantControlBar.svelte
└── styles/
    └── livekit-components.css   # Token-mapped styles
```

## Migration Patterns (Rules for All Subagents)

| React Pattern | Svelte 5 Equivalent |
|--------------|---------------------|
| `useState` | `$state` |
| `useRef` | `$state` (for elements) or plain variables |
| `useEffect(() => {}, [deps])` | `$effect(() => { ... })` with explicit reactivity |
| `useMemo(() => ..., [deps])` | `$derived` or `$derived.by` |
| `useCallback` | Inline functions (Svelte 5 doesn't need memoization) |
| `React.createContext` / `useContext` | Svelte `setContext` / `getContext` (or RUNED Context if appropriate) |
| `forwardRef` | `bind:this` or exported refs via props |
| `children` / `cloneElement` | Snippets (`{#snippet}`) or slots |
| `React.HTMLAttributes` | `HTMLAttributes<HTMLElement>` from `svelte/elements` |
| Observables from `@livekit/components-core` | Use directly (they're framework-agnostic) |

**Critical Rules:**
1. Use RUNED utilities where applicable (`useEventListener`, `useResizeObserver`, `useMediaQuery`, etc.)
2. All components must be RTL-aware (`dir="rtl"` inheritance, logical CSS properties)
3. Use our design tokens (`--background`, `--primary`, `--secondary`, `--accent`, `--muted`, `--card`, etc.) — NO hardcoded colors
4. Respect `prefers-reduced-motion`
5. No placeholders, TODOs, or partial logic. Every file must be production-ready.
6. Export TypeScript types for all public APIs.
7. Follow the reference API signatures as closely as possible for drop-in compatibility.

## Workstreams (Parallelizable)

### WS1: Foundation — Contexts & Shared Types
**Files:** `types.ts`, all `contexts/*`, `hooks/internal/*`
**Depends on:** Nothing
**Scope:**
- Define shared types (`TrackReferenceOrPlaceholder`, `WidgetState`, `ParticipantClickEvent`, etc.)
- Implement context providers:
  - `LayoutContext` — widget state (chat/settings visibility, unread count) + pin state
  - `PinContext` — track pinning dispatch/state
  - `ParticipantContext` — current participant
  - `TrackRefContext` — current track reference
  - `RoomContext` — LiveKit Room instance
  - `ChatContext` — chat messages + send function
- Internal hooks: `useObservableState`, `useMediaQuery`, `useResizeObserver`

### WS2: Track & Layout Hooks
**Files:** `hooks/useTracks.svelte.ts`, `hooks/useGridLayout.svelte.ts`, `hooks/usePagination.svelte.ts`, `hooks/useVisualStableUpdate.svelte.ts`, `hooks/useSwipe.svelte.ts`
**Depends on:** WS1 (types, room context)
**Scope:**
- `useTracks` — subscribe to track references with filters, placeholders, update triggers
- `useGridLayout` — calculate optimal grid columns/rows based on container size and track count
- `usePagination` — slice tracks into pages, prev/next controls
- `useVisualStableUpdate` — keep tiles visually stable when tracks reorder (reference uses `sortTrackBundles` + `tileArrayUpdate` from core)
- `useSwipe` — touch swipe detection for pagination

### WS3: Participant Hooks & Tiles
**Files:** `hooks/useParticipantTile.svelte.ts`, `hooks/useMultibandTrackVolume.svelte.ts`, `components/participant/*`
**Depends on:** WS1, WS2
**Scope:**
- `useParticipantTile` — keyboard handling, speaking indicator, click events
- `useMultibandTrackVolume` — FFT-based audio volume bands (uses Web Audio API + AnalyserNode)
- `ParticipantTile` — full rich tile with VideoTrack/AudioTrack, placeholder, metadata overlay, focus toggle, muted indicators, connection quality, encryption lock
- `VideoTrack` — attach/detach video element, subscription management
- `AudioTrack` — attach/detach audio element
- `ConnectionQualityIndicator` — excellent/good/poor/lost icons
- `TrackMutedIndicator` — mic/camera muted state
- `ParticipantName` — display name with fallback
- `AudioVisualizer` / `BarVisualizer` — SVG/span-based audio visualization with agent state support
- `ParticipantPlaceholder` — avatar placeholder when camera off

### WS4: Controls
**Files:** `components/controls/*`
**Depends on:** WS1, WS3 (for context awareness)
**Scope:**
- `TrackToggle` — generic mic/camera/screen share toggle with device error handling
- `ChatToggle` — toggles chat widget, shows unread badge
- `FocusToggle` — pin/unpin track to focus layout
- `DisconnectButton` — leave room
- `MediaDeviceSelect` / `MediaDeviceMenu` — device dropdowns
- `StartAudio` / `StartMediaButton` — browser autoplay policy workaround
- `PaginationControl` / `PaginationIndicator` — grid pagination UI
- `SettingsMenuToggle` — toggle settings widget

### WS5: Layout Components
**Files:** `components/layout/*`
**Depends on:** WS2, WS3
**Scope:**
- `GridLayout` — responsive CSS grid with pagination, swipe support
- `FocusLayoutContainer` — split layout container (carousel + main)
- `FocusLayout` — large single participant view
- `CarouselLayout` — horizontal/vertical scrollable strip, auto-calculates visible tiles
- `TrackLoop` — iterate tracks and set context for children

### WS6: Chat System
**Files:** `hooks/useChat.svelte.ts`, `components/Chat.svelte`, `components/ChatEntry.svelte`
**Depends on:** WS1
**Scope:**
- `useChat` — send/receive messages via LiveKit data channel (or text stream)
- `Chat` — chat panel with message list, auto-scroll, unread tracking, close button
- `ChatEntry` — individual message with name/timestamp grouping logic

### WS7: Prefabs (The Google Meet Assembly)
**Files:** `prefabs/VideoConference.svelte`, `prefabs/ControlBar.svelte`, `prefabs/Chat.svelte`, `prefabs/PreJoin.svelte`, `prefabs/AudioConference.svelte`
**Depends on:** WS1–WS6
**Scope:**
- `VideoConference` — THE main drop-in component:
  - Auto-focus screen share tracks
  - Grid vs Focus layout switching
  - ControlBar + Chat side panel
  - Connection state toasts
  - Room audio renderer
- `ControlBar` — microphone, camera, screen share, chat, settings, leave
- `PreJoin` — standalone pre-connect with preview, device selection, username, persistent choices
- `AudioConference` — audio-only layout

### WS8: Styles & Design System Integration
**Files:** `styles/livekit-components.css`
**Depends on:** WS3–WS7 (needs to style all components)
**Scope:**
- Map all `.lk-*` classes to our design tokens
- RTL support throughout
- Dark mode support via `prefers-color-scheme`
- Mobile-responsive breakpoints
- No external dependency on `@livekit/components-styles`

### WS9: Integration, Index & Verification
**Files:** `index.ts`, integration tests, typecheck
**Depends on:** WS1–WS8
**Scope:**
- Export public API from `index.ts`
- Ensure all TypeScript compiles (`svelte-check`)
- Verify no circular dependencies
- Create a demo page (optional) to test the VideoConference prefab

## Execution Order

```
Phase 1 (Parallel): WS1 + WS2 + WS6 foundations
Phase 2 (Parallel): WS3 + WS4 + WS5 (depend on Phase 1)
Phase 3 (Parallel): WS7 prefabs (depend on Phase 2)
Phase 4: WS8 styles
Phase 5: WS9 integration & verification
```

## Reference Files Map

Key reference files to port (in `reference/livekit-components-js/packages/react/src/`):

- `hooks/internal/useObservableState.ts` → `hooks/internal/useObservableState.svelte.ts`
- `hooks/internal/useResizeObserver.ts` → use RUNED's `useResizeObserver` or native
- `hooks/internal/useMediaQuery.ts` → use RUNED's `useMediaQuery`
- `hooks/useTracks.ts` → `hooks/useTracks.svelte.ts`
- `hooks/usePagination.ts` → `hooks/usePagination.svelte.ts`
- `hooks/useGridLayout.ts` → `hooks/useGridLayout.svelte.ts`
- `hooks/useVisualStableUpdate.ts` → `hooks/useVisualStableUpdate.svelte.ts`
- `hooks/useSwipe.ts` → `hooks/useSwipe.svelte.ts`
- `hooks/useParticipantTile.ts` → `hooks/useParticipantTile.svelte.ts`
- `hooks/useMultibandTrackVolume.ts` → `hooks/useMultibandTrackVolume.svelte.ts`
- `hooks/useChat.ts` → `hooks/useChat.svelte.ts`
- `hooks/usePersistentUserChoices.ts` → `hooks/usePersistentUserChoices.svelte.ts`
- `hooks/useLocalParticipantPermissions.ts` → `hooks/useLocalParticipantPermissions.svelte.ts`
- `components/layout/*.tsx` → `components/layout/*.svelte`
- `components/participant/*.tsx` → `components/participant/*.svelte`
- `components/controls/*.tsx` → `components/controls/*.svelte`
- `components/Chat.tsx` → `components/Chat.svelte`
- `components/ChatEntry.tsx` → `components/ChatEntry.svelte`
- `prefabs/*.tsx` → `prefabs/*.svelte`

## Verification Criteria
- [x] `svelte-check` passes with zero errors
- [x] No TODO comments or placeholder logic in ported tree
- [x] All components respect RTL direction
- [x] All components use design tokens (no hardcoded colors)
- [x] `VideoConference` prefab renders in production shell
- [x] Feature parity with reference: grid, focus, carousel, pagination, chat, controls, audio viz, prejoin
