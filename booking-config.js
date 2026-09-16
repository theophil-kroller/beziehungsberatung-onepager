window.BD_BOOKING_CONFIG = {
  // Leave empty + demoMode:true to test without Cloudflare.
  // Later replace with e.g. "https://beziehungsdynamiken-booking.YOUR-SUBDOMAIN.workers.dev"
  apiBaseUrl: "https://beziehungsdynamiken-booking.theophil-kroller.workers.dev",
  demoMode: false,

  timezone: "Europe/Vienna",
  minNoticeHours: 24,
  maxDaysAhead: 60,
  bufferMinutes: 15,

  appointmentTypes: {
    individual: {
      labelDe: "Einzelberatung",
      labelEn: "Individual counselling",
      durationMinutes: 60
    },
    couple: {
      labelDe: "Paar- & Beziehungsberatung",
      labelEn: "Couples & relationship counselling",
      durationMinutes: 90
    }
  },

  locations: {
    online: { labelDe: "Online", labelEn: "Online" },
    graz:   { labelDe: "Graz",   labelEn: "Graz" }
  }
};
