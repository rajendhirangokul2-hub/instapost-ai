import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const POLL_INTERVAL = 60_000; // check every minute
const NOTIFIED_KEY = "postai_notified_schedules";

function getNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markNotified(id: string) {
  const set = getNotified();
  set.add(id);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

export function useScheduleNotifications() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!user) return;

    const requestPermission = async () => {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    const checkDuePosts = async () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date().toISOString();
      const { data } = await supabase
        .from("scheduled_posts")
        .select("id, headline, platform, scheduled_at")
        .eq("status", "scheduled")
        .lte("scheduled_at", now);

      if (!data) return;
      const notified = getNotified();

      for (const post of data) {
        if (notified.has(post.id)) continue;
        new Notification("📢 Time to post!", {
          body: `"${post.headline.slice(0, 60)}" is due on ${post.platform}`,
          icon: "/placeholder.svg",
        });
        markNotified(post.id);
      }
    };

    checkDuePosts();
    intervalRef.current = setInterval(checkDuePosts, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [user]);
}
