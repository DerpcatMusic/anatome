/** Lazy-load @event-calendar/core + CSS once per session (studio + booking calendars). */

export type EventCalendarModule = {
  Calendar: (typeof import("@event-calendar/core"))["Calendar"];
  TimeGrid: (typeof import("@event-calendar/core"))["TimeGrid"];
  DayGrid: (typeof import("@event-calendar/core"))["DayGrid"];
  Interaction: (typeof import("@event-calendar/core"))["Interaction"];
};

let loadPromise: Promise<EventCalendarModule> | null = null;

export function loadEventCalendar(): Promise<EventCalendarModule> {
  if (!loadPromise) {
    loadPromise = (async () => {
      await import("@event-calendar/core/index.css");
      const mod = await import("@event-calendar/core");
      return {
        Calendar: mod.Calendar,
        TimeGrid: mod.TimeGrid,
        DayGrid: mod.DayGrid,
        Interaction: mod.Interaction,
      };
    })();
  }
  return loadPromise;
}
