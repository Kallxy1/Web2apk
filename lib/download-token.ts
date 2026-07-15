import {createHmac,timingSafeEqual} from "node:crypto";
function secret(){return process.env.DOWNLOAD_SECRET||process.env.CRON_SECRET||""}
export function createDownloadToken(buildId:string,expires:number){const key=secret();if(!key)return null;return createHmac("sha256",key).update(`${buildId}.${expires}`).digest("base64url")}
export function verifyDownloadToken(buildId:string,expires:number,signature:string){if(!Number.isFinite(expires)||expires<Date.now()||expires>Date.now()+15*60_000)return false;const expected=createDownloadToken(buildId,expires);if(!expected||expected.length!==signature.length)return false;return timingSafeEqual(Buffer.from(expected),Buffer.from(signature))}
