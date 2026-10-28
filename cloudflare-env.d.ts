declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD_HASH?: string;
    ADMIN_PASSWORD_SALT?: string;
    SESSION_SECRET?: string;
    PUBLIC_ORIGIN?: string;
  }
}
