type Coords = { lat: number; lon: number };

function inUkraine(c: Coords): boolean {
  return c.lat >= 44.0 && c.lat <= 52.6 && c.lon >= 22.0 && c.lon <= 40.5;
}

function inSpain(c: Coords): boolean {
  const mainland = c.lat >= 35.5 && c.lat <= 44.3 && c.lon >= -9.8 && c.lon <= 4.5;
  const canary = c.lat >= 27.5 && c.lat <= 29.8 && c.lon >= -18.5 && c.lon <= -13.0;
  return mainland || canary;
}

export function guessLangByTimeZone(): "uk" | "es" | "en" {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (tz === "Europe/Kyiv" || tz === "Europe/Uzhgorod") return "uk";
  if (tz === "Europe/Madrid" || tz === "Atlantic/Canary") return "es";
  return "en";
}

export async function guessLangByGeolocation(): Promise<"uk" | "es" | "en"> {
  if (!("geolocation" in navigator)) {
    console.warn("geo: navigator.geolocation not available");
    return "en";
  }

  console.log("geo: requesting geolocation...");

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  });

  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const acc = pos.coords.accuracy;

  console.log("geo: position received", { lat, lon, accuracyMeters: acc });

  const c: Coords = { lat, lon };

  if (inUkraine(c)) return "uk";
  if (inSpain(c)) return "es";
  return "en";
}
