import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth-security';
import initialSnapshot from '@/data/store-snapshot.json';
import { StoreMode, Product, CategoryItem, SiteSettings, Coupon } from '@/types';

const execAsync = promisify(exec);

export interface GlobalStoreSnapshot {
  storeMode: StoreMode;
  updatedAt: string;
  fullProducts?: Product[];
  fullCategories?: CategoryItem[];
  fullSettings?: SiteSettings;
  sjProducts?: Product[];
  sjCategories?: CategoryItem[];
  sjSettings?: SiteSettings;
  coupons?: Coupon[];
}

declare global {
  var __AURELIA_STORE_STATE__: GlobalStoreSnapshot | undefined;
}

const SNAPSHOT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'store-snapshot.json');

async function readCurrentState(): Promise<GlobalStoreSnapshot> {
  if (globalThis.__AURELIA_STORE_STATE__) {
    return globalThis.__AURELIA_STORE_STATE__;
  }
  try {
    const raw = await fs.readFile(SNAPSHOT_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as GlobalStoreSnapshot;
    globalThis.__AURELIA_STORE_STATE__ = parsed;
    return parsed;
  } catch {
    const fallback: GlobalStoreSnapshot = {
      storeMode: (initialSnapshot.storeMode as StoreMode) || 'zapatos_jeans',
      updatedAt: initialSnapshot.updatedAt || new Date().toISOString(),
    };
    globalThis.__AURELIA_STORE_STATE__ = fallback;
    return fallback;
  }
}

export async function GET() {
  const state = await readCurrentState();
  return NextResponse.json(state, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'No autorizado. Se requiere sesión de Administrador.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const current = await readCurrentState();

    const nextState: GlobalStoreSnapshot = {
      ...current,
      ...(body.storeMode ? { storeMode: body.storeMode } : {}),
      ...(body.fullProducts ? { fullProducts: body.fullProducts } : {}),
      ...(body.fullCategories ? { fullCategories: body.fullCategories } : {}),
      ...(body.fullSettings ? { fullSettings: body.fullSettings } : {}),
      ...(body.sjProducts ? { sjProducts: body.sjProducts } : {}),
      ...(body.sjCategories ? { sjCategories: body.sjCategories } : {}),
      ...(body.sjSettings ? { sjSettings: body.sjSettings } : {}),
      ...(body.coupons ? { coupons: body.coupons } : {}),
      updatedAt: new Date().toISOString(),
    };

    // 1. Update in-memory global state immediately (works on Vercel serverless warm instances & Node servers)
    globalThis.__AURELIA_STORE_STATE__ = nextState;

    const jsonContent = JSON.stringify(nextState, null, 2);
    let deployedVia = 'server_memory';

    // 2. Write to local src/data/store-snapshot.json if filesystem is writable
    try {
      await fs.writeFile(SNAPSHOT_FILE_PATH, jsonContent, 'utf-8');
      deployedVia = 'local_filesystem';
    } catch {
      // Read-only filesystem in serverless environment
    }

    // 3. If deployToProduction is true, push to GitHub so Vercel builds & deploys globally
    if (body.deployToProduction) {
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO || 'bachnexg/aurelia-atelier';

      if (githubToken) {
        try {
          const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/src/data/store-snapshot.json`;
          const getRes = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github+json',
            },
          });
          const existingFile = getRes.ok ? await getRes.json() : null;

          const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `chore(cms): actualizar modo de tienda a ${nextState.storeMode} desde panel admin`,
              content: Buffer.from(jsonContent, 'utf-8').toString('base64'),
              ...(existingFile?.sha ? { sha: existingFile.sha } : {}),
              branch: 'main',
            }),
          });

          if (putRes.ok) {
            deployedVia = 'github_api_vercel';
          }
        } catch (err) {
          console.error('GitHub API deploy error:', err);
        }
      } else {
        // Try local git commit & push (when Admin runs from local machine connected to GitHub)
        try {
          await execAsync(
            `git add src/data/store-snapshot.json && git commit -m "chore(cms): activar modo ${nextState.storeMode} y sincronizar tienda en produccion" && git push origin main`
          );
          deployedVia = 'git_cli_pushed';
        } catch {
          // If nothing changed or git not available in serverless container, ignore error
        }
      }
    }

    return NextResponse.json({
      success: true,
      storeMode: nextState.storeMode,
      updatedAt: nextState.updatedAt,
      deployedVia,
    });
  } catch (error) {
    console.error('Error saving store state:', error);
    return NextResponse.json(
      { success: false, message: 'Error al guardar el estado de la tienda.' },
      { status: 500 }
    );
  }
}
