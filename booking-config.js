window.BD_BOOKING_CONFIG = {
  // Leave empty + demoMode:true to test without Cloudflare.
  // Later replace with e.g. "https://beziehungsdynamiken-booking.YOUR-SUBDOMAIN.workers.dev"
  apiBaseUrl: "",
  demoMode: true,

  timezone: "Europe/Vienna",
  minNoticeHours: 24,
  maxDaysAhead: 42,
  bufferMinutes: 15,

  appointmentTypes: {
    individual: {
      labelDe: "Einzelberatung",
      labelEn: "Individual counselling",
      durationMinutes: 60
    },
    couple: {
      labelDe: "Paarberatung",
      labelEn: "Couples counselling",
      durationMinutes: 90
    }
  },

  locations: {
    online: { labelDe: "Online", labelEn: "Online" },
    graz:   { labelDe: "Graz",   labelEn: "Graz" }
  }
};
