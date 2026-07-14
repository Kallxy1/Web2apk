export type BuildStatus = "queued" | "building" | "success" | "failed";
export type BuildMode = "url" | "zip";
export interface Build {
  id: string;
  user_id: string;
  name: string;
  package_name: string;
  mode: BuildMode;
  source_url: string | null;
  source_path: string | null;
  version_name: string;
  version_code: number;
  orientation: "portrait" | "landscape" | "unspecified";
  theme_color: string;
  status: BuildStatus;
  apk_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
