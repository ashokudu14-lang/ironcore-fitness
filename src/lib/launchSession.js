let seenInMemory = false;
const key = "ironcore:launch-seen";
export function shouldPlayLaunch() {
  if (
    seenInMemory ||
    window.location.hash ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return false;
  try {
    return !sessionStorage.getItem(key);
  } catch {
    return true;
  }
}
export function markLaunchSeen() {
  seenInMemory = true;
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* In-memory state still prevents replay when storage is unavailable. */
  }
}
