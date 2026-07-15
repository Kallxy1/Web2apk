import type {BuildMode} from "./types";
export type BuildPreset={
 parentBuildId:string;mode:BuildMode;sourceUrl:string;sourceLabel:string;name:string;packageName:string;versionName:string;versionCode:number;orientation:"portrait"|"landscape"|"unspecified";themeColor:string;permissions:Record<"camera"|"microphone"|"location"|"notifications"|"vibrate",boolean>;notificationEnabled:boolean;oneSignalAppId:string;welcomeNotificationEnabled:boolean;welcomeTitle:string;welcomeBody:string;fullscreen:boolean;allowZoom:boolean;customUserAgent:string;storageMode:"normal"|"low"|"ephemeral";splashEnabled:boolean;splashBackground:string;splashDuration:number;
};
