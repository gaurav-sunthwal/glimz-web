// app/creator/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreatorDashboardClient from "./CreatorDashboardClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api.glimznow.com/api";

/* ---------- API TYPES ---------- */

export type DashboardVideo = {
  content_id: number;
  title: string;
  description?: string | null;
  thumbnail?: {
    key: string;
    url: string;
  } | null;
  teaser?: unknown;
  video?: unknown;
  is_paid: boolean;
  playlist_id: number | null;
  views_count: number;
  likes_count: number;
  share_count: number;
  comment_count: number;
  save_count: number;
  orders: number;
  price: number;
  earning: number;
  watch_seconds: number;
  created_at: string;
};

export type DashboardPlaylist = {
  playlist_id: number;
  playlist_title: string;
  bundle_price: number | null;
  video_count: number;
};

export type ApiCreator = {
  creator_id: number;
  username: string;
  creator_name: string;
  profile_image: string | null;
  videos: DashboardVideo[];

  total_videos?: number;
  total_save_count?: number;
  total_earning?: number;
  total_watch_seconds?: number;
  total_views?: number;
  total_comments?: number;
  total_shares?: number;
  total_playlists?: number;
  playlists?: DashboardPlaylist[];
};

type DashboardApiResponse = {
  status: boolean;
  code: number;
  message: string;
  dashboardData: ApiCreator[][] | ApiCreator[];
};

/* ---------- UI TYPES (shared with client) ---------- */

export type CreatorUI = {
  name: string;
  username: string;
  totalViews: number;
  totalVideos: number;
  watchHours: number;
  totalLikes: number;
  earnings: number;
  totalPlaylists: number;
};

export type UploadedContentUI = {
  id: number;
  title: string;
  views: number;
  watchHours: number;
  likes: number;
  shares: number;
  comments: number;
  price: number;
  earnings: number;
  status: string;
  uploadedOn: string;
  thumbnailUrl: string | null;
};

export type PlaylistUI = {
  id: number;
  name: string;
  videos: number;
  bundlePrice: number;
};

/* ---------- SERVER PAGE ---------- */

export default async function CreatorDashboardPage() {
  const cookieStore = await cookies();

  const authToken = cookieStore.get("auth_token")?.value;
  const uuid = cookieStore.get("uuid")?.value;
  const isCreator = cookieStore.get("is_creator")?.value;

  // Not logged in -> home / login
  if (!authToken || !uuid) {
    redirect("/");
  }

  // Logged in but not a creator -> creator onboarding
  if (isCreator !== "1") {
    redirect("/become-creator");
  }

  const res = await fetch(`${API_BASE}/creator/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      auth_token: authToken,
      uuid,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    redirect("/"); // unauthorized -> go back to login/home
  }

  if (res.status === 404) {
    redirect("/become-creator");
  }

  if (!res.ok) {
    // You can render a custom error page instead if you prefer
    throw new Error(`Dashboard API error: ${res.status}`);
  }

  const json = (await res.json()) as DashboardApiResponse;

  if (!json.status) {
    throw new Error(json.message || "Dashboard API returned an error");
  }

  const rawData = json.dashboardData;
  if (!rawData) {
    throw new Error("No dashboardData in response");
  }

  let apiCreator: ApiCreator | null = null;

  if (Array.isArray(rawData)) {
    if (Array.isArray(rawData[0])) {
      apiCreator = (rawData[0] as ApiCreator[])[0] ?? null;
    } else {
      apiCreator = (rawData as ApiCreator[])[0] ?? null;
    }
  }

  if (!apiCreator) {
    redirect("/become-creator");
  }

  const videos = apiCreator.videos ?? [];

  // Aggregated totals (use API totals when present)
  const totalViewsFromApi = apiCreator.total_views ?? null;
  const totalEarningFromApi = apiCreator.total_earning ?? null;
  const totalWatchSecondsFromApi = apiCreator.total_watch_seconds ?? null;
  const totalVideosFromApi = apiCreator.total_videos ?? null;

  const totalViews =
    totalViewsFromApi ??
    videos.reduce((sum, v) => sum + (v.views_count ?? 0), 0);

  const totalEarnings =
    totalEarningFromApi ?? videos.reduce((sum, v) => sum + (v.earning ?? 0), 0);

  const totalWatchSeconds =
    totalWatchSecondsFromApi ??
    videos.reduce((sum, v) => sum + (v.watch_seconds ?? 0), 0);

  const totalWatchHours = Number((totalWatchSeconds / 3600).toFixed(1));

  const totalLikes = videos.reduce((sum, v) => sum + (v.likes_count ?? 0), 0);

  const totalVideos = totalVideosFromApi ?? videos.length;
  const totalPlaylists = apiCreator.total_playlists ?? 0;

  const creator: CreatorUI = {
    name: apiCreator.creator_name,
    username: apiCreator.username,
    totalViews,
    totalVideos,
    watchHours: totalWatchHours,
    totalLikes,
    earnings: totalEarnings,
    totalPlaylists,
  };

  const uploadedContent: UploadedContentUI[] = videos.map((v) => {
    const watchHours = Number(((v.watch_seconds ?? 0) / 3600).toFixed(1));
    const thumbnailUrl = v.thumbnail?.url ?? null;

    return {
      id: v.content_id,
      title: v.title,
      views: v.views_count ?? 0,
      watchHours,
      likes: v.likes_count ?? 0,
      shares: v.share_count ?? 0,
      comments: v.comment_count ?? 0,
      price: v.price ?? 0,
      earnings: v.earning ?? 0,
      status: v.is_paid ? "Paid" : "Free",
      uploadedOn: v.created_at
        ? new Date(v.created_at).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "",
      thumbnailUrl,
    };
  });

  const playlistsRaw = apiCreator.playlists ?? [];
  const playlists: PlaylistUI[] = playlistsRaw.map((pl) => ({
    id: pl.playlist_id,
    name: pl.playlist_title,
    videos: pl.video_count,
    bundlePrice: pl.bundle_price ?? 0,
  }));

  // Pass everything into client component
  return (
    <CreatorDashboardClient
      creator={creator}
      uploadedContent={uploadedContent}
      playlists={playlists}
    />
  );
}
