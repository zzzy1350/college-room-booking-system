import { DEFAULT_NOTICE_ITEMS, type NoticeItem } from '@/lib/config';
import { body, db, HttpError, json, originCheck, requireAdmin, route } from '@/lib/server';

const NOTICE_KEY = 'notice_items';

function validateNotices(value: unknown): NoticeItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new HttpError(400, '预约须知需要保留1–12项');
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object') throw new HttpError(400, '预约须知格式无效');
    const title = String((item as Record<string, unknown>).title ?? '').trim();
    const content = String((item as Record<string, unknown>).content ?? '').trim();
    if (!title || title.length > 80) throw new HttpError(400, '每项标题需为1–80字');
    if (!content || content.length > 2000) throw new HttpError(400, '每项正文需为1–2000字');
    return { title, content };
  });
}

export async function GET() {
  return route(async () => {
    const row = await db().prepare('SELECT value FROM site_settings WHERE key=?').bind(NOTICE_KEY).first<{value:string}>();
    if (!row) return json({ notices: DEFAULT_NOTICE_ITEMS });
    try {
      return json({ notices: validateNotices(JSON.parse(row.value)) });
    } catch {
      return json({ notices: DEFAULT_NOTICE_ITEMS });
    }
  });
}

export async function POST(req: Request) {
  return route(async () => {
    originCheck(req);
    await requireAdmin(req);
    const payload = await body(req);
    const notices = validateNotices(payload.notices);
    await db().prepare(
      'INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',
    ).bind(NOTICE_KEY, JSON.stringify(notices), Date.now()).run();
    return json({ notices });
  });
}
