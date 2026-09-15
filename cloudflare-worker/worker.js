
// Beziehungsdynamiken Booking MVP — Cloudflare Worker
// Required secrets/vars:
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
// Optional: GOOGLE_CALENDAR_ID=primary, ALLOWED_ORIGIN=https://www.beziehungsdynamiken.at
//
// Test defaults:
// Einzelberatung 60 min, Paarberatung 90 min, 15 min buffer,
// minimum notice 24h, max 42 days ahead.
// Released windows are defined in WEEKLY_AVAILABILITY below.

const TZ = "Europe/Vienna";
const TYPES = {
  individual: { duration: 60, label: "Einzelberatung" },
  couple: { duration: 90, label: "Paarberatung" }
};
const BUFFER_MIN = 15;
const MIN_NOTICE_HOURS = 24;
const MAX_DAYS_AHEAD = 42;

// 0=Sun ... 6=Sat. Change these whenever you want.
// This is only the MVP. Later we can replace it with a dedicated
// "Beziehungsdynamiken – Verfügbarkeit" Google Calendar.
const WEEKLY_AVAILABILITY = {
  2: [["14:00","19:00"]], // Tuesday
  4: [["09:00","13:00"]]  // Thursday
};

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});

    try {
      const url = new URL(request.url);
      if (url.pathname === "/health") return json({ok:true},200,cors);

      if (url.pathname === "/availability" && request.method === "GET") {
        const type = url.searchParams.get("type");
        const date = url.searchParams.get("date");
        if (!TYPES[type] || !/^\d{4}-\d{2}-\d{2}$/.test(date||"")) return json({error:"Invalid request"},400,cors);
        const slots = await getAvailability(env,type,date);
        return json({ok:true,slots},200,cors);
      }

      if (url.pathname === "/book" && request.method === "POST") {
        const b = await request.json();
        if (!b.name || !b.email || !TYPES[b.type] || !b.start || !["online","graz"].includes(b.location)) {
          return json({ok:false,error:"Missing fields"},400,cors);
        }

        // Recheck that requested slot is still free.
        const date = b.start.slice(0,10);
        const available = await getAvailability(env,b.type,date);
        const match = available.find(s => s.start === b.start);
        if (!match) return json({ok:false,error:"Slot no longer available"},409,cors);

        const token = await accessToken(env);
        const calendarId = encodeURIComponent(env.GOOGLE_CALENDAR_ID || "primary");
        const event = {
          summary: "Termin mit Theophil Kroller",
          description: `Gebucht über beziehungsdynamiken.at\n${TYPES[b.type].label}\n${b.location === "online" ? "Online" : "Graz"}`,
          start: { dateTime: match.start, timeZone: TZ },
          end: { dateTime: match.end, timeZone: TZ },
          attendees: [{email:b.email, displayName:b.name}],
          reminders: { useDefault:false, overrides:[{method:"email",minutes:1440},{method:"popup",minutes:60}] }
        };

        const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,{
          method:"POST",
          headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
          body:JSON.stringify(event)
        });
        if (!r.ok) throw new Error("Google event insert failed: "+await r.text());
        const created = await r.json();

        return json({ok:true,start:match.start,end:match.end,eventId:created.id},200,cors);
      }

      return json({error:"Not found"},404,cors);
    } catch (e) {
      return json({ok:false,error:String(e.message||e)},500,cors);
    }
  }
};

async function accessToken(env){
  const body = new URLSearchParams({
    client_id:env.GOOGLE_CLIENT_ID,
    client_secret:env.GOOGLE_CLIENT_SECRET,
    refresh_token:env.GOOGLE_REFRESH_TOKEN,
    grant_type:"refresh_token"
  });
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  if(!r.ok) throw new Error("Google token refresh failed: "+await r.text());
  return (await r.json()).access_token;
}

async function getAvailability(env,type,date){
  const duration=TYPES[type].duration;
  const [y,m,d]=date.split("-").map(Number);
  const dayOfWeek=new Date(Date.UTC(y,m-1,d,12)).getUTCDay();
  const windows=WEEKLY_AVAILABILITY[dayOfWeek]||[];
  if(!windows.length) return [];

  const now=Date.now();
  const max=now+MAX_DAYS_AHEAD*86400000;
  const candidates=[];

  for(const [from,to] of windows){
    let cursor=localDate(date,from);
    const endWindow=localDate(date,to);
    while(cursor.getTime()+duration*60000 <= endWindow.getTime()){
      const end=new Date(cursor.getTime()+duration*60000);
      if(cursor.getTime() >= now+MIN_NOTICE_HOURS*3600000 && cursor.getTime() <= max){
        candidates.push({start:isoWithViennaOffset(cursor),end:isoWithViennaOffset(end)});
      }
      cursor=new Date(cursor.getTime()+(duration+BUFFER_MIN)*60000);
    }
  }
  if(!candidates.length) return [];

  const token=await accessToken(env);
  const dayStart=localDate(date,"00:00"), dayEnd=localDate(date,"23:59");
  const r=await fetch("https://www.googleapis.com/calendar/v3/freeBusy",{
    method:"POST",
    headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      timeMin:dayStart.toISOString(),timeMax:dayEnd.toISOString(),
      timeZone:TZ,items:[{id:env.GOOGLE_CALENDAR_ID||"primary"}]
    })
  });
  if(!r.ok) throw new Error("Google freeBusy failed: "+await r.text());
  const data=await r.json();
  const busy=(data.calendars[env.GOOGLE_CALENDAR_ID||"primary"]?.busy)||[];

  return candidates.filter(s=>{
    const a=new Date(s.start).getTime(), b=new Date(s.end).getTime();
    return !busy.some(x=>{
      const x1=new Date(x.start).getTime()-BUFFER_MIN*60000;
      const x2=new Date(x.end).getTime()+BUFFER_MIN*60000;
      return a<x2 && b>x1;
    });
  });
}

function localDate(date,hm){
  // Vienna is CEST (+02:00) in summer and CET (+01:00) in winter.
  // Use Intl to determine offset indirectly via parts, then construct.
  const [y,m,d]=date.split("-").map(Number),[hh,mm]=hm.split(":").map(Number);
  const guess=new Date(Date.UTC(y,m-1,d,hh,mm));
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(guess);
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const represented=Date.UTC(+v.year,+v.month-1,+v.day,+v.hour,+v.minute);
  const wanted=Date.UTC(y,m-1,d,hh,mm);
  return new Date(guess.getTime()+(wanted-represented));
}
function isoWithViennaOffset(d){
  // ISO string is perfectly valid for Calendar API; frontend only uses HH:mm from text.
  // Return UTC to avoid DST ambiguity.
  return d.toISOString();
}
function json(obj,status,headers){return new Response(JSON.stringify(obj),{status,headers:{...headers,"Content-Type":"application/json;charset=utf-8"}})}
