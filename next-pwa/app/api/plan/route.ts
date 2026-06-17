import { NextRequest } from 'next/server';
import { userClient, getToken, getUserId, fail, ok } from '../_lib/sb';

// GET  /api/plan                       this user's folders + files
// POST /api/plan { folders, files }    full replace of the user's plan tree

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  const sb = userClient(token);
  const [folders, files] = await Promise.all([
    sb.from('plan_folders').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    sb.from('plan_files').select('*').eq('user_id', userId).order('updated', { ascending: false }),
  ]);
  if (folders.error) return fail(502, folders.error.message);
  if (files.error) return fail(502, files.error.message);
  return ok({ folders: folders.data ?? [], files: files.data ?? [] });
}

type InFolder = { id: string; name?: string; icon?: string };
type InFile = {
  id: string; folderId?: string; title?: string; body?: string;
  updated?: number; attachments?: unknown; voice?: unknown; trashed?: boolean;
  mode?: string; metadata?: unknown; versions?: unknown; aiHistory?: unknown;
  ai_history?: unknown; privacy?: unknown; links?: unknown;
};

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  let body: { folders?: InFolder[]; files?: InFile[] };
  try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

  const now = Date.now();
  const inFolders = body.folders ?? [];
  const inFiles = body.files ?? [];

  const folderRows = inFolders.map((f) => ({
    id: f.id,
    user_id: userId,
    name: f.name || 'Untitled',
    icon: f.icon || 'folder',
  }));

  const defaultFolder = folderRows.length ? folderRows[0].id : 'personal';

  const fileRows = inFiles.map((f) => ({
    id: f.id,
    user_id: userId,
    folder_id: f.folderId || defaultFolder,
    title: f.title ?? '',
    body: f.body ?? '',
    attachments: f.attachments ?? [],
    voice: f.voice ?? [],
    trashed: !!f.trashed,
    updated: f.updated || now,
    mode: f.mode || 'personal',
    metadata: f.metadata ?? {},
    versions: f.versions ?? [],
    ai_history: f.aiHistory ?? f.ai_history ?? [],
    privacy: f.privacy ?? { level: 'private', bount_access: true },
    links: f.links ?? [],
  }));

  const sb = userClient(token);

  // Full replace, mirroring the old service: clear this user's rows, then insert.
  const delFiles = await sb.from('plan_files').delete().eq('user_id', userId);
  if (delFiles.error) return fail(502, delFiles.error.message);
  const delFolders = await sb.from('plan_folders').delete().eq('user_id', userId);
  if (delFolders.error) return fail(502, delFolders.error.message);

  if (folderRows.length) {
    const { error } = await sb.from('plan_folders').insert(folderRows);
    if (error) return fail(502, error.message);
  }
  if (fileRows.length) {
    const { error } = await sb.from('plan_files').insert(fileRows);
    if (error) return fail(502, error.message);
  }

  return ok({ ok: true, folders: folderRows.length, files: fileRows.length });
}
