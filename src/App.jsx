import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Car, Package, MapPin, Wallet, ShieldCheck, CheckCircle2, Clock3,
  X, Plus, Search, ArrowRight, KeyRound, Truck, User, Sparkles, XCircle, LogOut,
  Camera, Contact, Banknote, Mail, BadgeCheck, Phone, Star, Pencil, Trash2, PauseCircle, PlayCircle, Menu,
  MessageCircle, Send, Bell, Sun, Moon, Lock, Eye, EyeOff, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

/* ---------------------------------------------------------------- */
/* Supabase client — plain fetch() calls to the REST/Auth/Storage    */
/* APIs. The npm package @supabase/supabase-js isn't available in    */
/* this artifact runtime, but these are exactly the same HTTP APIs   */
/* the SDK itself calls under the hood, so behaviour is identical.   */
/* Sessions are kept via `localStore` below (a thin wrapper around   */
/* real localStorage — a plain module-scoped const, not a global     */
/* `window.storage` object, so there's no dependency on *when* some  */
/* other piece of code might assign to `window` before this runs).   */
/* ---------------------------------------------------------------- */
const localStore = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

const SUPABASE_URL = 'https://xzjowkiophfyyslxwhrd.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6am93a2lvcGhmeXlzbHh3aHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODUxNDgsImV4cCI6MjEwMTk2MTE0OH0.M2Rzr2VfD4SV1eJb14f6Hi4EG1ps_2_4L3Pca2ZP4nU';

async function sbAuth(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.error || 'Erreur de connexion');
  }
  return data;
}
async function sbAuthGet(path, token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || 'Erreur de session');
  return data;
}
async function sbRest(path, { method = 'GET', body, token, prefer } = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
  };
  if (body) headers['Content-Type'] = 'application/json';
  if (prefer) headers['Prefer'] = prefer;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur base de données (${res.status})`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
async function sbUpload(bucket, path, dataUrl, token) {
  const blob = await (await fetch(dataUrl)).blob();
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': blob.type || 'image/jpeg',
      'x-upsert': 'true',
    },
    body: blob,
  });
  if (!res.ok) {
    let detail = '';
    try {
      const errBody = await res.json();
      detail = errBody.message || errBody.error || JSON.stringify(errBody);
    } catch (e) {
      try {
        detail = await res.text();
      } catch (e2) {}
    }
    throw new Error(`Échec du téléversement de la photo (${res.status}) ${detail}`.trim());
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/* ---------------------------------------------------------------- */
/* Design tokens                                                     */
/* Ink Navy #0F1C3F · Cloud Paper #F7F6F2 · Signal Amber #F5A623     */
/* Runway Teal #0E9594 · Alert Coral #E8543E                        */
/* Display: Space Grotesk · Body: Inter · Data: JetBrains Mono       */
/* Signature: boarding-pass "ticket" cards with a perforated stub    */
/* ---------------------------------------------------------------- */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

:root{
  --ink:#0F1C3F;
  --ink-2:#182959;
  --paper:#F5F3EC;
  --paper-2:#FFFFFF;
  --amber:#F5A623;
  --amber-dark:#B5720B;
  --teal:#0E9594;
  --teal-dark:#0A6F6E;
  --coral:#E8543E;
  --slate:#6B7280;
  --line:#E5E1D3;
}

*{ box-sizing:border-box; }
html, body{ margin:0; padding:0; width:100%; max-width:100vw; overflow-x:hidden; }
img, svg, video{ max-width:100%; height:auto; }
.cge{
  font-family:'Inter',sans-serif;
  background:var(--paper);
  color:var(--ink);
  width:100%;
  min-height:100vh; min-height:100dvh;
  display:flex;
  justify-content:center;
  overflow-x:hidden;
}
.cge-shell{
  width:100%;
  max-width:460px;
  min-height:100vh; min-height:100dvh;
  background:var(--paper);
  position:relative;
  display:flex;
  flex-direction:column;
}
.cge-mono{ font-family:'JetBrains Mono',monospace; }
.cge-display{ font-family:'Space Grotesk',sans-serif; }

/* ---------- Onboarding ---------- */
.onboard{
  min-height:100vh; min-height:100dvh;
  background:radial-gradient(120% 90% at 15% 0%, #1B2C66 0%, var(--ink) 55%, #081026 100%);
  color:var(--paper-2);
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:44px 28px 32px;
  position:relative;
  overflow:hidden;
}
.onboard::before{
  content:'';
  position:absolute; inset:0;
  background-image: radial-gradient(rgba(245,166,35,0.55) 1.4px, transparent 1.4px);
  background-size: 26px 26px;
  opacity:0.14;
  pointer-events:none;
}
.onboard-mark{
  width:52px;height:52px;border-radius:14px;
  background:var(--amber);
  display:flex;align-items:center;justify-content:center;
  transform:rotate(-8deg);
  box-shadow:0 10px 30px rgba(245,166,35,0.35);
  flex-shrink:0;
}
.onboard-brand-row{
  display:flex;
  align-items:center;
  gap:16px;
}
.onboard h1{
  font-size:2.1rem;
  line-height:1.05;
  margin:0;
  letter-spacing:-0.02em;
}
.onboard p.tag{ color:#B9C2E0; font-size:1rem; line-height:1.5; max-width:34ch; margin-top:18px; }
.route-strip{
  display:flex; align-items:center; gap:10px;
  margin-top:34px; color:var(--paper-2); opacity:0.9;
}
.route-strip .code{ font-family:'JetBrains Mono',monospace; font-weight:600; letter-spacing:0.08em; font-size:0.85rem; }
.route-strip .line{ flex:1; height:1px; background:linear-gradient(90deg,transparent,#7D89B8,transparent); position:relative; }
.route-strip svg{ color:var(--amber); }

.onboard-form{ margin-top:36px; }
.onboard-form label{ font-size:0.8rem; color:#B9C2E0; display:block; margin-bottom:8px; }
.onboard-form input{
  width:100%; padding:15px 16px; border-radius:12px; border:1px solid #33417A;
  background:#141F45; color:#fff; font-size:1rem; font-family:'Inter',sans-serif;
}
.onboard-form input::placeholder{ color:#7681AC; }
.btn-amber{
  margin-top:18px; width:100%; padding:16px; border-radius:12px; border:none;
  background:var(--amber); color:#241300; font-weight:700; font-size:1rem;
  display:flex; align-items:center; justify-content:center; gap:8px;
  cursor:pointer; transition:transform .15s ease, box-shadow .15s ease;
  font-family:'Space Grotesk',sans-serif;
}
.btn-amber:active{ transform:scale(0.98); }
.btn-amber:hover{ box-shadow:0 8px 22px rgba(245,166,35,0.35); }
.onboard-foot{ font-size:0.72rem; color:#7681AC; margin-top:26px; line-height:1.5; }
.back-to-landing{
  display:flex; align-items:center; gap:6px; background:none; border:none; color:#9AA6D6;
  font-size:0.78rem; font-weight:600; cursor:pointer; padding:0; margin-bottom:22px;
  font-family:'Inter',sans-serif;
}
.back-to-landing:hover{ color:#fff; }
.onboard-divider{
  display:flex; align-items:center; gap:12px; margin:16px 0; color:#7681AC; font-size:0.75rem;
}
.onboard-divider::before, .onboard-divider::after{ content:''; flex:1; height:1px; background:#2C3C74; }
.btn-google{
  width:100%; padding:14px; border-radius:12px; border:1px solid #2C3C74;
  background:#111B40; color:#EDEFFA; font-weight:600; font-size:0.92rem;
  display:flex; align-items:center; justify-content:center; gap:10px;
  cursor:pointer; font-family:'Space Grotesk',sans-serif;
}
.btn-google:hover{ background:#182959; }

.pw-toggle{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  background:none; border:none; color:#7681AC; cursor:pointer; padding:4px;
  display:flex; align-items:center;
}
.auth-msg{ font-size:0.78rem; margin:10px 0 0; line-height:1.4; }
.auth-msg.error{ color:#FF8A80; }
.auth-msg.notice{ color:#8FD9C4; }
.auth-switch{
  display:block; width:100%; text-align:center; background:none; border:none;
  color:#B9C2E0; font-size:0.78rem; margin-top:14px; cursor:pointer; font-family:'Inter',sans-serif;
  text-decoration:underline;
}
.auth-switch:hover{ color:#fff; }

/* ---------- Header ---------- */
.top-header{
  position:sticky; top:0; z-index:20;
  background:var(--ink);
  color:#fff;
  padding:16px 18px;
  display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid #1F2E5C;
}
.brand{ display:flex; align-items:center; gap:10px; }
.brand-mark{
  width:34px;height:34px;border-radius:9px;background:var(--amber);
  display:flex;align-items:center;justify-content:center; color:#241300;
  transform:rotate(-8deg);
}
.brand-name{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.05rem; letter-spacing:-0.01em; }
.brand-sub{ font-size:0.68rem; color:#9AA6D6; letter-spacing:0.04em; }
.wallet-pill{
  display:flex; align-items:center; gap:6px;
  background:#182959; border:1px solid #2C3C74;
  padding:7px 12px; border-radius:999px; font-size:0.8rem; color:#FFD98F;
  font-family:'JetBrains Mono',monospace; font-weight:600;
}
.logout-btn{
  width:32px; height:32px; border-radius:9px; border:1px solid #2C3C74;
  background:#182959; color:#C9D1F0; display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
}
.logout-btn:hover{ background:#22316B; color:#fff; }

/* ---------- Content ---------- */
.content{ flex:1; padding:18px 16px 100px; }
.section-title{
  font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.15rem;
  margin:4px 0 4px;
}
.section-sub{ color:var(--slate); font-size:0.85rem; margin-bottom:16px; }

.searchbar{
  display:flex; align-items:center; gap:10px;
  background:var(--paper-2); border:1px solid var(--line); border-radius:12px;
  padding:12px 14px; margin-bottom:14px;
}
.searchbar input{ border:none; outline:none; flex:1; font-size:0.92rem; background:transparent; color:var(--ink); }
.searchbar svg{ color:var(--slate); flex-shrink:0; }

.fab-row{ display:flex; justify-content:flex-end; margin-bottom:14px; }
.btn-teal{
  background:var(--teal); color:#fff; border:none; border-radius:10px;
  padding:11px 16px; font-weight:600; font-size:0.85rem; display:flex; align-items:center; gap:6px;
  cursor:pointer; font-family:'Space Grotesk',sans-serif;
}
.btn-teal:hover{ background:var(--teal-dark); }

/* ---------- Ticket card (signature element) ---------- */
.ticket{
  position:relative;
  background:var(--paper-2);
  border-radius:16px;
  margin-bottom:22px;
  box-shadow:0 1px 2px rgba(15,28,63,0.06), 0 10px 24px rgba(15,28,63,0.06);
  border:1px solid var(--line);
}
.ticket-main{ padding:18px 18px 16px; }
.ticket-toggle{
  position:absolute; top:12px; right:12px; z-index:2; width:28px; height:28px; border-radius:50%;
  background:rgba(255,255,255,0.75); border:1px solid var(--line); color:var(--ink);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
}
.route-row{ display:flex; align-items:center; justify-content:space-between; }
.route-city{ display:flex; flex-direction:column; }
.route-city.right{ align-items:flex-end; text-align:right; }
.route-city .code{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.5rem; color:var(--ink); letter-spacing:0.01em; }
.route-city .label{ font-size:0.72rem; color:var(--slate); margin-top:2px; }
.route-plane{
  position:relative; display:flex; align-items:center; justify-content:center;
  flex:1; padding:0 12px; height:32px;
}
.route-plane .rl{
  position:absolute; left:0; right:0; top:50%; transform:translateY(-50%);
  border-top:1.5px dashed var(--line); height:0; content:'';
}
.route-plane svg{
  position:relative; z-index:1; color:var(--amber); transform:none;
  background:var(--paper-2); border-radius:50%; padding:3px;
}
.ticket-meta{ display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:14px; }
.meta-chip{ display:flex; align-items:center; gap:6px; font-size:0.78rem; color:var(--slate); }
.meta-chip b{ color:var(--ink); font-weight:600; }
.voyageur-line{ margin-top:12px; font-size:0.78rem; color:var(--slate); display:flex; align-items:center; justify-content:space-between; gap:10px; }
.voyageur-line b{ color:var(--ink); }
.verified-badge{
  display:flex; align-items:center; gap:4px; flex-shrink:0;
  color:#0F7A3D; font-size:0.7rem; font-weight:700;
}
.rating-inline{
  display:inline-flex; align-items:center; gap:3px; margin-left:8px;
  color:var(--amber-dark); font-weight:600; font-size:0.74rem;
}
.rating-inline-btn{
  background:none; border:none; padding:0; cursor:pointer; text-decoration:underline;
  text-decoration-color:transparent; transition:text-decoration-color .15s ease;
  font-family:'Inter',sans-serif;
}
.rating-inline-btn:hover{ text-decoration-color:var(--amber-dark); }

.review-block{
  margin-top:12px; background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:12px;
}
.review-head{
  display:flex; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; color:var(--ink);
  margin-bottom:8px;
}
.review-stars{ display:flex; gap:4px; margin-bottom:10px; }
.review-star-btn{ background:none; border:none; padding:2px; cursor:pointer; line-height:0; }
.review-block textarea{
  width:100%; border:1px solid var(--line); border-radius:9px; padding:9px 11px;
  font-size:0.85rem; font-family:'Inter',sans-serif; outline:none; background:var(--paper-2); resize:vertical;
}
.review-block textarea:focus{ border-color:var(--teal); }

.segment-toggle{
  display:flex; gap:6px; background:#EFEDE3; border-radius:12px; padding:4px; margin-bottom:18px;
}
.segment-btn{
  flex:1; border:none; background:none; border-radius:9px; padding:10px 8px;
  font-size:0.82rem; font-weight:600; color:var(--slate); cursor:pointer;
  font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; justify-content:center; gap:6px;
  transition:background .15s ease, color .15s ease, box-shadow .15s ease;
}
.segment-btn.active{ background:var(--paper-2); color:var(--ink); box-shadow:0 1px 4px rgba(15,28,63,0.12); }
.segment-btn .seg-badge{
  background:var(--coral); color:#fff; border-radius:999px; font-size:0.62rem; font-weight:700;
  padding:1px 6px; font-family:'JetBrains Mono',monospace;
}

.envois-filter-row{ display:flex; gap:8px; margin-bottom:16px; overflow-x:auto; }
.envois-filter-btn{
  flex:1; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:6px;
  border:1.5px solid var(--line); background:#fff; border-radius:11px; padding:10px 10px;
  font-size:0.8rem; font-weight:700; color:var(--slate); cursor:pointer;
  font-family:'Space Grotesk',sans-serif; transition:all .15s ease;
}
.envois-filter-btn.active{ background:var(--ink); border-color:var(--ink); color:#fff; }
.envois-filter-btn .efb-count{
  background:rgba(0,0,0,0.08); border-radius:999px; font-size:0.68rem; font-weight:700;
  padding:1px 7px; font-family:'JetBrains Mono',monospace;
}
.envois-filter-btn.active .efb-count{ background:rgba(255,255,255,0.2); }

.admin-header{ display:flex; align-items:flex-start; gap:12px; margin-bottom:16px; }
.admin-menu-btn{
  flex-shrink:0; width:38px; height:38px; border-radius:10px; border:1px solid var(--line);
  background:var(--paper-2); color:var(--ink); display:flex; align-items:center; justify-content:center;
  cursor:pointer;
}
.admin-menu-btn:hover{ background:#F0EEE5; }
.admin-drawer-overlay{ justify-content:flex-start; align-items:stretch; }
.admin-drawer{
  width:82%; max-width:320px; height:100%; background:var(--paper-2);
  border-radius:0 20px 20px 0; padding:20px 16px calc(20px + env(safe-area-inset-bottom));
  animation:drawerIn .2s cubic-bezier(.25,.8,.35,1);
  display:flex; flex-direction:column; gap:6px;
}
@keyframes drawerIn{ from{ transform:translateX(-16px); opacity:0.6; } to{ transform:translateX(0); opacity:1; } }
.admin-drawer-item{
  display:flex; align-items:center; gap:12px; width:100%; text-align:left;
  border:none; background:none; border-radius:10px; padding:12px 10px;
  font-size:0.9rem; font-weight:600; color:var(--ink); cursor:pointer;
  font-family:'Space Grotesk',sans-serif;
}
.admin-drawer-item:hover{ background:#F0EEE5; }
.admin-drawer-item.active{ background:var(--ink); color:#fff; }

.admin-search{
  display:flex; align-items:center; gap:8px;
  background:#fff; border:1.5px solid var(--line); border-radius:12px;
  padding:11px 14px; margin-bottom:14px; color:var(--slate);
}
.admin-search input{
  flex:1; border:none; outline:none; background:none; font-size:0.88rem;
  color:var(--ink); font-family:'Inter',sans-serif;
}
.admin-search input::placeholder{ color:#A8A196; }
.admin-search:focus-within{ border-color:var(--teal); }
.admin-search-clear{
  background:#F0EEE5; border:none; border-radius:50%; width:20px; height:20px;
  display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--slate); flex-shrink:0;
}

.admin-pagination{
  display:flex; flex-direction:column; align-items:center; gap:10px;
  margin-top:18px; padding-top:14px; border-top:1px solid var(--line);
}
.admin-pagination-count{ font-size:0.74rem; color:var(--slate); font-family:'Inter',sans-serif; }
.admin-pagination-controls{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:center; }
.admin-page-btn{
  min-width:32px; height:32px; padding:0 8px; border-radius:9px; border:1px solid var(--line);
  background:#fff; color:var(--ink); font-size:0.8rem; font-weight:600; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif;
}
.admin-page-btn.active{ background:var(--ink); color:#fff; border-color:var(--ink); }
.admin-page-btn:disabled{ opacity:0.35; cursor:not-allowed; }
.admin-page-ellipsis{ color:var(--slate); font-size:0.8rem; padding:0 2px; }

.ticket-divider{ position:relative; border-top:2px dashed var(--line); margin:0 18px; }
.ticket-divider::before, .ticket-divider::after{
  content:''; position:absolute; top:-11px; width:22px; height:22px; border-radius:50%; background:var(--paper);
}
.ticket-divider::before{ left:-29px; }
.ticket-divider::after{ right:-29px; }

.ticket-stub{
  padding:14px 18px 16px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
}
.stub-price{ display:flex; flex-direction:column; }
.stub-price .amount{ font-family:'JetBrains Mono',monospace; font-weight:600; color:var(--teal-dark); font-size:1rem; }
.stub-price .cap{ font-size:0.7rem; color:var(--slate); }
.btn-send{
  background:var(--ink); color:#fff; border:none; border-radius:10px;
  padding:10px 14px; font-size:0.82rem; font-weight:600; display:flex; align-items:center; gap:6px;
  cursor:pointer; font-family:'Space Grotesk',sans-serif;
}
.btn-send:hover{ background:var(--ink-2); }
.btn-send:disabled{ background:#B9BFCF; cursor:not-allowed; }

.empty-state{
  text-align:center; padding:48px 20px; color:var(--slate);
}
.empty-state svg{ color:var(--line); margin-bottom:10px; }
.empty-state .t{ font-family:'Space Grotesk',sans-serif; font-weight:600; color:var(--ink); margin-bottom:4px; }

/* ---------- Shipment card ---------- */
.ship-card{
  background:var(--paper-2); border:1px solid var(--line); border-radius:14px;
  padding:16px; margin-bottom:14px;
}
.ship-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.ship-title{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.98rem; }
.role-tag{ color:var(--amber-dark); font-weight:700; }
.ship-route{ font-size:0.78rem; color:var(--slate); margin-top:3px; }
.badge{
  font-size:0.68rem; font-weight:600; padding:5px 10px; border-radius:999px; white-space:nowrap;
}
.ship-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; margin:12px 0; }
.ship-grid .k{ font-size:0.68rem; color:var(--slate); text-transform:uppercase; letter-spacing:0.03em; }
.ship-grid .v{ font-size:0.86rem; font-weight:600; color:var(--ink); }
.actions-row{ display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.contact-block{
  margin-top:12px; background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:12px;
}
.contact-row{
  display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 0;
}
.contact-row + .contact-row{ border-top:1px solid var(--line); }
.contact-who{ font-size:0.68rem; color:var(--slate); text-transform:uppercase; letter-spacing:0.03em; }
.contact-name{ font-size:0.84rem; font-weight:600; color:var(--ink); margin-top:1px; }
.contact-call{
  display:flex; align-items:center; gap:6px; background:#E1F4F3; color:var(--teal-dark);
  border-radius:9px; padding:8px 12px; font-size:0.78rem; font-weight:700; text-decoration:none;
  font-family:'JetBrains Mono',monospace; flex-shrink:0;
}
.btn-track{
  display:flex; align-items:center; justify-content:center; gap:8px; width:100%;
  background:var(--ink); color:#fff; border-radius:10px; padding:11px; margin-top:10px;
  font-size:0.85rem; font-weight:700; text-decoration:none; font-family:'Space Grotesk',sans-serif;
}
.btn-track:hover{ background:var(--ink-2); }

.live-location{ margin-top: 4px; }
.live-location-head{
  display:flex; align-items:center; gap:7px; font-size:0.78rem; font-weight:700; color:'#0F7A3D';
  color:#0F7A3D; margin-bottom:8px;
}
.live-dot{
  width:9px; height:9px; border-radius:50%; background:#22C55E; flex-shrink:0;
  animation:livePulse 1.6s ease-in-out infinite;
}
@keyframes livePulse{
  0%{ box-shadow:0 0 0 0 rgba(34,197,94,0.5); }
  70%{ box-shadow:0 0 0 8px rgba(34,197,94,0); }
  100%{ box-shadow:0 0 0 0 rgba(34,197,94,0); }
}
.live-time{ color:var(--slate); font-weight:400; margin-left:auto; }
.live-map-frame{
  width:100%; height:160px; border:1px solid var(--line); border-radius:10px; display:block;
}
.btn-sm{
  border:none; border-radius:9px; padding:9px 13px; font-size:0.8rem; font-weight:600; cursor:pointer;
  font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; gap:6px;
}
.btn-sm.primary{ background:var(--amber); color:#241300; }
.btn-sm.teal{ background:var(--teal); color:#fff; }
.btn-sm.ghost{ background:#F0EEE5; color:var(--ink); }
.btn-sm.coral{ background:#FBE4E1; color:var(--coral); }
.btn-sm:hover{ filter:brightness(0.96); }

.code-box{
  margin-top:12px; background:var(--ink); border-radius:12px; padding:16px;
  display:flex; align-items:center; justify-content:space-between; color:#fff;
}
.code-box .lab{ font-size:0.68rem; color:#9AA6D6; letter-spacing:0.06em; text-transform:uppercase; }
.code-box .code{ font-family:'JetBrains Mono',monospace; font-size:1.5rem; font-weight:700; letter-spacing:0.15em; color:var(--amber); }

.code-warning{
  display:flex; gap:8px; align-items:flex-start; margin-top:10px;
  background:#FDF0DA; border:1px solid #F0D8A8; border-radius:10px; padding:11px 13px;
  color:#7A5417; font-size:0.76rem; line-height:1.45;
}
.code-warning svg{ flex-shrink:0; margin-top:1px; color:var(--amber-dark); }

.code-entry{ display:flex; gap:8px; margin-top:10px; }
.code-entry input{
  flex:1; border:1px solid var(--line); border-radius:9px; padding:9px 12px;
  font-family:'JetBrains Mono',monospace; font-size:0.95rem; letter-spacing:0.1em; text-transform:uppercase;
  outline:none;
}
.code-entry input:focus{ border-color:var(--teal); }

.proof-upload{
  display:flex; align-items:center; justify-content:center; gap:8px;
  border:1.5px dashed var(--slate); border-radius:10px; padding:16px; cursor:pointer;
  color:var(--slate); font-size:0.82rem; font-weight:600; background:var(--paper-2);
  text-align:center;
}
.proof-upload:hover{ border-color:var(--teal); color:var(--teal-dark); }
.proof-upload input{
  position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
  clip:rect(0,0,0,0); white-space:nowrap; border:0;
}
.proof-preview{ display:flex; align-items:center; gap:10px; }
.proof-thumb{ width:56px; height:56px; border-radius:9px; object-fit:cover; border:1px solid var(--line); flex-shrink:0; }
.proof-preview-info{ font-size:0.78rem; color:var(--ink); font-weight:600; }
.proof-preview-info span{ display:block; font-size:0.7rem; color:var(--slate); font-weight:400; margin-top:2px; }
.proof-retake{ margin-left:auto; background:none; border:none; color:var(--coral); font-size:0.74rem; font-weight:600; cursor:pointer; }
.proof-skip{
  display:block; width:100%; margin-top:10px; background:none; border:none;
  color:var(--slate); font-size:0.74rem; font-weight:600; cursor:pointer; text-decoration:underline;
  text-align:center; font-family:'Inter',sans-serif;
}
.proof-skip:hover{ color:var(--ink); }

/* ---------- Live camera capture (ID card guide) ---------- */
.camera-overlay{
  position:fixed; inset:0; z-index:200; background:#0B1230;
  display:flex; flex-direction:column; color:#fff;
}
.camera-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:16px; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:0.95rem;
}
.camera-header .icon-btn{ background:rgba(255,255,255,0.12); color:#fff; }
.camera-video-wrap{
  position:relative; flex:1; display:flex; align-items:center; justify-content:center;
  overflow:hidden; background:#000;
}
.camera-video{ width:100%; height:100%; object-fit:cover; }
.card-guide{
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  width:85%; aspect-ratio:1.586; border:2.5px solid var(--amber); border-radius:14px;
  box-shadow:0 0 0 9999px rgba(0,0,0,0.55); pointer-events:none;
}
.camera-hint{
  text-align:center; font-size:0.82rem; color:#D6DCF5; padding:14px 20px 0;
  font-family:'Inter',sans-serif;
}
.camera-shutter{
  width:68px; height:68px; border-radius:50%; border:4px solid #fff; background:transparent;
  margin:20px auto 28px; display:flex; align-items:center; justify-content:center; cursor:pointer;
}
.camera-shutter span{ width:52px; height:52px; border-radius:50%; background:#fff; display:block; }
.camera-shutter:disabled{ opacity:0.4; cursor:not-allowed; }
.camera-error{
  flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:16px; padding:24px; text-align:center; color:#D6DCF5; font-size:0.9rem;
}

.lightbox-overlay{
  position:fixed; inset:0; z-index:250; background:rgba(6,10,26,0.92);
  display:flex; align-items:center; justify-content:center; padding:24px;
  animation:fadeIn .12s ease;
}
.lightbox-img{
  max-width:100%; max-height:90vh; border-radius:10px; object-fit:contain;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
}
.lightbox-close{
  position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.15); color:#fff;
}

.withdraw-btn{
  margin-top:14px; width:100%; padding:14px; border-radius:12px; border:none;
  background:var(--amber); color:#241300; font-weight:700; font-size:0.92rem;
  display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;
  font-family:'Space Grotesk',sans-serif;
}
.withdraw-btn:hover{ box-shadow:0 8px 20px rgba(245,166,35,0.3); }
.withdraw-empty{ margin-top:14px; font-size:0.76rem; color:#9AA6D6; text-align:center; }

/* ---------- Wallet ---------- */
.wallet-hero{
  background:linear-gradient(135deg, var(--ink) 0%, #1B2C66 100%);
  border-radius:18px; padding:22px; color:#fff; margin-bottom:18px;
  position:relative; overflow:hidden;
}
.wallet-hero::after{
  content:''; position:absolute; right:-30px; top:-30px; width:140px; height:140px;
  border-radius:50%; background:rgba(245,166,35,0.16);
}
.wallet-hero .lab{ font-size:0.72rem; color:#9AA6D6; letter-spacing:0.05em; }
.wallet-hero .big{ font-family:'Space Grotesk',sans-serif; font-size:2.1rem; font-weight:700; margin-top:6px; }
.wallet-row{ display:flex; gap:14px; margin-top:16px; }
.wallet-stat{ flex:1; background:rgba(255,255,255,0.08); border-radius:12px; padding:12px; }
.wallet-stat .l{ font-size:0.68rem; color:#B9C2E0; }
.wallet-stat .v{ font-family:'JetBrains Mono',monospace; font-weight:600; font-size:1rem; margin-top:4px; }

.tx-row{
  display:flex; justify-content:space-between; align-items:center;
  padding:12px 0; border-bottom:1px solid var(--line);
}
.tx-row:last-child{ border-bottom:none; }
.tx-left{ display:flex; align-items:center; gap:10px; }
.tx-icon{ width:34px;height:34px;border-radius:9px; display:flex; align-items:center; justify-content:center; }
.tx-title{ font-size:0.86rem; font-weight:600; }
.tx-sub{ font-size:0.72rem; color:var(--slate); }
.tx-amount{ font-family:'JetBrains Mono',monospace; font-weight:600; font-size:0.88rem; }

.disclaimer{
  margin-top:22px; font-size:0.72rem; color:var(--slate); line-height:1.5;
  background:#EFEDE3; border-radius:10px; padding:12px 14px;
}

.admin-photos{ display:flex; gap:10px; margin-top:12px; }
.admin-photo-block{ flex:1; text-align:center; }
.admin-photo-block img{
  width:100%; height:110px; object-fit:cover; border-radius:10px; border:1px solid var(--line);
  display:block;
}
.admin-photo-block span{ display:block; font-size:0.68rem; color:var(--slate); margin-top:4px; }

.admin-thread{
  display:flex; flex-direction:column; gap:8px; margin-top:12px; max-height:220px; overflow-y:auto;
  padding:10px; background:var(--paper); border-radius:10px;
}
.admin-thread .chat-bubble{ max-width:88%; }
.admin-reply-row{ display:flex; gap:8px; margin-top:10px; }
.admin-reply-row input{
  flex:1; border:1px solid var(--line); border-radius:9px; padding:9px 12px;
  font-size:0.85rem; font-family:'Inter',sans-serif; outline:none; background:var(--paper-2);
}
.admin-reply-row input:focus{ border-color:var(--teal); }

/* ---------- Bottom nav ---------- */
.bottom-nav{
  position:fixed; bottom:0; left:50%; transform:translateX(-50%);
  width:100%; max-width:460px;
  background:var(--paper-2); border-top:1px solid var(--line);
  display:flex; padding:8px 6px calc(8px + env(safe-area-inset-bottom));
  z-index:30;
}
.nav-item{
  flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:8px 4px; border-radius:10px; cursor:pointer; background:none; border:none;
  color:var(--slate); font-size:0.66rem; font-family:'Inter',sans-serif; font-weight:600;
  position:relative;
}
.nav-item.active{ color:var(--ink); }
.nav-badge{
  position:absolute; top:2px; right:20%;
  min-width:17px; height:17px; padding:0 3px;
  border-radius:999px; background:var(--coral); color:#fff;
  font-size:0.6rem; font-weight:700; font-family:'JetBrains Mono',monospace;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 0 2px var(--paper-2);
}

/* ---------- Modal sheet ---------- */
.overlay{
  position:fixed; inset:0; background:rgba(15,28,63,0.45); z-index:40;
  display:flex; align-items:flex-end; justify-content:center;
  animation:fadeIn .18s ease;
}
@keyframes fadeIn{ from{opacity:0;} to{opacity:1;} }
.sheet{
  width:100%; max-width:460px; background:var(--paper-2);
  border-radius:20px 20px 0 0; max-height:88vh; overflow-y:auto;
  padding:20px 20px calc(20px + env(safe-area-inset-bottom));
  animation:slideUp .22s cubic-bezier(.25,.8,.35,1);
}
@keyframes slideUp{ from{ transform:translateY(24px); opacity:0.6;} to{ transform:translateY(0); opacity:1;} }
.sheet-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.sheet-head h3{ font-family:'Space Grotesk',sans-serif; font-size:1.1rem; margin:0; }
.icon-btn{ background:#F0EEE5; border:none; border-radius:9px; width:32px;height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; }

.confirm-sheet{ text-align:center; padding-top:6px; }
.confirm-icon{
  width:56px; height:56px; border-radius:50%; background:#FBE4E1; color:var(--coral);
  display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
}
.confirm-sheet h3{ font-family:'Space Grotesk',sans-serif; font-size:1.1rem; margin:0 0 8px; color:var(--ink); }
.confirm-sheet p{ font-size:0.86rem; color:var(--slate); line-height:1.5; margin:0 0 22px; }
.confirm-actions{ display:flex; gap:10px; }
.confirm-actions .btn-sm{ flex:1; justify-content:center; padding:12px; font-size:0.85rem; }

.operator-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.operator-btn{
  padding:16px; border-radius:12px; border:1px solid var(--line); background:var(--paper);
  font-weight:700; font-size:0.9rem; color:var(--ink); cursor:pointer;
  font-family:'Space Grotesk',sans-serif; transition:border-color .15s ease, background .15s ease;
}
.operator-btn:hover{ border-color:var(--teal); background:#E1F4F3; }

.field{ margin-bottom:14px; }
.field label{ display:block; font-size:0.78rem; font-weight:600; color:var(--ink); margin-bottom:6px; }
.field input, .field textarea{
  width:100%; border:1px solid var(--line); border-radius:10px; padding:11px 13px;
  font-size:0.92rem; font-family:'Inter',sans-serif; outline:none; background:var(--paper);
}
.field input:focus, .field textarea:focus{ border-color:var(--teal); background:#fff; }
.field.has-error input, .field.has-error textarea{ border-color:var(--coral); background:#FDF4F3; }
.field.is-valid input, .field.is-valid textarea{ border-color:#0F7A3D; }
.field-error{ font-size:0.72rem; color:var(--coral); margin-top:5px; display:flex; align-items:center; gap:4px; }
.field-row{ display:flex; gap:10px; }
.field-row .field{ flex:1; }
.helper{ font-size:0.72rem; color:var(--slate); margin-top:5px; }
.char-count{ font-size:0.68rem; color:var(--slate); text-align:right; margin-top:4px; }

.split-note{
  background:#E1F4F3; border-radius:10px; padding:12px 14px; font-size:0.78rem; color:var(--teal-dark);
  display:flex; gap:8px; align-items:flex-start; margin-bottom:14px;
}

.price-boost-note{
  background:#FDF0DA; border-radius:10px; padding:12px 14px; font-size:0.78rem; color:var(--amber-dark);
  display:flex; gap:8px; align-items:flex-start; margin-top:12px;
}
.price-boost-form{
  margin-top:12px; background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:12px;
}
.price-boost-form input{
  width:100%; border:1px solid var(--line); border-radius:9px; padding:10px 12px; margin-bottom:10px;
  font-size:0.9rem; font-family:'JetBrains Mono',monospace; outline:none; background:var(--paper-2);
}
.price-boost-form input:focus{ border-color:var(--teal); }

.doctype-row{ display:flex; gap:8px; margin-bottom:14px; }
.doctype-btn{
  flex:1; border:1px solid var(--line); background:var(--paper); color:var(--slate);
  border-radius:9px; padding:9px 6px; font-size:0.74rem; font-weight:600; cursor:pointer;
  font-family:'Space Grotesk',sans-serif; text-align:center;
}
.doctype-btn.active{ background:var(--ink); color:#fff; border-color:var(--ink); }
.verify-intro{
  background:#FDF0DA; border-radius:10px; padding:12px 14px; font-size:0.78rem; color:var(--amber-dark);
  display:flex; gap:8px; align-items:flex-start; margin-bottom:16px;
}

/* ---------- Toast ---------- */
.toast{
  position:fixed; bottom:96px; left:50%; transform:translateX(-50%);
  background:var(--ink); color:#fff; padding:12px 18px; border-radius:11px;
  font-size:0.84rem; z-index:60; display:flex; align-items:center; gap:8px;
  box-shadow:0 10px 26px rgba(15,28,63,0.35);
  animation:toastIn .2s ease;
  max-width:88%;
}
@keyframes toastIn{ from{ opacity:0; transform:translate(-50%,8px);} to{ opacity:1; transform:translate(-50%,0);} }
.toast.error{ background:var(--coral); }
.toast.success{ background:#0F7A3D; }

.loading-screen{
  min-height:100vh; min-height:100dvh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:18px;
  background:radial-gradient(circle at 50% 30%, var(--ink-2) 0%, var(--ink) 65%);
  color:#9AA6D6; font-family:'Space Grotesk',sans-serif; padding:24px; text-align:center;
}
.loading-mark{
  width:64px; height:64px; border-radius:18px; background:var(--amber);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 14px 40px rgba(245,166,35,0.4);
  animation:loadingPulse 1.8s ease-in-out infinite;
}
@keyframes loadingPulse{
  0%,100%{ transform:scale(1) rotate(-6deg); }
  50%{ transform:scale(1.08) rotate(-6deg); }
}
.loading-title{
  font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.4rem;
  color:#fff; letter-spacing:-0.01em; margin:0;
}
.loading-bar{
  width:160px; height:4px; border-radius:99px; background:rgba(255,255,255,0.12);
  overflow:hidden;
}
.loading-bar-fill{
  height:100%; width:40%; border-radius:99px;
  background:linear-gradient(90deg, var(--amber), var(--teal));
  animation:loadingSlide 1.2s ease-in-out infinite;
}
@keyframes loadingSlide{
  0%{ transform:translateX(-100%); }
  100%{ transform:translateX(350%); }
}
.loading-caption{
  font-family:'Inter',sans-serif; font-size:0.82rem; color:#7681AC; margin:0;
}

.boot-overlay{
  position:fixed; inset:0; z-index:400;
  display:flex; align-items:flex-end; justify-content:center;
  padding-bottom:calc(24px + env(safe-area-inset-bottom, 0px));
  pointer-events:none;
}
.boot-card{
  pointer-events:auto;
  display:flex; align-items:center; gap:10px;
  background:var(--ink); color:#fff; padding:12px 20px; border-radius:99px;
  box-shadow:0 12px 34px rgba(0,0,0,0.28);
  font-family:'Space Grotesk',sans-serif; font-size:0.85rem; font-weight:600;
}
.boot-spin{ animation:spin 0.9s linear infinite; color:var(--amber); }
@keyframes spin{ from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }

/* ---------- Landing page ---------- */
.landing{
  min-height:100vh; min-height:100dvh; width:100%; background:var(--paper); display:flex; justify-content:center;
  overflow-x:hidden;
}
.landing-shell{ width:100%; max-width:460px; min-height:100vh; min-height:100dvh; background:var(--paper); }
.session-debug-banner{
  position:fixed; top:0; left:0; right:0; z-index:300; background:#7A1F1F; color:#fff;
  font-size:0.72rem; padding:8px 14px; text-align:center; font-family:'Inter',sans-serif;
}

.landing-hero{
  position:relative; overflow:hidden; min-height:480px;
  display:flex; flex-direction:column;
  color:#fff; padding:24px 24px 28px;
}
.hero-bg{ position:absolute; inset:0; z-index:0; background:var(--ink); }
.hero-bg img{ width:100%; height:100%; object-fit:cover; display:block; opacity:0.85; }
.hero-overlay{
  position:absolute; inset:0; z-index:1;
  background:linear-gradient(180deg, rgba(8,16,38,0.35) 0%, rgba(8,16,38,0.55) 45%, var(--ink) 96%);
}
.hero-content{ position:relative; z-index:2; display:flex; flex-direction:column; flex:1; }
.landing-hero::before{
  content:''; position:absolute; inset:0; z-index:1;
  background-image: radial-gradient(rgba(245,166,35,0.4) 1.3px, transparent 1.3px);
  background-size:24px 24px; opacity:0.12; pointer-events:none;
}
.landing-brand{ display:flex; align-items:center; gap:12px; }
.landing-brand .mark{
  width:44px; height:44px; border-radius:12px; background:var(--amber);
  display:flex; align-items:center; justify-content:center; transform:rotate(-8deg);
  box-shadow:0 8px 24px rgba(245,166,35,0.35); flex-shrink:0;
}
.landing-brand .name{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.15rem; flex:1; }
.theme-toggle-btn{
  width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.25);
  background:rgba(255,255,255,0.12); backdrop-filter:blur(4px); color:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  transition:background .15s ease, transform .15s ease;
}
.theme-toggle-btn:hover{ background:rgba(255,255,255,0.22); transform:scale(1.05); }
.theme-toggle-btn:active{ transform:scale(0.92); }
.hero-headline{
  flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; padding:28px 6px; gap:12px;
}
.landing-hero h1{
  font-family:'Space Grotesk',sans-serif; font-size:2.1rem; line-height:1.15;
  letter-spacing:-0.02em; margin:0; text-shadow:0 2px 18px rgba(0,0,0,0.45);
}
.landing-hero h1 span{ color:var(--amber); }
.landing-hero p.sub{
  color:#EDEFFA; font-size:0.96rem; line-height:1.55; max-width:30ch;
  text-shadow:0 1px 12px rgba(0,0,0,0.5);
}
.landing-cta-row{ display:flex; gap:10px; }
.landing-btn-primary{
  flex:1; padding:14px; border-radius:12px; border:none; background:var(--amber); color:#241300;
  font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:7px;
  cursor:pointer; font-family:'Space Grotesk',sans-serif;
}
.landing-btn-primary:hover{ box-shadow:0 8px 20px rgba(245,166,35,0.32); }
.landing-stats{ display:flex; gap:18px; margin-top:24px; justify-content:center; }
.landing-stat{ text-align:center; }
.landing-stat b{ display:block; font-family:'Space Grotesk',sans-serif; font-size:1.15rem; color:#fff; }
.landing-stat span{ font-size:0.68rem; color:#B9C2E0; }

.carousel-wrap{ overflow:hidden; margin-top:26px; position:relative; z-index:2; }
.carousel-wrap::before, .carousel-wrap::after{
  content:''; position:absolute; top:0; bottom:0; width:28px; z-index:2; pointer-events:none;
}
.carousel-wrap::before{ left:0; background:linear-gradient(90deg, var(--ink), transparent); }
.carousel-wrap::after{ right:0; background:linear-gradient(270deg, var(--ink), transparent); }
.carousel-track{
  display:flex; gap:12px; width:max-content;
  animation: carouselScroll 28s linear infinite;
}
@keyframes carouselScroll{
  from{ transform:translateX(0); }
  to{ transform:translateX(-50%); }
}
.carousel-card{
  width:150px; height:104px; border-radius:14px; overflow:hidden; flex-shrink:0;
  position:relative; border:1px solid rgba(255,255,255,0.12);
}
.carousel-card img{ width:100%; height:100%; object-fit:cover; display:block; }
.carousel-card .cap{
  position:absolute; left:0; right:0; bottom:0; padding:6px 9px;
  background:linear-gradient(0deg, rgba(8,16,38,0.85), transparent);
  color:#fff; font-size:0.66rem; font-weight:600;
}

.landing-section{ padding:30px 22px; }
.landing-section h2{
  font-family:'Space Grotesk',sans-serif; font-size:1.25rem; color:var(--ink); margin:0 0 6px;
  letter-spacing:-0.01em;
}
.landing-section p.lead{ color:var(--slate); font-size:0.86rem; line-height:1.5; margin:0 0 22px; }

.step-row{ display:flex; gap:14px; margin-bottom:20px; }
.step-num{
  width:34px; height:34px; border-radius:10px; background:var(--ink); color:var(--amber);
  font-family:'JetBrains Mono',monospace; font-weight:700; font-size:0.9rem;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.step-body b{ display:block; font-size:0.9rem; color:var(--ink); margin-bottom:2px; }
.step-body span{ font-size:0.8rem; color:var(--slate); line-height:1.45; }

.landing-section.dark{
  background:var(--ink); color:#fff;
}
.landing-section.dark h2{ color:#fff; }
.landing-section.dark p.lead{ color:#9AA6D6; }
.feature-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.feature-card{
  background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px;
  padding:16px 14px;
}
.feature-card svg{ color:var(--amber); margin-bottom:10px; }
.feature-card b{ display:block; font-size:0.85rem; margin-bottom:4px; }
.feature-card span{ font-size:0.74rem; color:#B9C2E0; line-height:1.4; display:block; }

.landing-footer{
  padding:34px 22px 40px; text-align:center; background:var(--paper-2); border-top:1px solid var(--line);
}
.landing-footer h2{
  font-family:'Space Grotesk',sans-serif; font-size:1.3rem; color:var(--ink); margin:0 0 8px;
}
.landing-footer p{ color:var(--slate); font-size:0.85rem; margin:0 0 20px; }
.landing-footer .foot-note{ font-size:0.7rem; color:var(--slate); margin-top:18px; line-height:1.5; }

/* ---------- Landing dark theme (day/night toggle) ---------- */
.landing.dark-theme{ background:#0B1120; }
.landing.dark-theme .landing-shell{ background:#0B1120; }
.landing.dark-theme .landing-section:not(.dark){ background:#0B1120; }
.landing.dark-theme .landing-section:not(.dark) h2{ color:#F5F3EC; }
.landing.dark-theme .landing-section:not(.dark) p.lead{ color:#9AA6D6; }
.landing.dark-theme .step-body b{ color:#F5F3EC; }
.landing.dark-theme .step-body span{ color:#9AA6D6; }
.landing.dark-theme .step-num{ background:#182959; color:var(--amber); }
.landing.dark-theme .landing-footer{ background:#111B40; border-top:1px solid #22316B; }
.landing.dark-theme .landing-footer h2{ color:#F5F3EC; }
.landing.dark-theme .landing-footer p{ color:#9AA6D6; }
.landing.dark-theme .landing-footer .foot-note{ color:#7681AC; }

/* ---------- Dynamic transitions ---------- */
.hero-content{ animation: heroIn .7s cubic-bezier(.25,.8,.35,1) both; }
@keyframes heroIn{ from{ opacity:0; transform:translateY(18px); } to{ opacity:1; transform:translateY(0); } }

.reveal{ opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s cubic-bezier(.25,.8,.35,1); }
.reveal.visible{ opacity:1; transform:translateY(0); }

.landing-btn-primary{ transition:transform .15s ease, box-shadow .15s ease; }
.landing-btn-primary:active{ transform:scale(0.97); }
.landing-btn-primary:hover{ transform:translateY(-1px); }

.feature-card{ transition:transform .2s ease, box-shadow .2s ease, background .2s ease; }
.feature-card:hover{ transform:translateY(-3px); background:rgba(255,255,255,0.1); box-shadow:0 10px 24px rgba(0,0,0,0.25); }

.step-row{ transition:transform .2s ease; }
.step-row:hover{ transform:translateX(3px); }
.step-num{ transition:background .2s ease, color .2s ease; }
.step-row:hover .step-num{ background:var(--amber); color:#241300; }

.carousel-card{ transition:transform .25s ease; }
.carousel-card:hover{ transform:scale(1.04); }

/* ---------- Chat widget ---------- */
.chat-fab{
  position:fixed; bottom:22px; right:18px; z-index:50;
  width:58px; height:58px; border-radius:50%; border:none; cursor:pointer;
  background:var(--amber); color:#241300; display:flex; align-items:center; justify-content:center;
  box-shadow:0 10px 26px rgba(245,166,35,0.45);
  transition:transform .2s ease, box-shadow .2s ease;
}
.chat-fab:hover{ transform:scale(1.06); }
.chat-fab:active{ transform:scale(0.94); }
.chat-fab-ping{
  position:absolute; inset:0; border-radius:50%; background:var(--amber);
  animation:chatPing 2.2s ease-out infinite; z-index:-1;
}
@keyframes chatPing{
  0%{ transform:scale(1); opacity:0.55; }
  100%{ transform:scale(1.7); opacity:0; }
}
.chat-panel{
  position:fixed; right:0; left:0; bottom:0; z-index:55;
  display:flex; justify-content:flex-end;
  animation:fadeIn .18s ease;
}
.chat-panel-inner{
  width:80%; max-width:340px; height:72vh; max-height:600px;
  background:var(--paper-2); border-radius:18px;
  margin:0 10px 10px 0;
  display:flex; flex-direction:column; overflow:hidden;
  box-shadow:0 -10px 40px rgba(0,0,0,0.3);
  animation:slideUp .22s cubic-bezier(.25,.8,.35,1);
}
.chat-header{
  background:var(--ink); color:#fff; padding:16px 18px;
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
}
.chat-header-title{ display:flex; align-items:center; gap:10px; }
.chat-header-title .dot{
  width:9px; height:9px; border-radius:50%; background:#22C55E;
  box-shadow:0 0 0 3px rgba(34,197,94,0.25);
}
.chat-header-title b{ font-family:'Space Grotesk',sans-serif; font-size:0.95rem; display:block; }
.chat-header-title span{ font-size:0.7rem; color:#9AA6D6; }
.chat-close-btn{
  width:32px; height:32px; border-radius:9px; border:none; background:var(--amber);
  display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  transition:transform .15s ease;
}
.chat-close-btn:hover{ transform:scale(1.06); }
.chat-close-btn:active{ transform:scale(0.92); }
.chat-messages{
  flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px;
  background:var(--paper);
}
.chat-bubble{
  max-width:82%; padding:10px 13px; border-radius:14px; font-size:0.86rem; line-height:1.45;
  animation:bubbleIn .2s ease;
}
@keyframes bubbleIn{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:translateY(0); } }
.chat-bubble.bot{
  background:var(--paper-2); color:var(--ink); border:1px solid var(--line);
  align-self:flex-start; border-bottom-left-radius:4px;
}
.chat-bubble.user{
  background:var(--ink); color:#fff; align-self:flex-end; border-bottom-right-radius:4px;
}
.chat-bubble.admin{
  background:#DFF5E6; color:#0F7A3D; border:1px solid #BFE8CC;
  align-self:flex-start; border-bottom-left-radius:4px;
}
.chat-bubble-tag{
  display:block; font-size:0.64rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em;
  margin-bottom:3px; opacity:0.8;
}
.chat-quick-replies{ display:flex; flex-direction:column; gap:8px; margin-top:4px; }
.chat-quick-btn{
  text-align:left; background:var(--paper-2); border:1px solid var(--line); border-radius:11px;
  padding:10px 12px; font-size:0.82rem; color:var(--ink); cursor:pointer;
  font-family:'Inter',sans-serif; transition:border-color .15s ease, background .15s ease;
}
.chat-quick-btn:hover{ border-color:var(--teal); background:#E1F4F3; }
.chat-contact-form{
  background:var(--paper-2); border:1px solid var(--line); border-radius:12px; padding:12px; margin-top:4px;
}
.chat-contact-form input{
  width:100%; border:1px solid var(--line); border-radius:9px; padding:9px 11px; margin-bottom:8px;
  font-size:0.84rem; font-family:'Inter',sans-serif; outline:none; background:var(--paper);
}
.chat-contact-form input:focus{ border-color:var(--teal); }
.chat-contact-submit{
  width:100%; background:var(--teal); color:#fff; border:none; border-radius:9px; padding:10px;
  font-size:0.84rem; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif;
}
.chat-input-row{
  display:flex; gap:8px; padding:12px; border-top:1px solid var(--line); background:var(--paper-2);
  flex-shrink:0;
}
.chat-input-row input{
  flex:1; border:1px solid var(--line); border-radius:999px; padding:11px 16px;
  font-size:0.86rem; font-family:'Inter',sans-serif; outline:none; background:var(--paper);
}
.chat-input-row input:focus{ border-color:var(--teal); }
.chat-send-btn{
  width:42px; height:42px; border-radius:50%; border:none; background:var(--amber); color:#241300;
  display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
}
.chat-send-btn:active{ transform:scale(0.92); }
`;

/* ---------------------------------------------------------------- */
/* Helpers                                                            */
/* ---------------------------------------------------------------- */

function cityCode(name) {
  const clean = (name || '').trim().replace(/[^a-zA-ZÀ-ÿ]/g, '');
  return (clean.slice(0, 3) || 'XXX').toUpperCase();
}
const ADMIN_PAGE_SIZE = 8;
// Case/accent-insensitive filter + pagination, shared by every admin list.
function searchPaginate(items, query, getSearchableText, page) {
  const norm = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const q = norm(query.trim());
  const filtered = q ? items.filter((it) => norm(getSearchableText(it)).includes(q)) : items;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * ADMIN_PAGE_SIZE;
  return {
    items: filtered.slice(start, start + ADMIN_PAGE_SIZE),
    total: filtered.length,
    totalPages,
    page: safePage,
  };
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
}
function fcfa(n) {
  return Math.round(n || 0).toLocaleString('fr-FR') + ' FCFA';
}
function onlyDigits(v, max = 10) {
  return v.replace(/\D/g, '').slice(0, max);
}
function onlyLetters(v) {
  // Lettres (accents compris), espaces, tirets et apostrophes pour les noms composés.
  return v.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ' -]/g, '');
}
function isValidIvorianPhone(v) {
  // Depuis 2021, les numéros ivoiriens comptent 10 chiffres et commencent par 0
  // (ex. 07/05/01 pour le mobile, 21/25/27 pour le fixe).
  return /^0\d{9}$/.test(v);
}
/* ---------------------------------------------------------------- */
/* Shared input security / validation helpers                        */
/* Defense in depth: React already escapes everything it renders, so */
/* this can't be "hacked" via the UI — but stripping markup-looking   */
/* characters and enforcing sane length/number bounds keeps stored    */
/* data clean and prevents obviously bad input from ever being saved. */
/* ---------------------------------------------------------------- */
function sanitizeText(v, max = 200) {
  return v
    .replace(/[<>`]/g, '') // strip characters with no legitimate use in free text here
    .slice(0, max);
}
function clampNumber(raw, { min = 0, max = Infinity } = {}) {
  const n = parseFloat(raw);
  if (isNaN(n)) return '';
  return String(Math.min(Math.max(n, min), max));
}
function isNonEmptyText(v, minLen = 1) {
  return v.trim().length >= minLen;
}
function mapsRouteUrl(origin, destination) {
  return (
    'https://www.google.com/maps/dir/?api=1&origin=' +
    encodeURIComponent(origin) +
    '&destination=' +
    encodeURIComponent(destination) +
    '&travelmode=driving'
  );
}
function mapsLiveUrl(lat, lng) {
  return 'https://www.google.com/maps?q=' + lat + ',' + lng;
}
function mapsLiveEmbedUrl(lat, lng) {
  return 'https://www.google.com/maps?q=' + lat + ',' + lng + '&z=15&output=embed';
}
function formatAgo(ms) {
  if (ms < 60000) return "à l'instant";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}
function compressImage(file, maxWidth = 480, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('image load failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}
// Same idea as compressImage, but starting from a data URL we already have
// in hand (e.g. a frame captured live from the camera) rather than a File.
function resizeDataUrl(dataUrl, maxWidth = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = dataUrl;
  });
}

const STATUS_META = {
  en_attente: { label: 'En attente de validation', color: 'var(--amber-dark)', bg: '#FDF0DA' },
  accepte: { label: 'Accepté · paiement à venir', color: 'var(--teal-dark)', bg: '#E1F4F3' },
  refuse: { label: 'Refusé', color: 'var(--coral)', bg: '#FBE4E1' },
  paye: { label: 'Payé · fonds sécurisés', color: 'var(--teal-dark)', bg: '#E1F4F3' },
  expedie: { label: 'Colis en transit', color: 'var(--amber-dark)', bg: '#FDF0DA' },
  livre: { label: 'Livré · paiement libéré', color: '#0F7A3D', bg: '#DFF5E6' },
};

// Admin status now comes from the real `profiles.est_admin` column in
// Supabase (see isAdmin below), not a hardcoded address.

function AdminSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="admin-search">
      <Search size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Rechercher…'}
        inputMode="search"
      />
      {value && (
        <button type="button" className="admin-search-clear" onClick={() => onChange('')} aria-label="Effacer">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function AdminPagination({ page, totalPages, onChange, totalItems }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return (
    <div className="admin-pagination">
      <span className="admin-pagination-count">{totalItems} résultat{totalItems > 1 ? 's' : ''}</span>
      <div className="admin-pagination-controls">
        <button
          type="button"
          className="admin-page-btn"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Page précédente"
        >
          <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={'e' + i} className="admin-page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={'admin-page-btn' + (p === page ? ' active' : '')}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="admin-page-btn"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Page suivante"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.en_attente;
  return (
    <span className="badge" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function FieldError({ show, children }) {
  if (!show) return null;
  return (
    <div className="field-error">
      <XCircle size={12} />
      {children}
    </div>
  );
}

const CAROUSEL_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&q=70&auto=format&fit=crop',
    cap: 'Voyageurs en route',
  },
  {
    src: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=70&auto=format&fit=crop',
    cap: 'Bagages disponibles',
  },
  {
    src: 'https://images.unsplash.com/photo-1553413077-190083ec01c6?w=500&q=70&auto=format&fit=crop',
    cap: 'Colis prêts à partir',
  },
  {
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&q=70&auto=format&fit=crop',
    cap: 'Suivi en temps réel',
  },
  {
    src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&q=70&auto=format&fit=crop',
    cap: 'Sur la route',
  },
  {
    src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=70&auto=format&fit=crop',
    cap: 'Remise en main propre',
  },
];

const FAQS = [
  {
    q: 'Comment envoyer un colis ?',
    a: "Inscrivez-vous, recherchez un trajet publié par un voyageur avant son départ, remplissez le formulaire d'expédition (description, poids, valeur, tarif proposé), puis validez le paiement une fois le voyageur d'accord.",
    keywords: ['envoyer', 'expédier', 'expedier', 'colis'],
  },
  {
    q: 'Comment publier un trajet ?',
    a: "Depuis l'onglet Trajets, appuyez sur \"Publier un trajet\". Une vérification d'identité (pièce officielle + selfie) est requise avant votre première publication, traitée sous 24h.",
    keywords: ['publier', 'trajet', 'voyageur'],
  },
  {
    q: 'Est-ce sécurisé ?',
    a: 'Oui : le paiement de l\'expéditeur reste bloqué jusqu\'à la confirmation de livraison par un code de retrait et une vérification d\'identité du destinataire.',
    keywords: ['sécur', 'securit', 'fiable', 'confiance', 'risque'],
  },
  {
    q: "Quel est le tarif ?",
    a: 'Le tarif est fixé librement entre expéditeur et voyageur. À la livraison, 70% revient au voyageur et 30% de commission à la plateforme.',
    keywords: ['tarif', 'prix', 'coût', 'cout', 'commission', 'fcfa'],
  },
  {
    q: 'Comment vérifier mon identité ?',
    a: "Lors de votre première publication de trajet, renseignez vos informations et prenez une photo de votre pièce d'identité ainsi qu'un selfie. Notre équipe traite la demande sous 24h.",
    keywords: ['identité', 'identite', 'vérif', 'verif', 'kyc', 'pièce'],
  },
  {
    q: 'Comment suivre mon colis ?',
    a: "Une fois le paiement validé, vous pouvez appeler le voyageur directement et suivre sa position en direct sur Google Maps s'il a activé le partage de position.",
    keywords: ['suivre', 'suivi', 'position', 'localisation', 'où est'],
  },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ---------------------------------------------------------------- */
/* Landing page                                                       */
/* ---------------------------------------------------------------- */
function LandingPage({ onStart, sessionDebug }) {
  const loopImages = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];
  const [stepsRef, stepsVisible] = useReveal();
  const [featRef, featVisible] = useReveal();
  const [footRef, footVisible] = useReveal();
  const [darkTheme, setDarkTheme] = useState(false);
  return (
    <div className={'landing' + (darkTheme ? ' dark-theme' : '')}>
      <style>{STYLES}</style>
      {sessionDebug && (
        <div className="session-debug-banner">
          ⚠️ Diagnostic : {sessionDebug}
        </div>
      )}
      <div className="landing-shell">
        <div className="landing-hero">
          <div className="hero-bg">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=900&q=75&auto=format&fit=crop"
              alt="Voyageur sur la route"
            />
            <div className="hero-overlay" />
          </div>

          <div className="hero-content">
            <div className="landing-brand">
              <div className="mark">
                <Package color="#241300" size={22} />
              </div>
              <span className="name">ColisGo‑Express</span>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setDarkTheme((v) => !v)}
                aria-label="Changer de mode jour/nuit"
                title={darkTheme ? 'Passer en mode jour' : 'Passer en mode nuit'}
              >
                {darkTheme ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>

            <div className="hero-headline">
              <h1>
                <span>Expédier un colis</span> n'importe où, porté par quelqu'un qui y va déjà.
              </h1>
              <p className="sub">
                La marketplace ivoirienne qui connecte voyageurs et expéditeurs : trajets vérifiés,
                paiement sécurisé, suivi en direct — du dépôt jusqu'à la remise en main propre.
              </p>
            </div>

            <div className="landing-cta-row">
              <button className="landing-btn-primary" onClick={onStart}>
                Commencer <ArrowRight size={16} />
              </button>
            </div>

            <div className="landing-stats">
              <div className="landing-stat">
                <b>70&nbsp;%</b>
                <span>reversés au voyageur</span>
              </div>
              <div className="landing-stat">
                <b>24h</b>
                <span>vérification d'identité</span>
              </div>
              <div className="landing-stat">
                <b>100%</b>
                <span>paiement sécurisé</span>
              </div>
            </div>
          </div>

          <div className="carousel-wrap">
            <div className="carousel-track">
              {loopImages.map((img, i) => (
                <div className="carousel-card" key={i}>
                  <img src={img.src} alt={img.cap} loading="lazy" />
                  <div className="cap">{img.cap}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={'landing-section reveal ' + (stepsVisible ? 'visible' : '')} ref={stepsRef}>
          <h2>Comment ça marche</h2>
          <p className="lead">Trois étapes simples, du départ du voyageur à la remise du colis.</p>

          <div className="step-row">
            <div className="step-num">01</div>
            <div className="step-body">
              <b>Publiez ou recherchez un trajet</b>
              <span>
                Un voyageur publie son trajet et sa capacité disponible ; un expéditeur recherche un
                trajet avant son départ.
              </span>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">02</div>
            <div className="step-body">
              <b>Payez en toute sécurité</b>
              <span>
                L'expéditeur propose un tarif, le voyageur accepte, le paiement reste sécurisé jusqu'à la
                livraison confirmée.
              </span>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">03</div>
            <div className="step-body">
              <b>Suivez et confirmez la remise</b>
              <span>
                Un code de retrait et une vérification d'identité protègent la remise ; les fonds sont
                ensuite débloqués pour le voyageur.
              </span>
            </div>
          </div>
        </div>

        <div className={'landing-section dark reveal ' + (featVisible ? 'visible' : '')} ref={featRef}>
          <h2>Pensé pour la confiance</h2>
          <p className="lead">Chaque trajet et chaque envoi sont encadrés du début à la fin.</p>
          <div className="feature-grid">
            <div className="feature-card">
              <BadgeCheck size={20} />
              <b>Voyageurs vérifiés</b>
              <span>Pièce d'identité et selfie contrôlés par notre équipe avant publication.</span>
            </div>
            <div className="feature-card">
              <ShieldCheck size={20} />
              <b>Paiement sécurisé</b>
              <span>Les fonds restent bloqués jusqu'à la confirmation de la livraison.</span>
            </div>
            <div className="feature-card">
              <MapPin size={20} />
              <b>Suivi en direct</b>
              <span>Localisez le trajet de votre colis sur la carte, en temps réel.</span>
            </div>
            <div className="feature-card">
              <Star size={20} />
              <b>Avis vérifiés</b>
              <span>Chaque voyageur est noté par les expéditeurs après chaque livraison.</span>
            </div>
          </div>
        </div>

        <div className={'landing-footer reveal ' + (footVisible ? 'visible' : '')} ref={footRef}>
          <h2>Prêt à envoyer votre premier colis ?</h2>
          <p>Créez votre compte en quelques secondes, par e-mail ou avec Google.</p>
          <button className="landing-btn-primary" style={{ width: '100%' }} onClick={onStart}>
            <Mail size={18} /> Se connecter / Créer un compte
          </button>
          <p className="foot-note">
            Prototype fonctionnel — les trajets, paiements et vérifications sont simulés à des fins de
            démonstration.
          </p>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Chat widget (FAQ + contact administrateur)                        */
/* ---------------------------------------------------------------- */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [identity, setIdentity] = useState(null); // {name, email, token} once identified
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [idName, setIdName] = useState('');
  const [idEmail, setIdEmail] = useState('');

  const [thread, setThread] = useState([]); // persisted messages with this support
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const pollRef = useRef(null);
  const sendQueueRef = useRef(Promise.resolve());

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // Load a remembered identity + conversation token (if this visitor has
  // chatted before) once. The token acts as this visitor's private session
  // key for the `chat-support` Edge Function — nobody else can read their
  // thread without it, since they have no Supabase account to authenticate.
  useEffect(() => {
    (async () => {
      try {
        const stored = await localStore.get('colisgo:chatIdentity', false);
        if (stored && stored.value) setIdentity(JSON.parse(stored.value));
      } catch (e) {}
      setIdentityLoaded(true);
    })();
  }, []);

  const loadThread = async (token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-support`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', conversation_token: token }),
      });
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setThread((prevLocal) => {
          const faqOnly = prevLocal.filter((m) => m.from === 'faq' || m.from === 'faq-answer');
          const real = data.messages.map((m) => ({
            id: m.id,
            from: m.expediteur === 'support' ? 'admin' : 'user',
            text: m.contenu,
            createdAt: new Date(m.created_at).getTime(),
          }));
          return [...faqOnly, ...real].sort((a, b) => a.createdAt - b.createdAt);
        });
      }
    } catch (e) {}
  };

  // While the chat is open, poll for new messages (e.g. an admin reply).
  useEffect(() => {
    if (open && identity) {
      loadThread(identity.token);
      pollRef.current = setInterval(() => loadThread(identity.token), 6000);
      return () => clearInterval(pollRef.current);
    }
  }, [open, identity]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, open]);

  const startIdentification = async () => {
    if (idName.trim().length < 2 || !isValidEmail(idEmail)) return;
    const token =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    const info = { name: idName.trim(), email: idEmail.trim(), token };
    setIdentity(info);
    try {
      await localStore.set('colisgo:chatIdentity', JSON.stringify(info), false);
    } catch (e) {}
  };

  const askFaq = (faq) => {
    setThread((prev) => [
      ...prev,
      { id: 'local-' + Date.now(), from: 'faq', text: faq.q, createdAt: Date.now() },
      { id: 'local-' + (Date.now() + 1), from: 'faq-answer', text: faq.a, createdAt: Date.now() + 1 },
    ]);
  };

  // Writes are queued one at a time (never in parallel) and retried up to 5
  // times with growing delays — the same fix that solved the earlier
  // "Échec de l'enregistrement" issue for the rest of the app's data.
  const writeSupportMessage = async (msg) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-support`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            conversation_token: msg.token,
            visiteur_nom: msg.senderName,
            visiteur_email: msg.senderEmail,
            contenu: msg.text,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return true;
        throw new Error(data.error || 'Échec');
      } catch (e) {
        if (attempt < 4) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    return false;
  };

  const persistSupportMessage = (msg) => {
    const job = sendQueueRef.current.then(
      () => writeSupportMessage(msg),
      () => writeSupportMessage(msg)
    );
    sendQueueRef.current = job.catch(() => false);
    return job;
  };

  const [sending, setSending] = useState(false);
  const lastSentAtRef = useRef(0);

  const handleSend = async () => {
    const text = sanitizeText(input.trim(), 500);
    if (!text || !identity || sending) return;
    const now = Date.now();
    if (now - lastSentAtRef.current < 1500) return; // basic anti-spam: 1 message / 1.5s
    lastSentAtRef.current = now;
    setSending(true);
    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      senderEmail: identity.email,
      senderName: identity.name,
      token: identity.token,
      from: 'user',
      text,
      createdAt: Date.now(),
    };
    setInput('');
    setThread((prev) => [...prev, msg]);
    const ok = await persistSupportMessage(msg);
    setSending(false);
    if (!ok) {
      setThread((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          from: 'bot',
          text: "Votre message n'a pas pu être transmis au support (connexion instable). Réessayez dans un instant.",
          createdAt: Date.now(),
        },
      ]);
    }
  };

  const hasRealMessage = thread.some((m) => m.from === 'user');

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Ouvrir le chat">
        <span className="chat-fab-ping" />
        <MessageCircle size={26} />
      </button>

      {open && (
        <div className="chat-panel" onClick={() => setOpen(false)}>
          <div className="chat-panel-inner" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-header-title">
                <span className="dot" />
                <div>
                  <b>Support ColisGo‑Express</b>
                  <span>{identity ? identity.name : 'Généralement en ligne'}</span>
                </div>
              </div>
              <button className="chat-close-btn" onClick={() => setOpen(false)}>
                <X size={16} color="#241300" />
              </button>
            </div>

            {!identityLoaded ? (
              <div className="chat-messages" />
            ) : !identity ? (
              <div className="chat-messages">
                <div className="chat-bubble bot">
                  Bonjour 👋 Avant d'envoyer un message au support ColisGo‑Express, indiquez-nous votre
                  nom complet et votre e-mail. Vous pourrez ensuite discuter directement avec nous.
                </div>
                <div className="chat-contact-form">
                  <input
                    placeholder="Nom complet"
                    value={idName}
                    onChange={(e) => setIdName(onlyLetters(e.target.value).slice(0, 60))}
                    maxLength={60}
                  />
                  <input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={idEmail}
                    onChange={(e) => setIdEmail(e.target.value.trim().slice(0, 120))}
                    onKeyDown={(e) => e.key === 'Enter' && startIdentification()}
                    maxLength={120}
                  />
                  <button
                    className="chat-contact-submit"
                    disabled={idName.trim().length < 2 || !isValidEmail(idEmail)}
                    style={{ opacity: idName.trim().length >= 2 && isValidEmail(idEmail) ? 1 : 0.5 }}
                    onClick={startIdentification}
                  >
                    Commencer la discussion
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-messages" ref={scrollRef}>
                  <div className="chat-bubble bot">
                    Bonjour {identity.name.split(' ')[0]} 👋 Choisissez une question ci-dessous ou
                    écrivez directement votre message au support.
                  </div>

                  {thread.map((m) => (
                    <div
                      key={m.id}
                      className={
                        'chat-bubble ' +
                        (m.from === 'user'
                          ? 'user'
                          : m.from === 'admin'
                          ? 'admin'
                          : m.from === 'faq'
                          ? 'user'
                          : 'bot')
                      }
                    >
                      {m.from === 'admin' && <span className="chat-bubble-tag">Support</span>}
                      {m.text}
                    </div>
                  ))}

                  {!hasRealMessage && (
                    <div className="chat-quick-replies">
                      {FAQS.map((f) => (
                        <button key={f.q} className="chat-quick-btn" onClick={() => askFaq(f)}>
                          {f.q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="chat-input-row">
                  <input
                    placeholder="Écrivez votre message au support…"
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    maxLength={500}
                    disabled={sending}
                  />
                  <button className="chat-send-btn" onClick={handleSend} disabled={sending} aria-label="Envoyer">
                    <Send size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* App                                                                */
/* ---------------------------------------------------------------- */

export default function App() {
  // Synchronous, best-effort check for a stored session — read directly so
  // we know, before the very first paint, whether to show the loading
  // indicator over a neutral app shell (likely already logged in) or over
  // the marketing landing page (likely a fresh visitor). This is what stops
  // a pull-to-refresh from flashing the landing page for a logged-in user.
  const likelyLoggedIn = (() => {
    try {
      const raw = localStorage.getItem('colisgo:session');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed && parsed.access_token);
    } catch (e) {
      return false;
    }
  })();

  const [loading, setLoading] = useState(true);
  const [sessionDebug, setSessionDebug] = useState(''); // visible diagnostic if session restore fails
  const [lightboxImage, setLightboxImage] = useState(null); // full-screen photo viewer (admin)
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null); // {access_token, refresh_token, expires_at}
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});

  const [tab, setTab] = useState('trajets');
  const hasRestoredTabRef = useRef(false); // guards against overwriting a saved tab before it's restored
  const [search, setSearch] = useState('');
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [pendingIdentityAction, setPendingIdentityAction] = useState(null); // {type:'publish'} | {type:'sendShipment', trip}
  const [showKycStatus, setShowKycStatus] = useState(false);
  const [mesTrajetsView, setMesTrajetsView] = useState('trajets'); // 'trajets' | 'colis'
  const [adminSection, setAdminSection] = useState('kyc');
  const [searchKyc, setSearchKyc] = useState('');
  const [pageKyc, setPageKyc] = useState(1);
  const [searchTrips, setSearchTrips] = useState('');
  const [pageTrips, setPageTrips] = useState(1);
  const [searchShipments, setSearchShipments] = useState('');
  const [pageShipments, setPageShipments] = useState(1);
  const [searchUsers, setSearchUsers] = useState('');
  const [pageUsers, setPageUsers] = useState(1);
  const [searchReviews, setSearchReviews] = useState('');
  const [pageReviews, setPageReviews] = useState(1);
  const [searchWithdrawals, setSearchWithdrawals] = useState('');
  const [pageWithdrawals, setPageWithdrawals] = useState(1);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [shipTripTarget, setShipTripTarget] = useState(null);
  const [codeInputs, setCodeInputs] = useState({});
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [envoisFilter, setEnvoisFilter] = useState('attente'); // 'attente' | 'transit' | 'livre'
  const [expandedShipments, setExpandedShipments] = useState({}); // { [id]: boolean }
  const [expandedTrips, setExpandedTrips] = useState({}); // { [id]: boolean } — trip browsing cards
  const [expandedKyc, setExpandedKyc] = useState({}); // { [id]: boolean } — admin KYC cards
  const [expandedAdminTrips, setExpandedAdminTrips] = useState({}); // { [id]: boolean } — admin trip cards
  const [priceEdits, setPriceEdits] = useState({});
  const [changeTripFor, setChangeTripFor] = useState(null);
  const [paymentFor, setPaymentFor] = useState(null); // shipment awaiting operator choice
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState(null); // trip object or null
  const [viewReviewsFor, setViewReviewsFor] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const knownStatusRef = useRef({});
  const notifPollRef = useRef(null);

  // Write queue: guarantees saves never run in parallel, and everything is
  // combined into ONE storage key written together. This is what was
  // causing "Échec de l'enregistrement" — writing trips, shipments and
  // withdrawals as three separate keys meant up to three save requests
  // could fire at nearly the same moment and collide.
  const saveChain = useRef(Promise.resolve());
  const watchIdsRef = useRef({});
  const lastLocUpdateRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(watchIdsRef.current).forEach((wid) => {
        try {
          navigator.geolocation.clearWatch(wid);
        } catch (e) {}
      });
    };
  }, []);

  const notify = useCallback((message, type = 'default') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  }, []);

  // Real browser notifications — these fire even if the app tab is in the
  // background, but NOT if the phone is locked/asleep or the browser is
  // fully closed. True OS-level push while asleep would require a real
  // push server (service worker + VAPID keys), which this prototype,
  // running inside a sandboxed preview, cannot host.
  const notifyDevice = useCallback(
    (title, body) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      try {
        new Notification(title, { body, tag: 'colisgo-' + Date.now() });
      } catch (e) {}
    },
    []
  );

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      notify("Les notifications ne sont pas prises en charge par cet appareil", 'error');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        notify('Notifications activées', 'success');
        notifyDevice('ColisGo‑Express', 'Les notifications sont activées sur cet appareil.');
      } else {
        notify('Notifications refusées — vous pouvez les activer dans les réglages du navigateur', 'error');
      }
    } catch (e) {
      notify("Impossible d'activer les notifications", 'error');
    }
  };

  // No-op wrapper kept so existing call sites (withBusy(async () => {...}))
  // keep working unchanged — it just runs the action directly now, with no
  // loading indicator or artificial delay.
  const withBusy = useCallback((fn) => fn(), []);

  const changeTab = useCallback((next) => setTab(next), []);

  useEffect(() => {
    if (!profile || !hasRestoredTabRef.current) return;
    localStore.set('colisgo:lastTab', tab, false).catch(() => {});
  }, [tab, profile]);

  useEffect(() => {
    if (!profile || !hasRestoredTabRef.current) return;
    localStore.set('colisgo:lastAdminSection', adminSection, false).catch(() => {});
  }, [adminSection, profile]);

  useEffect(() => {
    (async () => {
      // Google OAuth redirect comes back with tokens in the URL hash.
      if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token) {
          try {
            const userData = await sbAuthGet('user', access_token);
            await applyAuthResult({
              access_token,
              refresh_token,
              expires_in: parseInt(params.get('expires_in') || '3600', 10),
              user: userData,
            });
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } catch (e) {}
        }
      } else {
        try {
          const s = await localStore.get('colisgo:session', false);
          if (s && s.value) {
            let parsed;
            try {
              parsed = JSON.parse(s.value);
            } catch (parseErr) {
              console.error('[ColisGo] Session stockée illisible, on repart de zéro :', parseErr, s.value);
              setSessionDebug('Session illisible (' + String(parseErr.message || parseErr) + ')');
              parsed = null;
            }
            if (parsed && parsed.expires_at > Date.now()) {
              setSession(parsed);
              try {
                const row = await fetchProfileRow(parsed.user_id, parsed.email, parsed.access_token);
                setProfile(
                  row || {
                    id: parsed.user_id,
                    email: parsed.email,
                    name: nameFromEmail(parsed.email),
                    estAdmin: false,
                    verified: false,
                  }
                );
              } catch (profileErr) {
                console.error('[ColisGo] Échec de la récupération du profil au démarrage :', profileErr);
                // Keep the user logged in even if the profile fetch hiccups —
                // a minimal fallback profile beats being bounced to the
                // landing page after a simple refresh.
                setProfile({
                  id: parsed.user_id,
                  email: parsed.email,
                  name: nameFromEmail(parsed.email),
                  estAdmin: false,
                  verified: false,
                });
              }
              // Restore the tab/admin-section the person was on before the
              // refresh, so a page reload doesn't bounce them back to the
              // default screen.
              try {
                const savedTab = await localStore.get('colisgo:lastTab');
                if (savedTab && savedTab.value) setTab(savedTab.value);
                const savedSection = await localStore.get('colisgo:lastAdminSection');
                if (savedSection && savedSection.value) setAdminSection(savedSection.value);
              } catch (e) {}
              hasRestoredTabRef.current = true;
            } else if (parsed) {
              // Expired — try to refresh silently.
              try {
                const refreshed = await sbAuth('token?grant_type=refresh_token', {
                  refresh_token: parsed.refresh_token,
                });
                await applyAuthResult(refreshed);
              } catch (refreshErr) {
                console.error('[ColisGo] Échec du rafraîchissement de session au démarrage :', refreshErr);
                setSessionDebug('Rafraîchissement échoué (' + String(refreshErr.message || refreshErr) + ')');
                await clearSession();
              }
            }
          }
        } catch (e) {
          console.error('[ColisGo] Échec de la lecture de la session au démarrage :', e);
          setSessionDebug('Lecture de session échouée (' + String(e.message || e) + ')');
        }
      }
      hasRestoredTabRef.current = true;
      setLoading(false);
    })();
  }, []);

  // Best-effort orientation lock. This only actually takes effect in a
  // fullscreen/standalone (installed-to-home-screen) context — most mobile
  // browsers reject it silently in a normal tab, which is why the CSS
  // landscape overlay below is the real, universal fallback.
  useEffect(() => {
    const tryLock = () => {
      try {
        const orientation = screen.orientation;
        if (orientation && orientation.lock) {
          orientation.lock('portrait').catch(() => {});
        }
      } catch (e) {}
    };
    tryLock();
    document.addEventListener('fullscreenchange', tryLock);
    return () => document.removeEventListener('fullscreenchange', tryLock);
  }, []);

  // Poll for changes made by the other party (traveler/sender/admin) in
  // their own session, and fire a device notification when something
  // relevant happens for the logged-in profile. This only works while this
  // browser tab stays open — see the note on notifyDevice above.
  useEffect(() => {
    if (!profile) return;

    const seedKnownStatuses = (list) => {
      list.forEach((s) => {
        knownStatusRef.current[s.id] = s.status;
      });
    };
    seedKnownStatuses(shipments);

    const poll = async () => {
      // Refresh the real data first (source of truth), then diff statuses
      // against what we knew before to decide which notifications to fire.
      const freshShipments = await loadMatchings().catch(() => null);
      if (freshShipments) {
        freshShipments.forEach((s) => {
          const prevStatus = knownStatusRef.current[s.id];
          if (prevStatus === undefined) {
            knownStatusRef.current[s.id] = s.status;
            if (s.voyageurEmail === profile.email && s.status === 'en_attente') {
              notifyDevice('Nouvelle demande de colis', `${s.expediteurName} propose un colis sur votre trajet ${s.tripFrom} → ${s.tripTo}.`);
            }
            return;
          }
          if (prevStatus === s.status) return;
          knownStatusRef.current[s.id] = s.status;

          const isMineAsVoyageur = s.voyageurEmail === profile.email;
          const isMineAsExpediteur =
            (s.expediteurEmail ? s.expediteurEmail === profile.email : s.expediteurName === profile.name);

          if (s.status === 'accepte' && isMineAsExpediteur) {
            notifyDevice('Demande acceptée', `${s.voyageurName} a accepté votre colis. Vous pouvez procéder au paiement.`);
          }
          if (s.status === 'refuse' && isMineAsExpediteur) {
            notifyDevice('Demande refusée', `${s.voyageurName} a refusé votre colis.`);
          }
          if (prevStatus === 'accepte' && (s.status === 'paye' || s.status === 'expedie') && isMineAsExpediteur) {
            // The moment the "Payer" button disappears — confirm it loudly
            // and in-app (not just as a device notification) so it's not missed.
            notify('Paiement effectué avec succès ✅', 'success');
          }
          if (s.status === 'paye' && isMineAsVoyageur) {
            notifyDevice('Paiement reçu', `Le paiement pour le colis de ${s.expediteurName} est confirmé.`);
          }
          if (s.status === 'expedie' && isMineAsExpediteur) {
            notifyDevice('Colis expédié', `Votre colis est en transit sur le trajet ${s.tripFrom} → ${s.tripTo}.`);
          }
          if (s.status === 'livre' && (isMineAsVoyageur || isMineAsExpediteur)) {
            notifyDevice('Colis livré', 'La livraison a été confirmée et les fonds ont été débloqués.');
          }
        });
        setShipments(freshShipments);

        // For colis en transit I'm sending, fetch the voyageur's latest
        // shared position (if any) so it shows up on my live map.
        const toTrack = freshShipments.filter(
          (s) => s.status === 'expedie' && s.expediteurEmail === profile.email
        );
        if (toTrack.length) {
          const token = session ? session.access_token : null;
          const positions = {};
          await Promise.all(
            toTrack.map(async (s) => {
              try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/derniere_position`, {
                  method: 'POST',
                  headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ p_matching_id: s.id }),
                });
                const rows = await res.json();
                const p = Array.isArray(rows) ? rows[0] : null;
                if (p && p.latitude != null) {
                  positions[s.id] = {
                    lat: p.latitude,
                    lng: p.longitude,
                    updatedAt: new Date(p.horodatage).getTime(),
                  };
                }
              } catch (e) {}
            })
          );
          if (Object.keys(positions).length) {
            setShipments((prev) =>
              prev.map((s) =>
                positions[s.id] ? { ...s, locationSharing: true, liveLocation: positions[s.id] } : s
              )
            );
          }
        }
      }

      await loadWithdrawals();
      if (profile.estAdmin) {
        loadKycRequests();
        loadAdminWithdrawals();
      }
    };

    notifPollRef.current = setInterval(poll, 10000);
    return () => clearInterval(notifPollRef.current);
  }, [profile, notifyDevice, session]);

  // Coming back to the app after being sent to PayDunya's checkout page (the
  // browser/tab regains focus) is exactly when a stuck "en attente" payment
  // is most likely — check every shipment still awaiting payment right then,
  // instead of waiting for the next 10s poll or a manual retry.
  useEffect(() => {
    if (!profile || !session) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      shipments
        .filter((s) => s.status === 'accepte' && s.expediteurEmail === profile.email)
        .forEach((s) => verifyPayment(s.id));
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, session, shipments]);

  const mapSupportRow = (r) => ({
    id: r.id,
    token: r.conversation_token,
    senderEmail: r.visiteur_email,
    senderName: r.visiteur_nom,
    from: r.expediteur === 'support' ? 'admin' : 'user',
    text: r.contenu,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  });

  const refreshSupportMessages = () =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        const rows = (await sbRest('messages_support?select=*&order=created_at.asc', { token })) || [];
        setSupportMessages(rows.map(mapSupportRow));
        notify('Messages actualisés', 'success');
      } catch (e) {
        notify("Impossible d'actualiser les messages", 'error');
      }
    });

  useEffect(() => {
    if (profile && profile.estAdmin && session) {
      (async () => {
        try {
          const token = session.access_token;
          const rows = (await sbRest('messages_support?select=*&order=created_at.asc', { token })) || [];
          setSupportMessages(rows.map(mapSupportRow));
        } catch (e) {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, profile ? profile.estAdmin : null, session ? session.access_token : null]);

  const sendAdminReply = (convToken, senderEmail, senderName) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      const text = sanitizeText((replyDrafts[convToken] || '').trim(), 500);
      if (!text) return;
      try {
        await sbRest('messages_support', {
          method: 'POST',
          token,
          body: {
            conversation_token: convToken,
            visiteur_nom: senderName,
            visiteur_email: senderEmail,
            expediteur: 'support',
            contenu: text,
          },
        });
        setReplyDrafts((prev) => ({ ...prev, [convToken]: '' }));
        notify('Réponse envoyée', 'success');
        await refreshSupportMessages();
      } catch (e) {
        notify(e.message || "Échec de l'envoi de la réponse — réessayez", 'error');
      }
    });

  const deleteSupportThread = (convToken) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`messages_support?conversation_token=eq.${convToken}`, {
          method: 'DELETE',
          token,
        });
        notify('Conversation supprimée');
        await refreshSupportMessages();
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const fetchProfileRow = async (userId, email, accessToken) => {
    const rows = await sbRest(`profiles?id=eq.${userId}&select=*`, { token: accessToken });
    const row = rows && rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email,
      name: row.nom_complet,
      telephone: row.telephone,
      role: row.role,
      estAdmin: !!row.est_admin,
      verified: row.statut_verification === 'verifie',
      statutVerification: row.statut_verification,
      pieceIdentiteUrl: row.piece_identite_url,
      photoUrl: row.photo_url,
      verificationSoumiseAt: row.verification_soumise_at,
      noteMoyenne: row.note_moyenne,
      nombreLivraisons: row.nombre_livraisons,
      ville: row.ville,
    };
  };

  const persistSession = async (s) => {
    setSession(s);
    try {
      await localStore.set('colisgo:session', JSON.stringify(s), false);
      // Verify the write actually landed — if it didn't, we want to know
      // now (at login) rather than get silently logged out on next refresh.
      const check = await localStore.get('colisgo:session', false);
      if (!check || !check.value) {
        console.error('[ColisGo] La session ne semble pas persister (relecture vide juste après écriture).');
      }
    } catch (e) {
      console.error('[ColisGo] Échec de l’enregistrement de la session :', e);
      notify(
        "Votre session n'a pas pu être enregistrée sur cet appareil — vous devrez peut-être vous reconnecter après un rafraîchissement.",
        'error'
      );
    }
  };
  const clearSession = async () => {
    setSession(null);
    try {
      await localStore.delete('colisgo:session', false);
    } catch (e) {}
  };

  // Access tokens expire after ~1h. A long-lived tab (e.g. filling out the
  // identity verification form, taking photos, etc.) can easily outlast
  // that, so we proactively refresh whenever the token is close to expiry
  // — both on a timer and right before anything that needs a fresh token.
  const ensureFreshSession = async () => {
    if (!session) return null;
    if (session.expires_at - Date.now() > 5 * 60 * 1000) return session; // still good for 5+ min
    try {
      const refreshed = await sbAuth('token?grant_type=refresh_token', {
        refresh_token: session.refresh_token,
      });
      const s = {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: Date.now() + (refreshed.expires_in || 3600) * 1000,
        user_id: refreshed.user.id,
        email: refreshed.user.email,
      };
      await persistSession(s);
      return s;
    } catch (e) {
      return session; // fall back to the current (possibly stale) token
    }
  };

  useEffect(() => {
    if (!session) return;
    const iv = setInterval(ensureFreshSession, 4 * 60 * 1000); // check every 4 min
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session ? session.refresh_token : null]);

  const applyAuthResult = async (data) => {
    const s = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
      user_id: data.user.id,
      email: data.user.email,
    };
    await persistSession(s);
    let row = await fetchProfileRow(s.user_id, s.email, s.access_token);
    if (!row) {
      // First sign-in via Google (or a profile row missing for any reason):
      // create a minimal profile so the rest of the app has something to work with.
      const created = await sbRest('profiles', {
        method: 'POST',
        token: s.access_token,
        prefer: 'return=representation',
        body: {
          id: s.user_id,
          nom_complet: nameFromEmail(s.email),
          telephone: '0000000000',
        },
      }).catch(() => null);
      row = created && created[0] ? await fetchProfileRow(s.user_id, s.email, s.access_token) : null;
    }
    setProfile(
      row || { id: s.user_id, email: s.email, name: nameFromEmail(s.email), estAdmin: false, verified: false }
    );
  };

  const nameFromEmail = (email) => {
    const local = email.split('@')[0] || '';
    return local
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Utilisateur';
  };

  const signInEmail = () =>
    withBusy(async () => {
      setAuthError('');
      setAuthNotice('');
      if (!isValidEmail(emailInput) || passwordInput.length < 6) {
        setAuthError('Adresse e-mail ou mot de passe invalide (6 caractères minimum).');
        return;
      }
      try {
        const data = await sbAuth('token?grant_type=password', {
          email: emailInput.trim(),
          password: passwordInput,
        });
        await applyAuthResult(data);
      } catch (e) {
        setAuthError(
          e.message === 'Invalid login credentials'
            ? 'E-mail ou mot de passe incorrect.'
            : e.message
        );
      }
    });

  const signUpEmail = () =>
    withBusy(async () => {
      setAuthError('');
      setAuthNotice('');
      if (!isValidEmail(emailInput) || passwordInput.length < 6) {
        setAuthError('Adresse e-mail invalide ou mot de passe trop court (6 caractères minimum).');
        return;
      }
      if (signupName.trim().length < 2) {
        setAuthError('Indiquez votre nom complet.');
        return;
      }
      if (!isValidIvorianPhone(signupPhone)) {
        setAuthError('Numéro de téléphone invalide (10 chiffres, ex. 0707123456).');
        return;
      }
      try {
        const data = await sbAuth('signup', { email: emailInput.trim(), password: passwordInput });
        if (!data.access_token) {
          // Email confirmation is required before a session is issued.
          setAuthNotice('Compte créé — vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.');
          setAuthMode('login');
          return;
        }
        await persistSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + (data.expires_in || 3600) * 1000,
          user_id: data.user.id,
          email: data.user.email,
        });
        await sbRest('profiles', {
          method: 'POST',
          token: data.access_token,
          prefer: 'return=representation',
          body: { id: data.user.id, nom_complet: signupName.trim(), telephone: signupPhone },
        });
        const row = await fetchProfileRow(data.user.id, data.user.email, data.access_token);
        setProfile(row);
      } catch (e) {
        setAuthError(
          e.message && e.message.includes('already registered')
            ? 'Un compte existe déjà avec cet e-mail.'
            : e.message
        );
      }
    });

  const loginWithGoogle = () => {
    // Real OAuth via Supabase. This only completes successfully once the app
    // runs on a fixed, deployed URL that's registered as an allowed redirect
    // in Supabase Auth settings — the ephemeral Claude artifact preview URL
    // can't be pre-registered, so this button won't complete the round-trip
    // until the app is actually deployed.
    const redirectTo = encodeURIComponent(window.location.href);
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  };

  const logout = () =>
    withBusy(async () => {
      if (session) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: 'POST',
            headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
          });
        } catch (e) {}
      }
      await clearSession();
      setProfile(null);
      setEmailInput('');
      setPasswordInput('');
      setTab('trajets');
      try {
        await localStore.delete('colisgo:lastTab');
        await localStore.delete('colisgo:lastAdminSection');
      } catch (e) {}
    });

  /* ---- identity verification (real: `profiles` columns + `kyc` bucket) ---- */
  // Real statuses: 'en_attente' (default) + no documents yet = not submitted;
  // 'en_attente' + documents present = awaiting admin review; 'verifie' /
  // 'rejete' are only ever set by an admin (enforced by a DB trigger).
  const myKycStatus = !profile
    ? 'none'
    : profile.statutVerification === 'verifie'
    ? 'approved'
    : profile.statutVerification === 'rejete'
    ? 'rejected'
    : profile.pieceIdentiteUrl
    ? 'pending'
    : 'none';

  const requestPublishTrip = () => {
    if (myKycStatus === 'approved') {
      setShowTripForm(true);
    } else if (myKycStatus === 'pending') {
      setShowKycStatus(true);
    } else {
      setPendingIdentityAction({ type: 'publish' });
      setShowVerifyForm(true);
    }
  };

  const requestSendShipment = (trip) => {
    if (myKycStatus === 'approved') {
      setShipTripTarget(trip);
    } else if (myKycStatus === 'pending') {
      setShowKycStatus(true);
    } else {
      setPendingIdentityAction({ type: 'sendShipment', trip });
      setShowVerifyForm(true);
    }
  };

  const submitVerification = (data) =>
    withBusy(async () => {
      const fresh = await ensureFreshSession();
      const token = fresh ? fresh.access_token : null;
      if (!token) {
        notify('Session expirée — reconnectez-vous', 'error');
        return;
      }
      try {
        const [pieceUrl, selfieUrl] = await Promise.all([
          sbUpload('kyc', `${profile.id}/piece-${Date.now()}.jpg`, data.docImage, token),
          sbUpload('kyc', `${profile.id}/selfie-${Date.now()}.jpg`, data.selfieImage, token),
        ]);
        await sbRest(`profiles?id=eq.${profile.id}`, {
          method: 'PATCH',
          token,
          body: {
            telephone: data.telephone.trim(),
            date_naissance: data.dateNaissance,
            lieu_naissance: data.lieuNaissance.trim(),
            type_piece_identite: data.docType,
            piece_identite_url: pieceUrl,
            photo_url: selfieUrl,
            statut_verification: 'en_attente',
            verification_soumise_at: new Date().toISOString(),
          },
        });
        const row = await fetchProfileRow(profile.id, profile.email, token);
        setProfile(row);
        setShowVerifyForm(false);
        setPendingIdentityAction(null);
        notify('Vérification envoyée — traitement par notre équipe sous 24h', 'success');
      } catch (e) {
        notify(e.message || "Échec de l'envoi de la vérification", 'error');
      }
    });

  const decideKyc = (userId, decision) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`profiles?id=eq.${userId}`, {
          method: 'PATCH',
          token,
          body: { statut_verification: decision === 'approved' ? 'verifie' : 'rejete' },
        });
        notify(
          decision === 'approved' ? 'Voyageur approuvé' : 'Vérification refusée',
          decision === 'approved' ? 'success' : 'default'
        );
        await loadKycRequests();
      } catch (e) {
        notify(e.message || 'Échec de la décision', 'error');
      }
    });

  const mapProfileToKycRow = (row) => ({
    id: row.id,
    name: row.nom_complet,
    telephone: row.telephone,
    context: row.role === 'expediteur' ? 'expediteur' : 'voyageur',
    dateNaissance: row.date_naissance,
    lieuNaissance: row.lieu_naissance,
    docType: row.type_piece_identite,
    docImage: row.piece_identite_url,
    selfieImage: row.photo_url,
    status:
      row.statut_verification === 'verifie'
        ? 'approved'
        : row.statut_verification === 'rejete'
        ? 'rejected'
        : 'pending',
    submittedAt: row.verification_soumise_at
      ? new Date(row.verification_soumise_at).getTime()
      : new Date(row.created_at).getTime(),
  });

  const loadKycRequests = async () => {
    if (!profile || !profile.estAdmin) return;
    try {
      const token = session ? session.access_token : null;
      const rows =
        (await sbRest('profiles?piece_identite_url=not.is.null&select=*&order=verification_soumise_at.desc', {
          token,
        })) || [];
      setKycRequests(rows.map(mapProfileToKycRow));
    } catch (e) {
      notify('Impossible de charger les demandes de vérification', 'error');
    }
  };

  useEffect(() => {
    if (profile && profile.estAdmin && session) loadKycRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, profile ? profile.estAdmin : null, session ? session.access_token : null]);

  /* ---- reviews (real `notations` table — visible immediately, no publish
     step in this schema; admin can delete inappropriate ones) ---- */
  const mapNotationRow = (n, otherProfile) => ({
    id: n.id,
    shipmentId: n.matching_id,
    voyageurId: n.note_pour,
    voyageurName: otherProfile ? otherProfile.nom_complet : 'Voyageur',
    expediteurId: n.note_par,
    expediteurName: n.note_par === profile.id ? profile.name : 'Expéditeur',
    rating: n.note,
    comment: n.commentaire || '',
    createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
  });

  const loadReviews = async () => {
    try {
      const token = session ? session.access_token : null;
      const rows = (await sbRest('notations?select=*&order=created_at.desc', { token })) || [];
      const voyageurIds = [...new Set(rows.map((n) => n.note_pour))];
      let profilesMap = {};
      if (voyageurIds.length) {
        const idsFilter = voyageurIds.map((id) => `"${id}"`).join(',');
        const profs = (await sbRest(`profiles_public?id=in.(${idsFilter})`, { token }).catch(() => [])) || [];
        profs.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
      setReviews(rows.map((n) => mapNotationRow(n, profilesMap[n.note_pour])));
    } catch (e) {
      notify('Impossible de charger les avis', 'error');
    }
  };

  useEffect(() => {
    if (profile && session) loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, session ? session.access_token : null]);

  const submitReview = (shipment, rating, comment) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest('notations', {
          method: 'POST',
          token,
          body: {
            matching_id: shipment.id,
            note_par: profile.id,
            note_pour: shipment.voyageurId,
            note: rating,
            commentaire: comment.trim() || null,
          },
        });
        notify('Merci, votre avis a été publié', 'success');
        await loadReviews();
      } catch (e) {
        notify(e.message || "Échec de l'envoi de l'avis", 'error');
      }
    });

  const deleteReview = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`notations?id=eq.${id}`, { method: 'DELETE', token });
        notify('Avis supprimé');
        await loadReviews();
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  /* ---- trip actions (real `trajets` table in Supabase) ---- */
  const mapTrajetRow = (row, voyageurProfile) => ({
    id: row.id,
    voyageurId: row.voyageur_id,
    voyageurName:
      row.voyageur_id === profile.id ? profile.name : voyageurProfile ? voyageurProfile.nom_complet : 'Voyageur',
    voyageurEmail: row.voyageur_id === profile.id ? profile.email : null,
    voyageurVerified:
      row.voyageur_id === profile.id
        ? !!profile.verified
        : !!(voyageurProfile && voyageurProfile.statut_verification === 'verifie'),
    voyageurPhone: row.voyageur_id === profile.id ? profile.telephone || '' : '',
    from: row.ville_depart,
    to: row.ville_arrivee,
    date: row.date_depart,
    capacityKg: parseFloat(row.capacite_kg_disponible) || 0,
    pricePerKg: parseFloat(row.prix_par_kg) || 0,
    notes: '',
    adminDisabled: row.statut === 'annule',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  });

  const loadTrajets = async () => {
    try {
      const token = session ? session.access_token : null;
      const rows = (await sbRest('trajets?select=*&order=date_depart.asc', { token })) || [];
      const otherIds = [...new Set(rows.map((r) => r.voyageur_id).filter((id) => id !== profile.id))];
      let profilesMap = {};
      if (otherIds.length) {
        const idsFilter = otherIds.map((id) => `"${id}"`).join(',');
        const profs = await sbRest(`profiles_public?id=in.(${idsFilter})`, { token }).catch(() => []);
        (profs || []).forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
      setTrips(rows.map((r) => mapTrajetRow(r, profilesMap[r.voyageur_id])));
    } catch (e) {
      notify('Impossible de charger les trajets', 'error');
    }
  };

  const saveTrip = (data, editingTripId) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      if (!token) {
        notify('Session expirée — reconnectez-vous', 'error');
        return;
      }
      try {
        if (editingTripId) {
          await sbRest(`trajets?id=eq.${editingTripId}`, {
            method: 'PATCH',
            token,
            body: {
              ville_depart: data.from.trim(),
              ville_arrivee: data.to.trim(),
              date_depart: new Date(data.date).toISOString(),
              capacite_kg_disponible: parseFloat(data.capacityKg) || 0,
              prix_par_kg: parseFloat(data.pricePerKg) || 0,
            },
          });
          setShowTripForm(false);
          setEditingTrip(null);
          notify('Trajet modifié et republié avec succès', 'success');
        } else {
          await sbRest('trajets', {
            method: 'POST',
            token,
            prefer: 'return=representation',
            body: {
              voyageur_id: profile.id,
              ville_depart: data.from.trim(),
              ville_arrivee: data.to.trim(),
              date_depart: new Date(data.date).toISOString(),
              capacite_kg_disponible: parseFloat(data.capacityKg) || 0,
              prix_par_kg: parseFloat(data.pricePerKg) || 0,
              statut: 'ouvert',
            },
          });
          setShowTripForm(false);
          notify('Trajet publié avec succès', 'success');
        }
        await loadTrajets();
      } catch (e) {
        notify(e.message || "Échec de l'enregistrement du trajet", 'error');
      }
    });

  const deleteTrip = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        const active = await sbRest(
          `matchings?trajet_id=eq.${id}&statut=in.(propose,accepte,pris_en_charge)&select=id`,
          { token }
        ).catch(() => []);
        if (active && active.length > 0) {
          notify(
            'Ce trajet a des envois en cours — vous pouvez le désactiver plutôt que le supprimer',
            'error'
          );
          return;
        }
        await sbRest(`trajets?id=eq.${id}`, { method: 'DELETE', token });
        await loadTrajets();
        notify('Trajet supprimé');
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  const openEditTrip = (trip) => {
    setEditingTrip(trip);
    setShowTripForm(true);
  };

  const toggleTripPublication = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      const trip = trips.find((t) => t.id === id);
      if (!trip) return;
      try {
        await sbRest(`trajets?id=eq.${id}`, {
          method: 'PATCH',
          token,
          body: { statut: trip.adminDisabled ? 'ouvert' : 'annule' },
        });
        await loadTrajets();
      } catch (e) {
        notify(
          e.message ||
            "Échec de la mise à jour — la règle de sécurité admin sur les trajets doit être approuvée côté Supabase",
          'error'
        );
      }
    });

  useEffect(() => {
    if (profile && session) loadTrajets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, session ? session.access_token : null]);

  /* ---- shipment actions (real `colis` + `matchings` tables) ---- */
  const mapMatchingRow = (m, otherProfile, phoneOverride) => {
    const iAmVoyageur = m.voyageur_id === profile.id;
    const colis = m.colis || {};
    const trajet = m.trajets || {};
    const paiementReussi = (m.paiements || []).some((p) => p.statut === 'reussi');
    let status = 'en_attente';
    if (m.statut === 'refuse' || m.statut === 'annule') status = 'refuse';
    else if (m.statut === 'accepte') status = paiementReussi ? 'paye' : 'accepte';
    else if (m.statut === 'pris_en_charge') status = 'expedie';
    else if (m.statut === 'livre') status = 'livre';

    const otherName = otherProfile ? otherProfile.nom_complet : iAmVoyageur ? 'Expéditeur' : 'Voyageur';

    return {
      id: m.id,
      colisId: colis.id,
      tripId: m.trajet_id,
      tripFrom: trajet.ville_depart || colis.ville_depart,
      tripTo: trajet.ville_arrivee || colis.ville_arrivee,
      tripDate: trajet.date_depart,
      voyageurName: iAmVoyageur ? profile.name : otherName,
      voyageurId: m.voyageur_id,
      voyageurEmail: iAmVoyageur ? profile.email : null,
      voyageurPhone: iAmVoyageur ? profile.telephone || '' : phoneOverride || '',
      voyageurVerified: iAmVoyageur
        ? !!profile.verified
        : !!(otherProfile && otherProfile.statut_verification === 'verifie'),
      expediteurId: m.expediteur_id,
      expediteurName: iAmVoyageur ? otherName : profile.name,
      expediteurEmail: iAmVoyageur ? null : profile.email,
      expediteurPhone: iAmVoyageur ? phoneOverride || '' : profile.telephone || '',
      description: colis.description,
      weightKg: parseFloat(colis.poids_kg) || 0,
      declaredValue: parseFloat(colis.valeur_declaree) || 0,
      proposedPrice: parseFloat(m.prix_convenu) || 0,
      commission: parseFloat(m.commission_plateforme) || 0,
      recipientName: colis.destinataire_nom,
      recipientPhone: colis.destinataire_telephone,
      status,
      pickupCode: m.code_livraison || null,
      createdAt: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
    };
  };

  const loadMatchings = async () => {
    try {
      const token = session ? session.access_token : null;
      const rows =
        (await sbRest(
          `matchings?or=(expediteur_id.eq.${profile.id},voyageur_id.eq.${profile.id})&select=*,colis(*),trajets(*),paiements(statut,montant_voyageur)&order=created_at.desc`,
          { token }
        )) || [];
      const otherIds = [
        ...new Set(rows.map((m) => (m.voyageur_id === profile.id ? m.expediteur_id : m.voyageur_id))),
      ];
      let profilesMap = {};
      if (otherIds.length) {
        const idsFilter = otherIds.map((id) => `"${id}"`).join(',');
        const profs = (await sbRest(`profiles_public?id=in.(${idsFilter})`, { token }).catch(() => [])) || [];
        profs.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
      // Phone numbers are never read from public profile data — only via the
      // secure RPC, and only once the two parties are actually matched.
      const phoneEligible = rows.filter((m) => ['accepte', 'pris_en_charge', 'livre'].includes(m.statut));
      const phones = {};
      await Promise.all(
        phoneEligible.map(async (m) => {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/obtenir_telephone_contact`, {
              method: 'POST',
              headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ p_matching_id: m.id }),
            });
            const phone = await res.json();
            if (typeof phone === 'string') phones[m.id] = phone;
          } catch (e) {}
        })
      );
      const mapped = rows.map((m) =>
        mapMatchingRow(
          m,
          profilesMap[m.voyageur_id === profile.id ? m.expediteur_id : m.voyageur_id],
          phones[m.id]
        )
      );
      setShipments(mapped);
      return mapped;
    } catch (e) {
      notify('Impossible de charger les envois (' + (e.message || 'erreur réseau') + ')', 'error');
      return null;
    }
  };

  useEffect(() => {
    if (profile && session) {
      loadMatchings().then((mapped) => {
        // Right after the very first load (e.g. reopening the app after
        // being redirected back from PayDunya), proactively check any
        // shipment still shown as "accepté" for a payment that actually
        // succeeded but whose webhook never landed — instead of waiting for
        // the person to notice and retry the payment themselves.
        if (!mapped) return;
        mapped
          .filter((s) => s.status === 'accepte' && s.expediteurEmail === profile.email)
          .forEach((s) => verifyPayment(s.id));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, session ? session.access_token : null]);

  const requestShipment = (trip, data) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      if (!token) {
        notify('Session expirée — reconnectez-vous', 'error');
        return;
      }
      try {
        const colisRows = await sbRest('colis', {
          method: 'POST',
          token,
          prefer: 'return=representation',
          body: {
            expediteur_id: profile.id,
            description: data.description.trim(),
            poids_kg: parseFloat(data.weightKg) || 0,
            valeur_declaree: parseFloat(data.declaredValue) || 0,
            ville_depart: trip.from,
            ville_arrivee: trip.to,
            destinataire_nom: data.recipientName.trim(),
            destinataire_telephone: data.recipientPhone.trim(),
            statut: 'en_attente',
          },
        });
        const colis = colisRows && colisRows[0];
        if (!colis) throw new Error('Échec de la création du colis');
        await sbRest('matchings', {
          method: 'POST',
          token,
          body: {
            colis_id: colis.id,
            trajet_id: trip.id,
            voyageur_id: trip.voyageurId,
            expediteur_id: profile.id,
            prix_convenu: parseFloat(data.proposedPrice) || 0,
            statut: 'propose',
          },
        });
        setShipTripTarget(null);
        notify('Demande envoyée au voyageur', 'success');
        await loadMatchings();
      } catch (e) {
        notify(e.message || "Échec de l'envoi de la demande", 'error');
      }
    });

  const acceptShipment = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`matchings?id=eq.${id}`, { method: 'PATCH', token, body: { statut: 'accepte' } });
        notify('Demande acceptée', 'success');
        await loadMatchings();
      } catch (e) {
        notify(e.message || "Échec de l'acceptation", 'error');
      }
    });
  const refuseShipment = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`matchings?id=eq.${id}`, { method: 'PATCH', token, body: { statut: 'refuse' } });
        notify('Demande refusée');
        await loadMatchings();
      } catch (e) {
        notify(e.message || 'Échec du refus', 'error');
      }
    });

  // Le prix d'un matching ne peut plus changer une fois qu'il a quitté le
  // statut "propose" (protection serveur) : une offre plus élevée après un
  // refus crée donc un nouveau matching plutôt que de modifier l'ancien.
  const resubmitOffer = (shipment, newPriceRaw) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      const newPrice = parseFloat(newPriceRaw);
      if (!newPrice || newPrice <= shipment.proposedPrice) {
        notify('Proposez un tarif supérieur au précédent pour de meilleures chances', 'error');
        return;
      }
      const minPrice =
        shipment.declaredValue > 0
          ? Math.max(Math.round(shipment.declaredValue * 0.12 * 100) / 100, 1000)
          : 0;
      if (newPrice < minPrice) {
        notify(
          `Le tarif doit être d'au moins ${fcfa(minPrice)} (12 % de la valeur déclarée, minimum 1 000 FCFA)`,
          'error'
        );
        return;
      }
      try {
        await sbRest('matchings', {
          method: 'POST',
          token,
          body: {
            colis_id: shipment.colisId,
            trajet_id: shipment.tripId,
            voyageur_id: shipment.voyageurId,
            expediteur_id: profile.id,
            prix_convenu: newPrice,
            statut: 'propose',
          },
        });
        setEditingPriceId(null);
        setPriceEdits((prev) => ({ ...prev, [shipment.id]: '' }));
        notify('Nouvelle offre envoyée au voyageur', 'success');
        await loadMatchings();
      } catch (e) {
        notify(e.message || "Échec de l'envoi de la nouvelle offre", 'error');
      }
    });

  // De même, changer de trajet annule l'ancien matching (le trajet d'un
  // matching n'est jamais modifiable) et en crée un nouveau sur le trajet choisi.
  const changeShipmentTrip = (shipment, newTrip) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`matchings?id=eq.${shipment.id}`, {
          method: 'PATCH',
          token,
          body: { statut: 'annule' },
        }).catch(() => {});
        await sbRest('matchings', {
          method: 'POST',
          token,
          body: {
            colis_id: shipment.colisId,
            trajet_id: newTrip.id,
            voyageur_id: newTrip.voyageurId,
            expediteur_id: profile.id,
            prix_convenu: shipment.proposedPrice,
            statut: 'propose',
          },
        });
        setChangeTripFor(null);
        notify('Colis réassigné à un nouveau trajet', 'success');
        await loadMatchings();
      } catch (e) {
        notify(e.message || 'Échec de la réassignation', 'error');
      }
    });

  // Le paiement passe par la vraie fonction serveur PayDunya. Une fois la
  // page de paiement ouverte, c'est PayDunya qui confirme automatiquement
  // (webhook) — d'où le sondage régulier qui rafraîchit les envois.
  const verifyPayment = async (matchingId) => {
    const token = session ? session.access_token : null;
    if (!token) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verifier-paiement`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matching_id: matchingId }),
      });
      const data = await res.json();
      if (data && data.statut_paiement === 'reussi') {
        notify('Paiement effectué avec succès ✅', 'success');
        await loadMatchings();
      }
      return data;
    } catch (e) {
      return null;
    }
  };

  const initiatePayment = (shipment, operateur) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/initier-paiement`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matching_id: shipment.id,
            operateur,
            telephone: profile.telephone,
            retour_url: window.location.origin,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.payment_url) {
          // "Paiement déjà en attente" often just means an earlier attempt's
          // webhook never landed even though PayDunya actually confirmed it —
          // check for real before bothering the person with an error.
          if (res.status === 409 && /d[ée]j[àa] en attente/i.test(data.error || '')) {
            const check = await verifyPayment(shipment.id);
            if (check && check.statut_paiement === 'reussi') {
              setPaymentFor(null);
              return;
            }
          }
          const detail = data.details ? JSON.stringify(data.details).slice(0, 200) : '';
          throw new Error(
            (data.error || 'Paiement indisponible — vérifiez la configuration PayDunya') +
              (detail ? ' — ' + detail : '')
          );
        }
        // A same-tab redirect (rather than window.open) is far more
        // reliable on mobile: opening a new tab after an async fetch call
        // is routinely blocked as a popup by mobile browsers since it's no
        // longer tied synchronously to the tap that started it, and when it
        // does work it leaves the original tab stuck showing stale data.
        setPaymentFor(null);
        window.location.href = data.payment_url;
      } catch (e) {
        notify(e.message || "Échec de l'initialisation du paiement", 'error');
      }
    });

  // Local-only patch — used for the location-sharing on/off flag, which
  // mirrors the real inserts below without needing a round-trip to read it back.
  const updateShipment = (id, patch) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const pushLivePosition = async (matchingId, lat, lng, speedKmh) => {
    const token = session ? session.access_token : null;
    try {
      await sbRest('tracking_positions', {
        method: 'POST',
        token,
        body: {
          matching_id: matchingId,
          voyageur_id: profile.id,
          position: `SRID=4326;POINT(${lng} ${lat})`,
          vitesse_kmh: speedKmh || null,
        },
      });
    } catch (e) {}
  };

  const toggleLocationSharing = (shipment) => {
    const id = shipment.id;
    const isSharing = !!watchIdsRef.current[id];

    if (isSharing) {
      try {
        navigator.geolocation.clearWatch(watchIdsRef.current[id]);
      } catch (e) {}
      delete watchIdsRef.current[id];
      updateShipment(id, { locationSharing: false });
      notify('Partage de position arrêté');
      return;
    }

    if (!('geolocation' in navigator)) {
      notify("La géolocalisation n'est pas disponible sur cet appareil", 'error');
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const now = Date.now();
          const last = lastLocUpdateRef.current[id] || 0;
          if (now - last < 20000) return; // throttle updates to once per 20s
          lastLocUpdateRef.current[id] = now;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null;
          updateShipment(id, {
            locationSharing: true,
            liveLocation: { lat, lng, updatedAt: now },
          });
          pushLivePosition(id, lat, lng, speedKmh);
        },
        () => {
          notify(
            "Impossible d'accéder à votre position — vérifiez les autorisations de localisation de votre navigateur",
            'error'
          );
          delete watchIdsRef.current[id];
          updateShipment(id, { locationSharing: false });
        },
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
      );
      watchIdsRef.current[id] = watchId;
      updateShipment(id, { locationSharing: true });
      notify('Partage de position activé — l’expéditeur peut suivre le colis en direct', 'success');
    } catch (e) {
      notify("Impossible d'activer le partage de position sur cet appareil", 'error');
    }
  };

  const confirmDelivery = (shipment) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      const entered = (codeInputs[shipment.id] || '').trim();
      if (!entered) {
        notify('Saisissez le code communiqué par le destinataire', 'error');
        return;
      }
      try {
        await sbRest('preuves_livraison', {
          method: 'POST',
          token,
          body: { matching_id: shipment.id, code_saisi: entered },
        });
        await sbRest(`matchings?id=eq.${shipment.id}`, {
          method: 'PATCH',
          token,
          body: { statut: 'livre' },
        });
        // If live position sharing was still on, stop it now — the button
        // to turn it off is about to disappear along with the "expedie" card.
        if (watchIdsRef.current[shipment.id]) {
          try {
            navigator.geolocation.clearWatch(watchIdsRef.current[shipment.id]);
          } catch (e) {}
          delete watchIdsRef.current[shipment.id];
        }
        notify('Livraison confirmée — fonds disponibles au retrait', 'success');
        await loadMatchings();
      } catch (e) {
        notify('Code incorrect ou colis pas encore pris en charge', 'error');
      }
    });

  /* ---- withdrawals (real `retraits` table — requests, processed by an
     admin for now; automatic PayDunya payout would be a further step) ---- */
  const mapRetraitRow = (r) => ({
    id: r.id,
    voyageurId: r.voyageur_id,
    amount: parseFloat(r.montant) || 0,
    operateur: r.operateur,
    telephone: r.telephone,
    statut: r.statut,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  });

  const loadWithdrawals = async () => {
    try {
      const token = session ? session.access_token : null;
      const rows =
        (await sbRest(`retraits?voyageur_id=eq.${profile.id}&select=*&order=created_at.desc`, {
          token,
        })) || [];
      setWithdrawals(rows.map(mapRetraitRow));
    } catch (e) {
      notify('Impossible de charger les retraits', 'error');
    }
  };

  useEffect(() => {
    if (profile && session) loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, session ? session.access_token : null]);

  const withdrawFunds = (amount, operateur) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      if (!amount || amount <= 0) return;
      if (!profile.telephone) {
        notify('Renseignez un numéro de téléphone sur votre profil avant de retirer', 'error');
        return;
      }
      try {
        await sbRest('retraits', {
          method: 'POST',
          token,
          body: { voyageur_id: profile.id, montant: amount, operateur, telephone: profile.telephone },
        });
        setWithdrawConfirm(false);
        notify(`Demande de retrait de ${fcfa(amount)} envoyée`, 'success');
        await loadWithdrawals();
      } catch (e) {
        notify(e.message || 'Échec de la demande de retrait', 'error');
      }
    });

  // Admin: view every withdrawal request and mark it as processed once the
  // payout has actually been sent (manually, for now).
  const [adminWithdrawals, setAdminWithdrawals] = useState([]);
  const loadAdminWithdrawals = async () => {
    if (!profile || !profile.estAdmin) return;
    try {
      const token = session ? session.access_token : null;
      const rows =
        (await sbRest('retraits?select=*,profiles(nom_complet)&order=created_at.desc', { token })) || [];
      setAdminWithdrawals(
        rows.map((r) => ({
          ...mapRetraitRow(r),
          voyageurName: r.profiles ? r.profiles.nom_complet : 'Voyageur',
        }))
      );
    } catch (e) {
      notify('Impossible de charger les retraits', 'error');
    }
  };
  useEffect(() => {
    if (profile && profile.estAdmin && session) loadAdminWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, profile ? profile.estAdmin : null, session ? session.access_token : null]);

  const decideWithdrawal = (id, decision) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`retraits?id=eq.${id}`, {
          method: 'PATCH',
          token,
          body: { statut: decision, traite_at: new Date().toISOString() },
        });
        notify(decision === 'reussi' ? 'Retrait marqué comme traité' : 'Retrait marqué comme échoué');
        await loadAdminWithdrawals();
      } catch (e) {
        notify(e.message || 'Échec de la mise à jour', 'error');
      }
    });

  const [confirmDeleteWithdrawal, setConfirmDeleteWithdrawal] = useState(null);
  const deleteAdminWithdrawal = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`retraits?id=eq.${id}`, { method: 'DELETE', token });
        notify('Demande de retrait supprimée définitivement');
        setConfirmDeleteWithdrawal(null);
        await loadAdminWithdrawals();
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  /* ---- Admin: every shipment in the system (real, hard delete on remove) ---- */
  const [adminShipments, setAdminShipments] = useState([]);
  const loadAdminShipments = async () => {
    if (!profile || !profile.estAdmin) return;
    try {
      const token = session ? session.access_token : null;
      const rows =
        (await sbRest('matchings?select=*,colis(*),trajets(*)&order=created_at.desc', { token })) || [];
      const ids = [...new Set(rows.flatMap((m) => [m.voyageur_id, m.expediteur_id]))];
      let profilesMap = {};
      if (ids.length) {
        const idsFilter = ids.map((id) => `"${id}"`).join(',');
        const profs = (await sbRest(`profiles_public?id=in.(${idsFilter})`, { token }).catch(() => [])) || [];
        profs.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
      setAdminShipments(
        rows.map((m) => ({
          id: m.id,
          statut:
            m.statut === 'propose'
              ? 'en_attente'
              : m.statut === 'annule'
              ? 'refuse'
              : m.statut === 'pris_en_charge'
              ? 'expedie'
              : m.statut,
          prix: parseFloat(m.prix_convenu) || 0,
          from: m.trajets ? m.trajets.ville_depart : m.colis ? m.colis.ville_depart : '—',
          to: m.trajets ? m.trajets.ville_arrivee : m.colis ? m.colis.ville_arrivee : '—',
          description: m.colis ? m.colis.description : '—',
          voyageurName: profilesMap[m.voyageur_id] ? profilesMap[m.voyageur_id].nom_complet : 'Voyageur',
          expediteurName: profilesMap[m.expediteur_id] ? profilesMap[m.expediteur_id].nom_complet : 'Expéditeur',
          createdAt: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
        }))
      );
    } catch (e) {
      notify("Impossible de charger les envois (admin) : " + (e.message || ''), 'error');
    }
  };
  useEffect(() => {
    if (profile && profile.estAdmin && session) loadAdminShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, profile ? profile.estAdmin : null, session ? session.access_token : null]);

  const [confirmDeleteShipment, setConfirmDeleteShipment] = useState(null);
  const deleteAdminShipment = (id) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`matchings?id=eq.${id}`, { method: 'DELETE', token });
        notify('Envoi supprimé définitivement');
        setConfirmDeleteShipment(null);
        await loadAdminShipments();
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  /* ---- Admin: every registered user (real, hard delete = full account) ---- */
  const [adminUsers, setAdminUsers] = useState([]);
  const loadAdminUsers = async () => {
    if (!profile || !profile.estAdmin) return;
    try {
      const token = session ? session.access_token : null;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/lister_utilisateurs_admin`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const rows = await res.json();
      if (!res.ok) throw new Error((rows && rows.message) || 'Erreur');
      setAdminUsers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      notify("Impossible de charger les utilisateurs (" + (e.message || '') + ')', 'error');
    }
  };
  useEffect(() => {
    if (profile && profile.estAdmin && session) loadAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile ? profile.id : null, profile ? profile.estAdmin : null, session ? session.access_token : null]);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const deleteAdminUser = (user) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-supprimer-utilisateur`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Échec de la suppression');
        notify('Compte supprimé définitivement', 'success');
        setConfirmDeleteUser(null);
        await loadAdminUsers();
      } catch (e) {
        notify(e.message || 'Échec de la suppression', 'error');
      }
    });

  const [confirmToggleAdmin, setConfirmToggleAdmin] = useState(null); // {user, makeAdmin}
  const toggleAdminRole = (user, makeAdmin) =>
    withBusy(async () => {
      const token = session ? session.access_token : null;
      try {
        await sbRest(`profiles?id=eq.${user.id}`, {
          method: 'PATCH',
          token,
          body: { est_admin: makeAdmin },
        });
        notify(
          makeAdmin ? `${user.nom_complet} est désormais administrateur` : `Droits admin retirés à ${user.nom_complet}`,
          'success'
        );
        setConfirmToggleAdmin(null);
        await loadAdminUsers();
      } catch (e) {
        notify(e.message || 'Échec de la mise à jour du rôle', 'error');
      }
    });

  if (loading) {
    return (
      <>
        {likelyLoggedIn ? (
          <div className="cge">
            <style>{STYLES}</style>
            <div className="cge-shell" />
          </div>
        ) : (
          <LandingPage onStart={() => {}} sessionDebug={sessionDebug} />
        )}
        <div className="boot-overlay">
          <div className="boot-card">
            <Loader2 size={20} className="boot-spin" />
            <span>Chargement…</span>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    if (!showLogin) {
      return <LandingPage onStart={() => setShowLogin(true)} sessionDebug={sessionDebug} />;
    }
    return (
      <div className="cge">
        <style>{STYLES}</style>
        <div className="cge-shell">
          <div className="onboard">
            <div>
              <button type="button" className="back-to-landing" onClick={() => setShowLogin(false)}>
                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Retour à l'accueil
              </button>
              <div className="onboard-brand-row">
                <div className="onboard-mark">
                  <Package color="#241300" size={26} />
                </div>
                <h1 className="cge-display">ColisGo‑Express</h1>
              </div>
              <p className="tag">Envoyez un colis n'importe où, porté par quelqu'un qui y va déjà.</p>
              <div className="route-strip">
                <span className="code">EXP</span>
                <div className="line" />
                <Car size={16} color="#F5A623" />
                <div className="line" />
                <span className="code">DST</span>
              </div>
            </div>
            <div className="onboard-form">
              {authMode === 'login' ? (
                <>
                  <label>Adresse e-mail</label>
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value.trim().slice(0, 120))}
                    maxLength={120}
                    autoComplete="email"
                  />
                  <label style={{ marginTop: 14 }}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value.slice(0, 72))}
                      onKeyDown={(e) => e.key === 'Enter' && signInEmail()}
                      autoComplete="current-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {authError && <p className="auth-msg error">{authError}</p>}
                  {authNotice && <p className="auth-msg notice">{authNotice}</p>}

                  <button
                    className="btn-amber"
                    disabled={!isValidEmail(emailInput) || passwordInput.length < 6}
                    style={{ opacity: isValidEmail(emailInput) && passwordInput.length >= 6 ? 1 : 0.5 }}
                    onClick={signInEmail}
                  >
                    <Lock size={18} /> Se connecter
                  </button>
                  <button
                    type="button"
                    className="auth-switch"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                      setAuthNotice('');
                    }}
                  >
                    Pas encore de compte ? Créer un compte
                  </button>
                </>
              ) : (
                <>
                  <label>Nom complet</label>
                  <input
                    value={signupName}
                    onChange={(e) => setSignupName(onlyLetters(e.target.value).slice(0, 60))}
                    placeholder="Nom complet"
                    minLength={2}
                  />
                  <label style={{ marginTop: 14 }}>Adresse e-mail</label>
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value.trim().slice(0, 120))}
                    maxLength={120}
                    autoComplete="email"
                  />
                  <label style={{ marginTop: 14 }}>Numéro de téléphone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(onlyDigits(e.target.value))}
                    placeholder="0707123456"
                  />
                  <label style={{ marginTop: 14 }}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 caractères minimum"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value.slice(0, 72))}
                      autoComplete="new-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {authError && <p className="auth-msg error">{authError}</p>}
                  {authNotice && <p className="auth-msg notice">{authNotice}</p>}

                  <button className="btn-amber" onClick={signUpEmail}>
                    <Lock size={18} /> Créer mon compte
                  </button>
                  <button
                    type="button"
                    className="auth-switch"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                      setAuthNotice('');
                    }}
                  >
                    Déjà un compte ? Se connecter
                  </button>
                </>
              )}

              <div className="onboard-divider">
                <span>ou</span>
              </div>

              <button type="button" className="btn-google" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9 8.5 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.5C29.5 34.9 26.9 36 24 36c-5.4 0-9.9-3.3-11.4-8l-6.6 5.1C9 39.4 16 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C41.7 36 44 30.7 44 24c0-1.2-.1-2.4-.4-3.5z"
                  />
                </svg>
                Continuer avec Google
              </button>
              <p className="onboard-foot" style={{ marginTop: -6 }}>
                Indisponible dans cet aperçu (redirection bloquée par le bac à sable) — fonctionnera une
                fois l'app déployée sur un vrai domaine.
              </p>

              <p className="onboard-foot">
                Compte réel connecté à Supabase — vos identifiants et vos données sont enregistrés dans
                une vraie base de données. Pour publier un trajet, une vérification d'identité (pièce
                officielle) sera demandée.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nowTs = Date.now();
  const isTripExpired = (t) => new Date(t.date).getTime() < nowTs;
  const isTripDateExpiredFor = (s) => new Date(s.tripDate).getTime() < nowTs;

  const filteredTrips = trips.filter((t) => {
    if (t.adminDisabled) return false;
    if (isTripExpired(t)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q);
  });

  const myShipmentsAsExpediteur = shipments
    .filter((s) => (s.expediteurEmail ? s.expediteurEmail === profile.email : s.expediteurName === profile.name))
    .sort((a, b) => b.createdAt - a.createdAt);

  // "Mes envois" is split into three groups: not yet shipped, in transit,
  // and delivered — with counts shown on each filter button.
  const envoisGroups = {
    attente: myShipmentsAsExpediteur.filter((s) => ['en_attente', 'accepte', 'paye', 'refuse'].includes(s.status)),
    transit: myShipmentsAsExpediteur.filter((s) => s.status === 'expedie'),
    livre: myShipmentsAsExpediteur.filter((s) => s.status === 'livre'),
  };
  const visibleEnvois = envoisGroups[envoisFilter];

  const isShipmentExpanded = (s) => {
    if (expandedShipments[s.id] !== undefined) return expandedShipments[s.id];
    return s.status !== 'livre'; // "en transit" starts open, "livré" starts collapsed
  };
  const toggleShipmentExpanded = (s) => {
    setExpandedShipments((prev) => ({ ...prev, [s.id]: !isShipmentExpanded(s) }));
  };

  const myTrips = trips
    .filter((t) => t.voyageurId === profile.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const myTripIds = new Set(myTrips.map((t) => t.id));
  const incomingShipments = shipments
    .filter((s) => myTripIds.has(s.tripId))
    .sort((a, b) => b.createdAt - a.createdAt);

  // Pending-action counters shown as numbered badges on the bottom nav.
  const envoisActionCount = myShipmentsAsExpediteur.filter((s) =>
    ['accepte', 'expedie'].includes(s.status)
  ).length;
  const trajetsActionCount = incomingShipments.filter((s) =>
    ['en_attente', 'paye', 'expedie'].includes(s.status)
  ).length;

  const isAdmin = !!profile.estAdmin;
  const pendingKycCount = kycRequests.filter((r) => r.status === 'pending').length;
  const sortedKycRequests = [...kycRequests].sort((a, b) => b.submittedAt - a.submittedAt);
  const sortedReviews = [...reviews].sort((a, b) => b.createdAt - a.createdAt);
  const sortedAllTrips = [...trips].sort((a, b) => b.createdAt - a.createdAt);

  // Search + pagination for every admin list section.
  const kycSearch = searchPaginate(sortedKycRequests, searchKyc, (r) => `${r.name} ${r.telephone} ${r.context}`, pageKyc);
  const tripsSearch = searchPaginate(
    sortedAllTrips,
    searchTrips,
    (t) => `${t.from} ${t.to} ${t.voyageurName} ${t.voyageurEmail || ''}`,
    pageTrips
  );
  const shipmentsSearch = searchPaginate(
    adminShipments,
    searchShipments,
    (s) => `${s.from} ${s.to} ${s.description} ${s.voyageurName} ${s.expediteurName}`,
    pageShipments
  );
  const usersSearch = searchPaginate(
    adminUsers,
    searchUsers,
    (u) => `${u.nom_complet} ${u.email} ${u.telephone}`,
    pageUsers
  );
  const reviewsSearch = searchPaginate(
    sortedReviews,
    searchReviews,
    (r) => `${r.voyageurName} ${r.expediteurName} ${r.comment}`,
    pageReviews
  );
  const withdrawalsSearch = searchPaginate(
    adminWithdrawals,
    searchWithdrawals,
    (w) => `${w.voyageurName} ${w.telephone} ${w.operateur || ''}`,
    pageWithdrawals
  );

  const supportThreadsMap = {};
  supportMessages.forEach((m) => {
    if (!supportThreadsMap[m.token]) {
      supportThreadsMap[m.token] = { token: m.token, email: m.senderEmail, name: m.senderName, messages: [] };
    }
    supportThreadsMap[m.token].messages.push(m);
    if (m.from === 'user') supportThreadsMap[m.token].name = m.senderName;
  });
  const supportThreads = Object.values(supportThreadsMap)
    .map((t) => ({
      ...t,
      messages: t.messages.sort((a, b) => a.createdAt - b.createdAt),
      lastActivity: Math.max(...t.messages.map((m) => m.createdAt)),
      awaitingReply: t.messages.length > 0 && t.messages[t.messages.length - 1].from === 'user',
    }))
    .sort((a, b) => b.lastActivity - a.lastActivity);
  const awaitingReplyCount = supportThreads.filter((t) => t.awaitingReply).length;

  const myReviewsByShipment = {};
  reviews
    .filter((r) => r.expediteurId === profile.id)
    .forEach((r) => {
      myReviewsByShipment[r.shipmentId] = r;
    });

  const ratingsFor = (voyageurId) => {
    const list = reviews.filter((r) => r.voyageurId === voyageurId);
    if (list.length === 0) return null;
    const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    return { avg, count: list.length };
  };

  const publishedReviewsFor = (voyageurId) =>
    reviews.filter((r) => r.voyageurId === voyageurId).sort((a, b) => b.createdAt - a.createdAt);

  const walletDisponibleBrut = shipments
    .filter((s) => s.voyageurId === profile.id && s.status === 'livre')
    .reduce((sum, s) => sum + (s.proposedPrice - s.commission), 0);
  const totalRetire = withdrawals
    .filter((w) => w.voyageurId === profile.id)
    .reduce((sum, w) => sum + w.amount, 0);
  const walletDisponible = Math.max(walletDisponibleBrut - totalRetire, 0);
  const walletEnAttente = shipments
    .filter((s) => s.voyageurId === profile.id && ['paye', 'expedie'].includes(s.status))
    .reduce((sum, s) => sum + (s.proposedPrice - s.commission), 0);
  const totalDepense = shipments
    .filter(
      (s) =>
        (s.expediteurEmail ? s.expediteurEmail === profile.email : s.expediteurName === profile.name) &&
        ['paye', 'expedie', 'livre'].includes(s.status)
    )
    .reduce((sum, s) => sum + s.proposedPrice, 0);

  const walletTotal = walletDisponible + walletEnAttente;

  const myWithdrawals = withdrawals
    .filter((w) => w.voyageurId === profile.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const txHistory = shipments
    .filter(
      (s) =>
        s.voyageurName === profile.name ||
        (s.expediteurEmail ? s.expediteurEmail === profile.email : s.expediteurName === profile.name)
    )
    .filter((s) => ['paye', 'expedie', 'livre'].includes(s.status))
    .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));

  return (
    <div className="cge">
      <style>{STYLES}</style>
      <div className="cge-shell">
        <div className="top-header">
          <div className="brand">
            <div className="brand-mark">
              <Package size={18} />
            </div>
            <div>
              <div className="brand-name">ColisGo‑Express</div>
              <div className="brand-sub">Bonjour, {profile.name.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <button className="logout-btn" onClick={enableNotifications} title="Activer les notifications">
                <Bell size={15} />
              </button>
            )}
            <div className="wallet-pill">
              <Wallet size={14} /> {fcfa(walletTotal)}
            </div>
            <button className="logout-btn" onClick={logout} title="Se déconnecter">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <div className="content">
          {tab === 'trajets' && (
            <>
              <div className="section-title">Trajets disponibles</div>
              <div className="section-sub">Trouvez un voyageur qui part avant l'expédition de votre colis.</div>

              <div className="searchbar">
                <Search size={16} />
                <input
                  placeholder="Rechercher une ville de départ ou d'arrivée"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="fab-row">
                <button className="btn-teal" onClick={requestPublishTrip}>
                  <Plus size={16} /> Publier un trajet
                </button>
              </div>

              {filteredTrips.length === 0 && (
                <div className="empty-state">
                  <Car size={34} />
                  <div className="t">Aucun trajet pour l'instant</div>
                  <div>Publiez le premier trajet ou modifiez votre recherche.</div>
                </div>
              )}

              {filteredTrips.map((trip) => {
                const used = shipments
                  .filter((s) => s.tripId === trip.id && ['accepte', 'paye', 'expedie', 'livre'].includes(s.status))
                  .reduce((sum, s) => sum + s.weightKg, 0);
                const remaining = Math.max(trip.capacityKg - used, 0);
                const isMine = trip.voyageurId === profile.id;
                const rating = ratingsFor(trip.voyageurId);
                const tripExpanded = expandedTrips[trip.id] !== false;
                return (
                  <div className="ticket" key={trip.id}>
                    <button
                      type="button"
                      className="ticket-toggle"
                      onClick={() => setExpandedTrips((prev) => ({ ...prev, [trip.id]: !tripExpanded }))}
                      aria-label={tripExpanded ? 'Réduire' : 'Déplier'}
                    >
                      {tripExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <div className="ticket-main">
                      <div className="route-row">
                        <div className="route-city">
                          <span className="code cge-mono">{cityCode(trip.from)}</span>
                          <span className="label">{trip.from}</span>
                        </div>
                        <div className="route-plane">
                          <div className="rl" />
                          <Car size={26} color="#F5A623" />
                        </div>
                        <div className="route-city right">
                          <span className="code cge-mono">{cityCode(trip.to)}</span>
                          <span className="label">{trip.to}</span>
                        </div>
                      </div>
                      {tripExpanded && (
                        <>
                          <div className="ticket-meta">
                            <div className="meta-chip">
                              <Clock3 size={13} /> Départ <b>{formatDate(trip.date)}</b>
                            </div>
                            <div className="meta-chip">
                              <Package size={13} /> <b>{remaining.toFixed(1)} kg</b> restants
                            </div>
                          </div>
                          <div className="voyageur-line">
                            <span>
                              Voyageur : <b>{trip.voyageurName}</b>
                              {isMine && ' (vous)'}
                              {rating && (
                                <button
                                  type="button"
                                  className="rating-inline rating-inline-btn"
                                  onClick={() => setViewReviewsFor(trip)}
                                >
                                  <Star size={11} fill="#F5A623" /> {rating.avg.toFixed(1)} ({rating.count})
                                </button>
                              )}
                            </span>
                            {trip.voyageurVerified && (
                              <span className="verified-badge">
                                <BadgeCheck size={13} /> Voyageur vérifié
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="ticket-divider" />
                    <div className="ticket-stub">
                      <div className="stub-price">
                        <span className="amount cge-mono">~{Math.round(trip.pricePerKg).toLocaleString('fr-FR')} FCFA/kg</span>
                        <span className="cap">tarif indicatif</span>
                      </div>
                      <button
                        className="btn-send"
                        disabled={isMine || remaining <= 0}
                        onClick={() => requestSendShipment(trip)}
                      >
                        {isMine ? 'Votre trajet' : remaining <= 0 ? 'Complet' : 'Envoyer un colis'}
                        {!isMine && remaining > 0 && <ArrowRight size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === 'envois' && (
            <>
              <div className="section-title">Mes envois</div>
              <div className="section-sub">Suivez vos colis, du paiement jusqu'à la remise au destinataire.</div>

              <div className="envois-filter-row">
                <button
                  type="button"
                  className={'envois-filter-btn' + (envoisFilter === 'attente' ? ' active' : '')}
                  onClick={() => setEnvoisFilter('attente')}
                >
                  En attente
                  {envoisGroups.attente.length > 0 && <span className="efb-count">{envoisGroups.attente.length}</span>}
                </button>
                <button
                  type="button"
                  className={'envois-filter-btn' + (envoisFilter === 'transit' ? ' active' : '')}
                  onClick={() => setEnvoisFilter('transit')}
                >
                  En transit
                  {envoisGroups.transit.length > 0 && <span className="efb-count">{envoisGroups.transit.length}</span>}
                </button>
                <button
                  type="button"
                  className={'envois-filter-btn' + (envoisFilter === 'livre' ? ' active' : '')}
                  onClick={() => setEnvoisFilter('livre')}
                >
                  Colis livré
                  {envoisGroups.livre.length > 0 && <span className="efb-count">{envoisGroups.livre.length}</span>}
                </button>
              </div>

              {visibleEnvois.length === 0 && (
                <div className="empty-state">
                  <Package size={34} />
                  <div className="t">
                    {envoisFilter === 'attente' && 'Aucun envoi en attente'}
                    {envoisFilter === 'transit' && 'Aucun colis en transit'}
                    {envoisFilter === 'livre' && 'Aucun colis livré pour l\'instant'}
                  </div>
                  {envoisFilter === 'attente' && <div>Recherchez un trajet pour expédier votre premier colis.</div>}
                </div>
              )}

              {visibleEnvois.map((s) => {
                const expanded = isShipmentExpanded(s);
                const collapsible = s.status === 'expedie' || s.status === 'livre';
                return (
                <div className="ship-card" key={s.id}>
                  <div className="ship-top">
                    <div>
                      <div className="ship-title">{s.description || 'Colis'}</div>
                      <div className="ship-route">
                        {collapsible && !expanded
                          ? `${s.tripTo} · ${fcfa(s.proposedPrice)}`
                          : <>{s.tripFrom} → {s.tripTo} · voyageur {s.voyageurName}</>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusBadge status={s.status} />
                        {collapsible && (
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 26, height: 26 }}
                            onClick={() => toggleShipmentExpanded(s)}
                            aria-label={expanded ? 'Réduire' : 'Déplier'}
                          >
                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        )}
                      </div>
                      {s.paymentSkipped && (
                        <span className="badge" style={{ background: '#F0EEE5', color: 'var(--slate)' }}>
                          Paiement sauté (test)
                        </span>
                      )}
                    </div>
                  </div>

                  {(!collapsible || expanded) && (
                  <>
                  {s.status === 'refuse' && (
                    <div className="price-boost-note" style={isTripDateExpiredFor(s) ? { background: '#FBE4E1', color: 'var(--coral)' } : undefined}>
                      {isTripDateExpiredFor(s) ? <XCircle size={16} /> : <Sparkles size={16} />}
                      <span>
                        {isTripDateExpiredFor(s)
                          ? 'Le trajet de ce voyageur est terminé. Choisissez un autre trajet pour envoyer votre colis.'
                          : `Ce voyageur a refusé votre offre de ${fcfa(s.proposedPrice)}. Proposez un tarif plus élevé pour augmenter vos chances qu'il accepte votre colis.`}
                      </span>
                    </div>
                  )}

                  {s.status === 'livre' ? (
                    <div className="ship-grid">
                      <div>
                        <div className="k">Montant payé</div>
                        <div className="v">{fcfa(s.proposedPrice)}</div>
                      </div>
                      <div>
                        <div className="k">Valeur déclarée</div>
                        <div className="v">{fcfa(s.declaredValue)}</div>
                      </div>
                      <div>
                        <div className="k">Voyageur</div>
                        <div className="v">{s.voyageurName}</div>
                      </div>
                      <div>
                        <div className="k">Destinataire</div>
                        <div className="v">{s.recipientName || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="ship-grid">
                      <div>
                        <div className="k">Poids</div>
                        <div className="v">{s.weightKg} kg</div>
                      </div>
                      <div>
                        <div className="k">Valeur déclarée</div>
                        <div className="v">{fcfa(s.declaredValue)}</div>
                      </div>
                      <div>
                        <div className="k">Tarif proposé</div>
                        <div className="v">{fcfa(s.proposedPrice)}</div>
                      </div>
                      <div>
                        <div className="k">Destinataire</div>
                        <div className="v">{s.recipientName || '—'}</div>
                      </div>
                    </div>
                  )}

                  {s.status === 'refuse' && isTripDateExpiredFor(s) && (
                    <div className="actions-row">
                      <button className="btn-sm primary" onClick={() => setChangeTripFor(s)}>
                        <Car size={14} /> Changer de trajet
                      </button>
                    </div>
                  )}

                  {s.status === 'refuse' && !isTripDateExpiredFor(s) && (
                    <>
                      {editingPriceId === s.id ? (
                        <div className="price-boost-form">
                          <input
                            type="number"
                            min={s.proposedPrice + 1}
                            placeholder={`Supérieur à ${fcfa(s.proposedPrice)}`}
                            value={priceEdits[s.id] || ''}
                            onChange={(e) =>
                              setPriceEdits((prev) => ({ ...prev, [s.id]: e.target.value }))
                            }
                          />
                          <div className="actions-row">
                            <button
                              className="btn-sm primary"
                              onClick={() => resubmitOffer(s, priceEdits[s.id])}
                            >
                              <ArrowRight size={14} /> Renvoyer l'offre au voyageur
                            </button>
                            <button className="btn-sm ghost" onClick={() => setEditingPriceId(null)}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="actions-row">
                          <button
                            className="btn-sm primary"
                            onClick={() => {
                              setEditingPriceId(s.id);
                              setPriceEdits((prev) => ({ ...prev, [s.id]: '' }));
                            }}
                          >
                            <Pencil size={14} /> Modifier le tarif proposé
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {['paye', 'expedie'].includes(s.status) && (
                    <div className="contact-block">
                      <div className="contact-row">
                        <div>
                          <div className="contact-who">Voyageur</div>
                          <div className="contact-name">{s.voyageurName}</div>
                        </div>
                        {s.voyageurPhone ? (
                          <a className="contact-call" href={'tel:' + s.voyageurPhone}>
                            <Phone size={13} /> {s.voyageurPhone}
                          </a>
                        ) : (
                          <span className="helper" style={{ margin: 0 }}>
                            Numéro non renseigné
                          </span>
                        )}
                      </div>

                      {s.locationSharing && s.liveLocation ? (
                        <div className="live-location">
                          <div className="live-location-head">
                            <span className="live-dot" />
                            Position en direct
                            <span className="live-time">
                              {formatAgo(Date.now() - s.liveLocation.updatedAt)}
                            </span>
                          </div>
                          <iframe
                            title="Position du voyageur en direct"
                            className="live-map-frame"
                            src={mapsLiveEmbedUrl(s.liveLocation.lat, s.liveLocation.lng)}
                            loading="lazy"
                          />
                          <a
                            className="btn-track"
                            href={mapsLiveUrl(s.liveLocation.lat, s.liveLocation.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin size={15} /> Ouvrir la position exacte dans Google Maps
                          </a>
                        </div>
                      ) : (
                        <>
                          <a
                            className="btn-track"
                            href={mapsRouteUrl(s.tripFrom, s.tripTo)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin size={15} /> Suivre l'itinéraire sur Google Maps
                          </a>
                          <p className="helper" style={{ marginTop: 8 }}>
                            Affiche l'itinéraire {s.tripFrom} → {s.tripTo}. Le voyageur n'a pas encore
                            activé le partage de sa position en direct.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {s.status === 'accepte' && (
                    <div className="actions-row">
                      <button className="btn-sm primary" onClick={() => setPaymentFor(s)}>
                        <ShieldCheck size={14} /> Payer {fcfa(s.proposedPrice)}
                      </button>
                    </div>
                  )}

                  {(s.status === 'expedie' || s.status === 'livre') && s.pickupCode && (
                    <>
                      <div className="code-box">
                        <div>
                          <div className="lab">Code de retrait — à transmettre au destinataire</div>
                          <div className="code cge-mono">{s.pickupCode}</div>
                        </div>
                        <KeyRound size={20} color="#F5A623" />
                      </div>
                      <div className="code-warning">
                        <ShieldCheck size={14} />
                        <span>
                          Important : transmettez ce code <b>uniquement au destinataire</b>, jamais au
                          voyageur à l'avance. Le destinataire ne doit communiquer ce code au voyageur
                          qu'une fois le colis physiquement en main — c'est ce qui prouve la remise.
                        </span>
                      </div>
                    </>
                  )}

                  {s.status === 'livre' && (
                    <>
                      <div className="actions-row" style={{ alignItems: 'center' }}>
                        <span className="badge" style={{ background: '#E1F4F3', color: 'var(--teal-dark)' }}>
                          <CheckCircle2 size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                          Colis remis avec succès
                        </span>
                      </div>
                      <ReviewBlock
                        existing={myReviewsByShipment[s.id]}
                        onSubmit={(rating, comment) => submitReview(s, rating, comment)}
                      />
                    </>
                  )}
                  </>
                  )}
                </div>
                );
              })}
            </>
          )}

          {tab === 'mestrajets' && (
            <>
              <div className="section-title">Mes trajets</div>
              <div className="section-sub">Gérez vos trajets publiés et les colis à transporter.</div>

              <div className="segment-toggle">
                <button
                  type="button"
                  className={'segment-btn ' + (mesTrajetsView === 'trajets' ? 'active' : '')}
                  onClick={() => setMesTrajetsView('trajets')}
                >
                  <Car size={15} /> Trajet publié
                </button>
                <button
                  type="button"
                  className={'segment-btn ' + (mesTrajetsView === 'colis' ? 'active' : '')}
                  onClick={() => setMesTrajetsView('colis')}
                >
                  <Package size={15} /> Colis à envoyer
                  {trajetsActionCount > 0 && (
                    <span className="seg-badge">{String(trajetsActionCount).padStart(2, '0')}</span>
                  )}
                </button>
              </div>

              {mesTrajetsView === 'trajets' && (
                <>
              {myTrips.length === 0 && (
                <div className="empty-state">
                  <Truck size={34} />
                  <div className="t">Vous n'avez publié aucun trajet</div>
                  <div>Passez sur l'onglet Trajets pour en publier un.</div>
                </div>
              )}

              {myTrips.length > 0 && (
                <>
                  <div className="section-title" style={{ fontSize: '1rem' }}>
                    Trajets publiés
                  </div>
                  {myTrips.map((t) => {
                    const expired = isTripExpired(t);
                    const linkedShipments = shipments.filter((s) => s.tripId === t.id);
                    const hasActiveShipments = linkedShipments.some((s) =>
                      ['accepte', 'paye', 'expedie'].includes(s.status)
                    );
                    return (
                      <div className="ship-card" key={t.id}>
                        <div className="ship-top">
                          <div>
                            <div className="ship-title">
                              {t.from} → {t.to}
                            </div>
                            <div className="ship-route">Départ {formatDate(t.date)}</div>
                          </div>
                          <span
                            className="badge"
                            style={{
                              background: t.adminDisabled ? '#FBE4E1' : expired ? '#F0EEE5' : '#DFF5E6',
                              color: t.adminDisabled ? 'var(--coral)' : expired ? 'var(--slate)' : '#0F7A3D',
                            }}
                          >
                            {t.adminDisabled ? 'Désactivé' : expired ? 'Expiré' : 'Actif'}
                          </span>
                        </div>
                        <div className="actions-row">
                          <button className="btn-sm ghost" onClick={() => openEditTrip(t)}>
                            <Pencil size={14} /> Modifier
                          </button>
                          <button
                            className="btn-sm coral"
                            onClick={() => {
                              if (hasActiveShipments) {
                                notify(
                                  'Ce trajet a des envois en cours — vous pouvez le désactiver plutôt que le supprimer',
                                  'error'
                                );
                                return;
                              }
                              setConfirmDeleteTrip(t);
                            }}
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                        {expired && !t.adminDisabled && (
                          <p className="helper" style={{ marginTop: 8 }}>
                            Ce trajet n'apparaît plus dans les recherches car sa date est passée. Modifiez
                            la date pour le republier automatiquement.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
                </>
              )}

              {mesTrajetsView === 'colis' && (
                <>
              {incomingShipments.length === 0 && (
                <div className="empty-state">
                  <Package size={34} />
                  <div className="t">Aucun colis à transporter</div>
                  <div>Les demandes de colis sur vos trajets apparaîtront ici.</div>
                </div>
              )}

              {incomingShipments.map((s) => (
                <div className="ship-card" key={s.id}>
                  <div className="ship-top">
                    <div>
                      <div className="ship-title">{s.description || 'Colis'}</div>
                      <div className="ship-route">
                        {s.tripFrom} → {s.tripTo} · de {s.expediteurName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <StatusBadge status={s.status} />
                      {s.paymentSkipped && (
                        <span className="badge" style={{ background: '#F0EEE5', color: 'var(--slate)' }}>
                          Paiement sauté (test)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ship-grid">
                    <div>
                      <div className="k">Poids</div>
                      <div className="v">{s.weightKg} kg</div>
                    </div>
                    <div>
                      <div className="k">Valeur déclarée</div>
                      <div className="v">{fcfa(s.declaredValue)}</div>
                    </div>
                    <div>
                      <div className="k">Vous recevrez (70%)</div>
                      <div className="v">{fcfa(s.proposedPrice * 0.7)}</div>
                    </div>
                    <div>
                      <div className="k">Commission (30%)</div>
                      <div className="v">{fcfa(s.proposedPrice * 0.3)}</div>
                    </div>
                  </div>

                  {['paye', 'expedie', 'livre'].includes(s.status) && (
                    <div className="contact-block">
                      <div className="contact-row">
                        <div>
                          <div className="contact-who">Expéditeur</div>
                          <div className="contact-name">{s.expediteurName}</div>
                        </div>
                        {s.expediteurPhone ? (
                          <a className="contact-call" href={'tel:' + s.expediteurPhone}>
                            <Phone size={13} /> {s.expediteurPhone}
                          </a>
                        ) : (
                          <span className="helper" style={{ margin: 0 }}>
                            Numéro non renseigné
                          </span>
                        )}
                      </div>
                      <div className="contact-row">
                        <div>
                          <div className="contact-who">Destinataire</div>
                          <div className="contact-name">{s.recipientName || '—'}</div>
                        </div>
                        {s.recipientPhone ? (
                          <a className="contact-call" href={'tel:' + s.recipientPhone}>
                            <Phone size={13} /> {s.recipientPhone}
                          </a>
                        ) : (
                          <span className="helper" style={{ margin: 0 }}>
                            Numéro non renseigné
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {s.status === 'en_attente' && (
                    <div className="actions-row">
                      <button className="btn-sm teal" onClick={() => acceptShipment(s.id)}>
                        <CheckCircle2 size={14} /> Accepter
                      </button>
                      <button className="btn-sm coral" onClick={() => refuseShipment(s.id)}>
                        <XCircle size={14} /> Refuser
                      </button>
                    </div>
                  )}

                  {s.status === 'paye' && (
                    <div className="helper" style={{ marginTop: 10 }}>
                      Paiement confirmé — le passage en "colis en transit" se fait automatiquement dès que
                      PayDunya confirme la transaction (généralement quelques secondes).
                    </div>
                  )}

                  {s.status === 'expedie' && (
                    <>
                      <div className="actions-row">
                        <button
                          className={'btn-sm ' + (s.locationSharing ? 'coral' : 'teal')}
                          onClick={() => toggleLocationSharing(s)}
                        >
                          <MapPin size={14} />
                          {s.locationSharing ? 'Arrêter le partage de position' : 'Partager ma position'}
                        </button>
                      </div>
                      <div className="helper" style={{ marginTop: 10 }}>
                        Demandez au destinataire le code à 5 caractères qu'il a reçu, puis validez la
                        remise.
                      </div>
                      <div className="code-entry">
                        <input
                          placeholder="CODE À 5 CARACTÈRES"
                          maxLength={5}
                          value={codeInputs[s.id] || ''}
                          onChange={(e) =>
                            setCodeInputs((c) => ({
                              ...c,
                              [s.id]: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5),
                            }))
                          }
                        />
                      </div>

                      <div className="actions-row">
                        <button className="btn-sm teal" onClick={() => confirmDelivery(s)}>
                          <KeyRound size={14} /> Valider la remise
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
                </>
              )}
            </>
          )}

          {tab === 'portefeuille' && (
            <>
              <div className="wallet-hero">
                <div className="lab">SOLDE TOTAL VOYAGEUR</div>
                <div className="big cge-mono">{fcfa(walletTotal)}</div>
                <div className="wallet-row">
                  <div className="wallet-stat">
                    <div className="l">Disponible</div>
                    <div className="v">{fcfa(walletDisponible)}</div>
                  </div>
                  <div className="wallet-stat">
                    <div className="l">En attente</div>
                    <div className="v">{fcfa(walletEnAttente)}</div>
                  </div>
                </div>
                {walletDisponible > 0 ? (
                  <button className="withdraw-btn" onClick={() => setWithdrawConfirm(true)}>
                    <Banknote size={17} /> Retirer {fcfa(walletDisponible)}
                  </button>
                ) : (
                  <div className="withdraw-empty">
                    Le bouton de retrait apparaît ici dès qu'une livraison est validée par le destinataire.
                  </div>
                )}
              </div>

              <div className="section-title" style={{ fontSize: '1rem' }}>
                Dépenses en tant qu'expéditeur
              </div>
              <div className="ship-card" style={{ marginTop: 8 }}>
                <div className="ship-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div>
                    <div className="k">Total dépensé</div>
                    <div className="v" style={{ fontSize: '1.1rem' }}>
                      {fcfa(totalDepense)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-title" style={{ fontSize: '1rem', marginTop: 20 }}>
                Historique des transactions
              </div>
              <div className="ship-card">
                {txHistory.length === 0 && (
                  <div className="helper">Aucune transaction pour le moment.</div>
                )}
                {txHistory.map((s) => {
                  const iAmVoyageur = s.voyageurName === profile.name;
                  return (
                    <div className="tx-row" key={s.id}>
                      <div className="tx-left">
                        <div
                          className="tx-icon"
                          style={{
                            background: iAmVoyageur ? '#E1F4F3' : '#FDF0DA',
                            color: iAmVoyageur ? 'var(--teal-dark)' : 'var(--amber-dark)',
                          }}
                        >
                          {iAmVoyageur ? <Truck size={16} /> : <Package size={16} />}
                        </div>
                        <div>
                          <div className="tx-title">{s.description || 'Colis'}</div>
                          <div className="tx-sub">
                            {s.tripFrom} → {s.tripTo} · {STATUS_META[s.status].label}
                          </div>
                        </div>
                      </div>
                      <div
                        className="tx-amount"
                        style={{ color: iAmVoyageur ? 'var(--teal-dark)' : 'var(--ink)' }}
                      >
                        {iAmVoyageur ? '+' + fcfa(s.proposedPrice * 0.7) : '-' + fcfa(s.proposedPrice)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {myWithdrawals.length > 0 && (
                <>
                  <div className="section-title" style={{ fontSize: '1rem', marginTop: 20 }}>
                    Historique des retraits
                  </div>
                  <div className="ship-card">
                    {myWithdrawals.map((w) => (
                      <div className="tx-row" key={w.id}>
                        <div className="tx-left">
                          <div className="tx-icon" style={{ background: '#FDF0DA', color: 'var(--amber-dark)' }}>
                            <Banknote size={16} />
                          </div>
                          <div>
                            <div className="tx-title">
                              Retrait vers mobile money{w.operateur ? ` (${w.operateur})` : ''}
                            </div>
                            <div className="tx-sub">
                              {new Date(w.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ·{' '}
                              {w.statut === 'reussi'
                                ? 'Traité'
                                : w.statut === 'echoue'
                                ? 'Échoué'
                                : 'En attente de traitement'}
                            </div>
                          </div>
                        </div>
                        <div className="tx-amount" style={{ color: 'var(--ink)' }}>
                          -{fcfa(w.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="disclaimer">
                <ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                Prototype fonctionnel — les paiements et retraits sont simulés et enregistrés dans le
                stockage de l'application. Aucun établissement bancaire n'est connecté. La répartition
                appliquée est 70&nbsp;% pour le voyageur et 30&nbsp;% de commission pour la plateforme,
                débloquée après validation du code de retrait par le destinataire.
              </div>
            </>
          )}

          {tab === 'admin' && isAdmin && (
            <>
              <div className="admin-header">
                <button className="admin-menu-btn" onClick={() => setShowAdminMenu(true)}>
                  <Menu size={18} />
                </button>
                <div>
                  <div className="section-title" style={{ margin: 0 }}>
                    {adminSection === 'kyc' && 'Vérification KYC'}
                    {adminSection === 'trips' && 'Trajets publiés'}
                    {adminSection === 'shipments' && 'Tous les envois'}
                    {adminSection === 'users' && 'Utilisateurs inscrits'}
                    {adminSection === 'reviews' && 'Avis des expéditeurs'}
                    {adminSection === 'messages' && 'Messages de contact'}
                    {adminSection === 'retraits' && 'Demandes de retrait'}
                  </div>
                  <div className="section-sub" style={{ marginBottom: 0 }}>
                    {adminSection === 'kyc' &&
                      "Vérifiez la pièce d'identité et le selfie de chaque voyageur avant d'approuver."}
                    {adminSection === 'trips' && "Modifiez, désactivez ou supprimez n'importe quel trajet."}
                    {adminSection === 'shipments' &&
                      "Tous les colis et envois de la plateforme. La suppression est définitive et irréversible."}
                    {adminSection === 'users' &&
                      "Tous les comptes inscrits, approuvés ou non. Supprimer un compte l'efface définitivement, avec tout son historique."}
                    {adminSection === 'reviews' && 'Modérez les avis laissés sur les voyageurs.'}
                    {adminSection === 'retraits' && 'Marquez les retraits comme traités une fois le paiement envoyé.'}
                    {adminSection === 'messages' &&
                      "Questions envoyées depuis le chat du support quand aucune réponse prédéfinie ne correspondait."}
                  </div>
                </div>
              </div>

              {adminSection === 'shipments' && (
                <>
                  {adminShipments.length > 0 && (
                    <AdminSearchBar
                      value={searchShipments}
                      onChange={(v) => {
                        setSearchShipments(v);
                        setPageShipments(1);
                      }}
                      placeholder="Rechercher par ville, description, nom…"
                    />
                  )}
                  {adminShipments.length === 0 && (
                    <div className="empty-state">
                      <Package size={34} />
                      <div className="t">Aucun envoi pour l'instant</div>
                    </div>
                  )}
                  {adminShipments.length > 0 && shipmentsSearch.items.length === 0 && (
                    <div className="empty-state">
                      <Search size={34} />
                      <div className="t">Aucun résultat</div>
                    </div>
                  )}
                  {shipmentsSearch.items.map((s) => (
                    <div className="ship-card" key={s.id}>
                      <div className="ship-top">
                        <div>
                          <div className="ship-title">
                            {s.from} → {s.to}
                          </div>
                          <div className="ship-route">
                            {s.description} · {fcfa(s.prix)}
                          </div>
                        </div>
                        <StatusBadge status={s.statut} />
                      </div>
                      <div className="ship-grid">
                        <div>
                          <div className="k">Voyageur</div>
                          <div className="v">{s.voyageurName}</div>
                        </div>
                        <div>
                          <div className="k">Expéditeur</div>
                          <div className="v">{s.expediteurName}</div>
                        </div>
                        <div>
                          <div className="k">Créé le</div>
                          <div className="v">{formatDate(s.createdAt)}</div>
                        </div>
                      </div>
                      <div className="actions-row">
                        <button className="btn-sm coral" onClick={() => setConfirmDeleteShipment(s)}>
                          <Trash2 size={14} /> Supprimer l'envoi
                        </button>
                      </div>
                    </div>
                  ))}
                  <AdminPagination
                    page={shipmentsSearch.page}
                    totalPages={shipmentsSearch.totalPages}
                    totalItems={shipmentsSearch.total}
                    onChange={setPageShipments}
                  />
                </>
              )}

              {adminSection === 'users' && (
                <>
                  {adminUsers.length > 0 && (
                    <AdminSearchBar
                      value={searchUsers}
                      onChange={(v) => {
                        setSearchUsers(v);
                        setPageUsers(1);
                      }}
                      placeholder="Rechercher par nom, e-mail, téléphone…"
                    />
                  )}
                  {adminUsers.length === 0 && (
                    <div className="empty-state">
                      <User size={34} />
                      <div className="t">Aucun utilisateur pour l'instant</div>
                    </div>
                  )}
                  {adminUsers.length > 0 && usersSearch.items.length === 0 && (
                    <div className="empty-state">
                      <Search size={34} />
                      <div className="t">Aucun résultat</div>
                    </div>
                  )}
                  {usersSearch.items.map((u) => (
                    <div className="ship-card" key={u.id}>
                      <div className="ship-top">
                        <div>
                          <div className="ship-title">
                            {u.nom_complet}
                            {u.est_admin && (
                              <span className="role-tag" style={{ marginLeft: 6 }}>
                                Admin
                              </span>
                            )}
                            {u.id === profile.id && (
                              <span className="badge" style={{ marginLeft: 6, background: '#F0EEE5', color: 'var(--slate)' }}>
                                C'est vous
                              </span>
                            )}
                          </div>
                          <div className="ship-route">
                            {u.email} {u.telephone ? '· ' + u.telephone : ''}
                          </div>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background:
                              u.statut_verification === 'verifie'
                                ? '#DFF5E6'
                                : u.statut_verification === 'rejete'
                                ? '#FBE4E1'
                                : '#FDF0DA',
                            color:
                              u.statut_verification === 'verifie'
                                ? '#0F7A3D'
                                : u.statut_verification === 'rejete'
                                ? 'var(--coral)'
                                : 'var(--amber-dark)',
                          }}
                        >
                          {u.statut_verification === 'verifie'
                            ? 'Approuvé'
                            : u.statut_verification === 'rejete'
                            ? 'Refusé'
                            : 'Non approuvé'}
                        </span>
                      </div>
                      <div className="ship-grid">
                        <div>
                          <div className="k">Note moyenne</div>
                          <div className="v">{u.note_moyenne ? `${u.note_moyenne} / 5` : '—'}</div>
                        </div>
                        <div>
                          <div className="k">Colis envoyés</div>
                          <div className="v">{u.nombre_colis_envoyes || 0}</div>
                        </div>
                        <div>
                          <div className="k">Livraisons</div>
                          <div className="v">{u.nombre_livraisons || 0}</div>
                        </div>
                        <div>
                          <div className="k">Inscrit le</div>
                          <div className="v">{formatDate(new Date(u.created_at).getTime())}</div>
                        </div>
                      </div>
                      <div className="actions-row">
                        {u.id !== profile.id &&
                          (u.est_admin ? (
                            <button
                              className="btn-sm ghost"
                              onClick={() => setConfirmToggleAdmin({ user: u, makeAdmin: false })}
                            >
                              <XCircle size={14} /> Retirer les droits admin
                            </button>
                          ) : (
                            <button
                              className="btn-sm teal"
                              onClick={() => setConfirmToggleAdmin({ user: u, makeAdmin: true })}
                            >
                              <BadgeCheck size={14} /> Promouvoir admin
                            </button>
                          ))}
                        {!u.est_admin && (
                          <button className="btn-sm coral" onClick={() => setConfirmDeleteUser(u)}>
                            <Trash2 size={14} /> Supprimer le compte
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <AdminPagination
                    page={usersSearch.page}
                    totalPages={usersSearch.totalPages}
                    totalItems={usersSearch.total}
                    onChange={setPageUsers}
                  />
                </>
              )}

              {adminSection === 'kyc' && (
                <>
                  {sortedKycRequests.length > 0 && (
                    <AdminSearchBar
                      value={searchKyc}
                      onChange={(v) => {
                        setSearchKyc(v);
                        setPageKyc(1);
                      }}
                      placeholder="Rechercher par nom, téléphone…"
                    />
                  )}
                  {sortedKycRequests.length === 0 && (
                    <div className="empty-state">
                      <BadgeCheck size={34} />
                      <div className="t">Aucune demande de vérification</div>
                      <div>Les soumissions des voyageurs apparaîtront ici.</div>
                    </div>
                  )}
                  {sortedKycRequests.length > 0 && kycSearch.items.length === 0 && (
                    <div className="empty-state">
                      <Search size={34} />
                      <div className="t">Aucun résultat</div>
                    </div>
                  )}

                  {kycSearch.items.map((r) => {
                    const kycExpanded = expandedKyc[r.id] !== false;
                    return (
                    <div className="ship-card" key={r.id}>
                      <div className="ship-top">
                        <div>
                          <div className="ship-title">
                            {r.name} <span className="role-tag">{r.context === 'expediteur' ? 'Expéditeur' : 'Voyageur'}</span>
                          </div>
                          <div className="ship-route">{r.telephone}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="badge"
                            style={{
                              background:
                                r.status === 'approved' ? '#DFF5E6' : r.status === 'rejected' ? '#FBE4E1' : '#FDF0DA',
                              color:
                                r.status === 'approved'
                                  ? '#0F7A3D'
                                  : r.status === 'rejected'
                                  ? 'var(--coral)'
                                  : 'var(--amber-dark)',
                            }}
                          >
                            {r.status === 'approved' ? 'Approuvé' : r.status === 'rejected' ? 'Refusé' : 'En attente'}
                          </span>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 26, height: 26 }}
                            onClick={() => setExpandedKyc((prev) => ({ ...prev, [r.id]: !kycExpanded }))}
                            aria-label={kycExpanded ? 'Réduire' : 'Déplier'}
                          >
                            {kycExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </div>

                      {kycExpanded && (
                      <>
                      <div className="ship-grid">
                        <div>
                          <div className="k">Date de naissance</div>
                          <div className="v">{r.dateNaissance || '—'}</div>
                        </div>
                        <div>
                          <div className="k">Lieu de naissance</div>
                          <div className="v">{r.lieuNaissance || '—'}</div>
                        </div>
                        <div>
                          <div className="k">Document</div>
                          <div className="v">
                            {r.docType === 'cni'
                              ? 'Carte nationale'
                              : r.docType === 'permis'
                              ? 'Permis de conduire'
                              : r.docType === 'passeport'
                              ? 'Passeport'
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="k">Soumis le</div>
                          <div className="v">{formatDate(r.submittedAt)}</div>
                        </div>
                      </div>

                      <div className="admin-photos">
                        <div className="admin-photo-block">
                          {r.docImage ? (
                            <img
                              src={r.docImage}
                              alt="Pièce d'identité"
                              onClick={() => setLightboxImage(r.docImage)}
                              style={{ cursor: 'zoom-in' }}
                            />
                          ) : (
                            <div />
                          )}
                          <span>Pièce d'identité</span>
                        </div>
                        <div className="admin-photo-block">
                          {r.selfieImage ? (
                            <img
                              src={r.selfieImage}
                              alt="Selfie"
                              onClick={() => setLightboxImage(r.selfieImage)}
                              style={{ cursor: 'zoom-in' }}
                            />
                          ) : (
                            <div />
                          )}
                          <span>Selfie</span>
                        </div>
                      </div>
                      </>
                      )}

                      {r.status === 'pending' && (
                        <div className="actions-row">
                          <button className="btn-sm teal" onClick={() => decideKyc(r.id, 'approved')}>
                            <CheckCircle2 size={14} /> Approuver
                          </button>
                          <button className="btn-sm coral" onClick={() => decideKyc(r.id, 'rejected')}>
                            <XCircle size={14} /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  <AdminPagination
                    page={kycSearch.page}
                    totalPages={kycSearch.totalPages}
                    totalItems={kycSearch.total}
                    onChange={setPageKyc}
                  />
                </>
              )}

              {adminSection === 'trips' && (
                <>
              <div className="section-sub" style={{ marginBottom: 12 }}>Modifiez, désactivez ou supprimez n'importe quel trajet.</div>

              {sortedAllTrips.length > 0 && (
                <AdminSearchBar
                  value={searchTrips}
                  onChange={(v) => {
                    setSearchTrips(v);
                    setPageTrips(1);
                  }}
                  placeholder="Rechercher par ville, voyageur…"
                />
              )}
              {sortedAllTrips.length === 0 && (
                <div className="empty-state">
                  <Car size={34} />
                  <div className="t">Aucun trajet publié</div>
                </div>
              )}
              {sortedAllTrips.length > 0 && tripsSearch.items.length === 0 && (
                <div className="empty-state">
                  <Search size={34} />
                  <div className="t">Aucun résultat</div>
                </div>
              )}

              {tripsSearch.items.map((t) => {
                const expired = isTripExpired(t);
                const adminTripExpanded = expandedAdminTrips[t.id] !== false;
                return (
                  <div className="ship-card" key={t.id}>
                    <div className="ship-top">
                      <div>
                        <div className="ship-title">
                          {t.from} → {t.to}
                        </div>
                        <div className="ship-route">
                          Voyageur {t.voyageurName} · départ {formatDate(t.date)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className="badge"
                          style={{
                            background: t.adminDisabled ? '#FBE4E1' : expired ? '#F0EEE5' : '#DFF5E6',
                            color: t.adminDisabled ? 'var(--coral)' : expired ? 'var(--slate)' : '#0F7A3D',
                          }}
                        >
                          {t.adminDisabled ? 'Désactivé' : expired ? 'Expiré' : 'Actif'}
                        </span>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 26, height: 26 }}
                          onClick={() => setExpandedAdminTrips((prev) => ({ ...prev, [t.id]: !adminTripExpanded }))}
                          aria-label={adminTripExpanded ? 'Réduire' : 'Déplier'}
                        >
                          {adminTripExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>
                    {adminTripExpanded && (
                    <div className="actions-row">
                      <button className="btn-sm ghost" onClick={() => openEditTrip(t)}>
                        <Pencil size={14} /> Modifier
                      </button>
                      <button
                        className="btn-sm ghost"
                        onClick={() => toggleTripPublication(t.id)}
                      >
                        {t.adminDisabled ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                        {t.adminDisabled ? 'Réactiver la publication' : 'Désactiver la publication'}
                      </button>
                      <button className="btn-sm coral" onClick={() => setConfirmDeleteTrip(t)}>
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                    )}
                  </div>
                );
              })}
              <AdminPagination
                page={tripsSearch.page}
                totalPages={tripsSearch.totalPages}
                totalItems={tripsSearch.total}
                onChange={setPageTrips}
              />
                </>
              )}

              {adminSection === 'reviews' && (
                <>
              <div className="section-sub" style={{ marginBottom: 12 }}>Modérez les avis laissés sur les voyageurs.</div>

              {sortedReviews.length > 0 && (
                <AdminSearchBar
                  value={searchReviews}
                  onChange={(v) => {
                    setSearchReviews(v);
                    setPageReviews(1);
                  }}
                  placeholder="Rechercher par nom, commentaire…"
                />
              )}
              {sortedReviews.length === 0 && (
                <div className="empty-state">
                  <Star size={34} />
                  <div className="t">Aucun avis pour l'instant</div>
                </div>
              )}
              {sortedReviews.length > 0 && reviewsSearch.items.length === 0 && (
                <div className="empty-state">
                  <Search size={34} />
                  <div className="t">Aucun résultat</div>
                </div>
              )}

              {reviewsSearch.items.map((r) => (
                <div className="ship-card" key={r.id}>
                  <div className="ship-top">
                    <div>
                      <div className="ship-title">{r.voyageurName}</div>
                      <div className="ship-route">
                        Par {r.expediteurName} · {formatDate(r.createdAt)}
                      </div>
                    </div>
                    <span className="rating-inline" style={{ fontSize: '0.85rem' }}>
                      <Star size={14} fill="#F5A623" /> {r.rating}/5
                    </span>
                  </div>
                  {r.comment && <p className="helper" style={{ marginTop: 6 }}>{r.comment}</p>}
                  <div className="actions-row">
                    <button className="btn-sm coral" onClick={() => deleteReview(r.id)}>
                      <Trash2 size={14} /> Supprimer l'avis
                    </button>
                  </div>
                </div>
              ))}
              <AdminPagination
                page={reviewsSearch.page}
                totalPages={reviewsSearch.totalPages}
                totalItems={reviewsSearch.total}
                onChange={setPageReviews}
              />
                </>
              )}

              {adminSection === 'messages' && (
                <>
                  <div className="actions-row" style={{ marginBottom: 12 }}>
                    <button className="btn-sm ghost" onClick={refreshSupportMessages}>
                      Actualiser
                    </button>
                  </div>

                  {supportThreads.length === 0 && (
                    <div className="empty-state">
                      <MessageCircle size={34} />
                      <div className="t">Aucun message pour l'instant</div>
                      <div>Les conversations démarrées depuis le chat apparaîtront ici.</div>
                    </div>
                  )}

                  {supportThreads.map((t) => (
                    <div className="ship-card" key={t.token}>
                      <div className="ship-top">
                        <div>
                          <div className="ship-title">{t.name}</div>
                          <div className="ship-route">{t.email}</div>
                        </div>
                        {t.awaitingReply ? (
                          <span className="badge" style={{ background: '#FDF0DA', color: 'var(--amber-dark)' }}>
                            En attente de réponse
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#DFF5E6', color: '#0F7A3D' }}>
                            Répondu
                          </span>
                        )}
                      </div>

                      <div className="admin-thread">
                        {t.messages.map((m) => (
                          <div key={m.id} className={'chat-bubble ' + (m.from === 'admin' ? 'admin' : 'user')}>
                            {m.from === 'admin' && <span className="chat-bubble-tag">Support</span>}
                            {m.text}
                          </div>
                        ))}
                      </div>

                      <div className="admin-reply-row">
                        <input
                          placeholder="Répondre à ce message…"
                          value={replyDrafts[t.token] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [t.token]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && sendAdminReply(t.token, t.email, t.name)}
                        />
                        <button className="btn-sm teal" onClick={() => sendAdminReply(t.token, t.email, t.name)}>
                          <Send size={14} /> Répondre
                        </button>
                      </div>
                      <div className="actions-row">
                        <a className="btn-sm ghost" href={'mailto:' + t.email}>
                          <Mail size={14} /> Contacter par e-mail
                        </a>
                        <button className="btn-sm coral" onClick={() => deleteSupportThread(t.token)}>
                          <Trash2 size={14} /> Supprimer la conversation
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {adminSection === 'retraits' && (
                <>
                  {adminWithdrawals.length > 0 && (
                    <AdminSearchBar
                      value={searchWithdrawals}
                      onChange={(v) => {
                        setSearchWithdrawals(v);
                        setPageWithdrawals(1);
                      }}
                      placeholder="Rechercher par nom, téléphone, opérateur…"
                    />
                  )}
                  {adminWithdrawals.length === 0 && (
                    <div className="empty-state">
                      <Banknote size={34} />
                      <div className="t">Aucune demande de retrait</div>
                    </div>
                  )}
                  {adminWithdrawals.length > 0 && withdrawalsSearch.items.length === 0 && (
                    <div className="empty-state">
                      <Search size={34} />
                      <div className="t">Aucun résultat</div>
                    </div>
                  )}
                  {withdrawalsSearch.items.map((w) => (
                    <div className="ship-card" key={w.id}>
                      <div className="ship-top">
                        <div>
                          <div className="ship-title">{w.voyageurName}</div>
                          <div className="ship-route">
                            {w.telephone} {w.operateur ? `· ${w.operateur}` : ''} ·{' '}
                            {formatDate(w.createdAt)}
                          </div>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background:
                              w.statut === 'reussi' ? '#DFF5E6' : w.statut === 'echoue' ? '#FBE4E1' : '#FDF0DA',
                            color:
                              w.statut === 'reussi'
                                ? '#0F7A3D'
                                : w.statut === 'echoue'
                                ? 'var(--coral)'
                                : 'var(--amber-dark)',
                          }}
                        >
                          {w.statut === 'reussi' ? 'Traité' : w.statut === 'echoue' ? 'Échoué' : 'En attente'}
                        </span>
                      </div>
                      <div className="ship-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div>
                          <div className="k">Montant à envoyer</div>
                          <div className="v" style={{ fontSize: '1.1rem' }}>
                            {fcfa(w.amount)}
                          </div>
                        </div>
                      </div>
                      {w.statut === 'en_attente' && (
                        <div className="actions-row">
                          <button className="btn-sm teal" onClick={() => decideWithdrawal(w.id, 'reussi')}>
                            <CheckCircle2 size={14} /> Marquer comme traité
                          </button>
                          <button className="btn-sm coral" onClick={() => decideWithdrawal(w.id, 'echoue')}>
                            <XCircle size={14} /> Marquer comme échoué
                          </button>
                        </div>
                      )}
                      <div className="actions-row">
                        <button className="btn-sm ghost" onClick={() => setConfirmDeleteWithdrawal(w)}>
                          <Trash2 size={14} /> Supprimer la demande
                        </button>
                      </div>
                    </div>
                  ))}
                  <AdminPagination
                    page={withdrawalsSearch.page}
                    totalPages={withdrawalsSearch.totalPages}
                    totalItems={withdrawalsSearch.total}
                    onChange={setPageWithdrawals}
                  />
                </>
              )}
            </>
          )}
        </div>

        {showAdminMenu && (
          <div className="overlay admin-drawer-overlay" onClick={() => setShowAdminMenu(false)}>
            <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-head">
                <h3 className="cge-display">Administration</h3>
                <button className="icon-btn" onClick={() => setShowAdminMenu(false)}>
                  <X size={16} />
                </button>
              </div>
              <button
                className={'admin-drawer-item ' + (adminSection === 'kyc' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('kyc');
                  setShowAdminMenu(false);
                }}
              >
                <BadgeCheck size={18} />
                Vérification KYC
                {pendingKycCount > 0 && (
                  <span className="nav-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                    {String(pendingKycCount).padStart(2, '0')}
                  </span>
                )}
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'trips' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('trips');
                  setShowAdminMenu(false);
                }}
              >
                <Car size={18} />
                Trajets publiés
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'shipments' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('shipments');
                  setShowAdminMenu(false);
                }}
              >
                <Package size={18} />
                Tous les envois
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'users' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('users');
                  setShowAdminMenu(false);
                }}
              >
                <User size={18} />
                Utilisateurs inscrits
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'reviews' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('reviews');
                  setShowAdminMenu(false);
                }}
              >
                <Star size={18} />
                Avis des expéditeurs
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'retraits' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('retraits');
                  setShowAdminMenu(false);
                }}
              >
                <Banknote size={18} />
                Demandes de retrait
                {adminWithdrawals.filter((w) => w.statut === 'en_attente').length > 0 && (
                  <span className="nav-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                    {String(adminWithdrawals.filter((w) => w.statut === 'en_attente').length).padStart(2, '0')}
                  </span>
                )}
              </button>
              <button
                className={'admin-drawer-item ' + (adminSection === 'messages' ? 'active' : '')}
                onClick={() => {
                  setAdminSection('messages');
                  setShowAdminMenu(false);
                }}
              >
                <MessageCircle size={18} />
                Messages de contact
                {awaitingReplyCount > 0 && (
                  <span className="nav-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                    {String(awaitingReplyCount).padStart(2, '0')}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bottom-nav">
          <button
            className={'nav-item ' + (tab === 'trajets' ? 'active' : '')}
            onClick={() => changeTab('trajets')}
          >
            <Car size={19} />
            Trajets
          </button>
          <button
            className={'nav-item ' + (tab === 'envois' ? 'active' : '')}
            onClick={() => changeTab('envois')}
          >
            <Package size={19} />
            Mes envois
            {envoisActionCount > 0 && (
              <span className="nav-badge">{String(envoisActionCount).padStart(2, '0')}</span>
            )}
          </button>
          <button
            className={'nav-item ' + (tab === 'mestrajets' ? 'active' : '')}
            onClick={() => changeTab('mestrajets')}
          >
            <Truck size={19} />
            Mes trajets
            {trajetsActionCount > 0 && (
              <span className="nav-badge">{String(trajetsActionCount).padStart(2, '0')}</span>
            )}
          </button>
          <button
            className={'nav-item ' + (tab === 'portefeuille' ? 'active' : '')}
            onClick={() => changeTab('portefeuille')}
          >
            <Wallet size={19} />
            Portefeuille
          </button>
          {isAdmin && (
            <button
              className={'nav-item ' + (tab === 'admin' ? 'active' : '')}
              onClick={() => changeTab('admin')}
            >
              <BadgeCheck size={19} />
              Admin
              {pendingKycCount > 0 && (
                <span className="nav-badge">{String(pendingKycCount).padStart(2, '0')}</span>
              )}
            </button>
          )}
        </div>

        {showVerifyForm && (
          <VerificationSheet
            onClose={() => {
              setShowVerifyForm(false);
              setPendingIdentityAction(null);
            }}
            onSubmit={submitVerification}
            wasRejected={myKycStatus === 'rejected'}
            contextLabel={
              pendingIdentityAction && pendingIdentityAction.type === 'sendShipment'
                ? 'envoyer un colis'
                : 'publier un trajet en tant que voyageur'
            }
            notify={notify}
          />
        )}
        {showKycStatus && (
          <KycStatusSheet
            onClose={() => setShowKycStatus(false)}
            request={
              profile && {
                submittedAt: profile.verificationSoumiseAt
                  ? new Date(profile.verificationSoumiseAt).getTime()
                  : Date.now(),
                docImage: profile.pieceIdentiteUrl,
                selfieImage: profile.photoUrl,
              }
            }
          />
        )}
        {showTripForm && (
          <TripFormSheet
            onClose={() => {
              setShowTripForm(false);
              setEditingTrip(null);
            }}
            onSubmit={(data) => saveTrip(data, editingTrip ? editingTrip.id : null)}
            initialTrip={editingTrip}
          />
        )}
        {shipTripTarget && (
          <ShipmentFormSheet
            trip={shipTripTarget}
            onClose={() => setShipTripTarget(null)}
            onSubmit={(data) => requestShipment(shipTripTarget, data)}
          />
        )}
        {changeTripFor && (
          <ChangeTripSheet
            shipment={changeTripFor}
            trips={trips}
            shipments={shipments}
            onClose={() => setChangeTripFor(null)}
            onSelect={(newTrip) => changeShipmentTrip(changeTripFor, newTrip)}
          />
        )}
        {paymentFor && (
          <div className="overlay" onClick={() => setPaymentFor(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-head">
                <h3 className="cge-display">Choisir un moyen de paiement</h3>
                <button className="icon-btn" onClick={() => setPaymentFor(null)}>
                  <X size={16} />
                </button>
              </div>
              <p className="helper" style={{ marginBottom: 16 }}>
                Paiement de {fcfa(paymentFor.proposedPrice)} via PayDunya. Vous serez redirigé vers une
                page de paiement sécurisée.
              </p>
              <div className="operator-grid">
                {['ORANGE', 'MTN', 'WAVE', 'MOOV'].map((op) => (
                  <button key={op} className="operator-btn" onClick={() => initiatePayment(paymentFor, op)}>
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {withdrawConfirm && (
          <div className="overlay" onClick={() => setWithdrawConfirm(false)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-head">
                <h3 className="cge-display">Retirer mes fonds</h3>
                <button className="icon-btn" onClick={() => setWithdrawConfirm(false)}>
                  <X size={16} />
                </button>
              </div>
              <p className="helper" style={{ marginBottom: 16 }}>
                Demande de retrait de {fcfa(walletDisponible)} vers le {profile.telephone || 'numéro de votre profil'}.
                Elle sera traitée par notre équipe.
              </p>
              <div className="operator-grid">
                {['ORANGE', 'MTN', 'WAVE', 'MOOV'].map((op) => (
                  <button key={op} className="operator-btn" onClick={() => withdrawFunds(walletDisponible, op)}>
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {lightboxImage && (
          <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
            <button
              type="button"
              className="icon-btn lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
            <img src={lightboxImage} alt="Aperçu" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
        {viewReviewsFor && (
          <ReviewsSheet
            trip={viewReviewsFor}
            reviews={publishedReviewsFor(viewReviewsFor.voyageurId)}
            onClose={() => setViewReviewsFor(null)}
          />
        )}
        {confirmDeleteTrip && (
          <div className="overlay" onClick={() => setConfirmDeleteTrip(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-sheet">
                <div className="confirm-icon">
                  <Trash2 size={24} />
                </div>
                <h3 className="cge-display">Supprimer ce trajet ?</h3>
                <p>
                  Le trajet {confirmDeleteTrip.from} → {confirmDeleteTrip.to} du{' '}
                  {formatDate(confirmDeleteTrip.date)} sera définitivement supprimé. Cette action est
                  irréversible.
                </p>
                <div className="confirm-actions">
                  <button className="btn-sm ghost" onClick={() => setConfirmDeleteTrip(null)}>
                    Annuler
                  </button>
                  <button
                    className="btn-sm coral"
                    onClick={() => {
                      deleteTrip(confirmDeleteTrip.id);
                      setConfirmDeleteTrip(null);
                    }}
                  >
                    <Trash2 size={14} /> Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmDeleteShipment && (
          <div className="overlay" onClick={() => setConfirmDeleteShipment(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-sheet">
                <div className="confirm-icon">
                  <Trash2 size={24} />
                </div>
                <h3 className="cge-display">Supprimer cet envoi ?</h3>
                <p>
                  L'envoi {confirmDeleteShipment.from} → {confirmDeleteShipment.to} (
                  {confirmDeleteShipment.description}) sera définitivement supprimé de la base de
                  données, avec son historique de paiement, de messages et d'avis liés. Cette action est
                  irréversible.
                </p>
                <div className="confirm-actions">
                  <button className="btn-sm ghost" onClick={() => setConfirmDeleteShipment(null)}>
                    Annuler
                  </button>
                  <button className="btn-sm coral" onClick={() => deleteAdminShipment(confirmDeleteShipment.id)}>
                    <Trash2 size={14} /> Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmDeleteUser && (
          <div className="overlay" onClick={() => setConfirmDeleteUser(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-sheet">
                <div className="confirm-icon">
                  <Trash2 size={24} />
                </div>
                <h3 className="cge-display">Supprimer ce compte ?</h3>
                <p>
                  Le compte de <b>{confirmDeleteUser.nom_complet}</b> ({confirmDeleteUser.email}) sera
                  définitivement supprimé — connexion, profil, trajets, colis, envois, avis, paiements et
                  retraits compris. Cette action est irréversible.
                </p>
                <div className="confirm-actions">
                  <button className="btn-sm ghost" onClick={() => setConfirmDeleteUser(null)}>
                    Annuler
                  </button>
                  <button className="btn-sm coral" onClick={() => deleteAdminUser(confirmDeleteUser)}>
                    <Trash2 size={14} /> Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmDeleteWithdrawal && (
          <div className="overlay" onClick={() => setConfirmDeleteWithdrawal(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-sheet">
                <div className="confirm-icon">
                  <Trash2 size={24} />
                </div>
                <h3 className="cge-display">Supprimer cette demande de retrait ?</h3>
                <p>
                  La demande de {fcfa(confirmDeleteWithdrawal.amount)} sera définitivement supprimée de
                  la base de données. Cette action est irréversible.
                </p>
                <div className="confirm-actions">
                  <button className="btn-sm ghost" onClick={() => setConfirmDeleteWithdrawal(null)}>
                    Annuler
                  </button>
                  <button
                    className="btn-sm coral"
                    onClick={() => deleteAdminWithdrawal(confirmDeleteWithdrawal.id)}
                  >
                    <Trash2 size={14} /> Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmToggleAdmin && (
          <div className="overlay" onClick={() => setConfirmToggleAdmin(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-sheet">
                <div className="confirm-icon" style={{ background: '#E1F4F3', color: 'var(--teal-dark)' }}>
                  <BadgeCheck size={24} />
                </div>
                <h3 className="cge-display">
                  {confirmToggleAdmin.makeAdmin ? 'Nommer administrateur ?' : "Retirer les droits admin ?"}
                </h3>
                <p>
                  {confirmToggleAdmin.makeAdmin ? (
                    <>
                      <b>{confirmToggleAdmin.user.nom_complet}</b> pourra approuver les identités, gérer
                      les trajets, envois, avis, retraits et utilisateurs — comme vous.
                    </>
                  ) : (
                    <>
                      <b>{confirmToggleAdmin.user.nom_complet}</b> perdra l'accès au panneau
                      d'administration.
                    </>
                  )}
                </p>
                <div className="confirm-actions">
                  <button className="btn-sm ghost" onClick={() => setConfirmToggleAdmin(null)}>
                    Annuler
                  </button>
                  <button
                    className={'btn-sm ' + (confirmToggleAdmin.makeAdmin ? 'teal' : 'coral')}
                    onClick={() => toggleAdminRole(confirmToggleAdmin.user, confirmToggleAdmin.makeAdmin)}
                  >
                    <BadgeCheck size={14} />
                    {confirmToggleAdmin.makeAdmin ? 'Confirmer la nomination' : 'Confirmer le retrait'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={'toast ' + (toast.type || '')}>{toast.message}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Identity verification sheet (required to publish a trip)          */
/* ---------------------------------------------------------------- */
// Live camera capture with an on-screen guide shaped like an ID card, so the
// person can line the document up before shooting — this needs a real
// getUserMedia() video feed (a plain <input capture> can't draw an overlay,
// since that native camera UI is controlled by the OS, not the page).
function CardCameraCapture({ onCapture, onClose, onFallback }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Votre navigateur ne permet pas d'accéder à la caméra ici.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          // Some browsers report videoWidth/videoHeight as 0 for a brief
          // moment after play() resolves — wait for real metadata instead
          // of assuming the stream is ready, or the shutter button would
          // silently do nothing on the first tap.
          if (videoRef.current.videoWidth) {
            setReady(true);
          }
        }
      } catch (e) {
        setError("Impossible d'accéder à la caméra (autorisation refusée ou indisponible).");
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || capturing) return;
    setCapturing(true);
    try {
      // The guide is centered, 85% of the frame's width, at a standard ID
      // card aspect ratio (ISO/IEC 7810 ID-1 ≈ 1.586:1) — crop to exactly
      // that region so the exported photo matches what the person saw.
      const cardAspect = 1.586;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      let guideW = vw * 0.85;
      let guideH = guideW / cardAspect;
      if (guideH > vh * 0.85) {
        guideH = vh * 0.85;
        guideW = guideH * cardAspect;
      }
      const sx = (vw - guideW) / 2;
      const sy = (vh - guideH) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(guideW);
      canvas.height = Math.round(guideH);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, sx, sy, guideW, guideH, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCapture(dataUrl);
    } catch (e) {
      setCapturing(false);
      setError("Impossible de capturer la photo sur cet appareil. Vous pouvez choisir une photo depuis votre galerie.");
    }
  };

  return (
    <div className="camera-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="camera-header">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <span>Photo de la pièce d'identité</span>
        <span style={{ width: 32 }} />
      </div>

      {error ? (
        <div className="camera-error">
          <p>{error}</p>
          <button type="button" className="btn-amber" onClick={onFallback}>
            Choisir depuis la galerie
          </button>
        </div>
      ) : (
        <>
          <div className="camera-video-wrap">
            <video
              ref={videoRef}
              playsInline
              muted
              className="camera-video"
              onLoadedMetadata={() => setReady(true)}
            />
            <div className="card-guide" />
          </div>
          <p className="camera-hint">
            {ready ? 'Alignez la pièce d\'identité dans le cadre' : 'Ouverture de la caméra…'}
          </p>
          <button
            type="button"
            className="camera-shutter"
            disabled={!ready || capturing}
            onClick={capture}
            aria-label="Capturer la photo"
          >
            <span />
          </button>
        </>
      )}
    </div>
  );
}

function VerificationSheet({ onClose, onSubmit, notify, wasRejected, contextLabel }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [docType, setDocType] = useState('cni');
  const [docImage, setDocImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCardCamera, setShowCardCamera] = useState(false);
  const docInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const openPicker = (ref) => {
    if (!ref.current) {
      notify("Le sélecteur de photo n'est pas disponible sur cet appareil", 'error');
      return;
    }
    try {
      ref.current.value = '';
      ref.current.click();
    } catch (e) {
      notify("Impossible d'ouvrir la caméra ou la galerie sur cet appareil", 'error');
    }
  };

  const handleDocUpload = async (file) => {
    if (!file) return;
    setUploadingDoc(true);
    try {
      setDocImage(await compressImage(file));
    } catch (e) {
      notify('Impossible de traiter la photo, réessayez', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDocCapture = async (dataUrl) => {
    setUploadingDoc(true);
    try {
      setDocImage(await resizeDataUrl(dataUrl, 640, 0.8));
      setShowCardCamera(false);
    } catch (e) {
      notify('Impossible de traiter la photo, réessayez', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSelfieUpload = async (file) => {
    if (!file) return;
    setUploadingSelfie(true);
    try {
      setSelfieImage(await compressImage(file));
    } catch (e) {
      notify('Impossible de traiter la photo, réessayez', 'error');
    } finally {
      setUploadingSelfie(false);
    }
  };

  const age = (() => {
    if (!dateNaissance) return null;
    const dob = new Date(dateNaissance);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  })();
  const dateValid = dateNaissance && age !== null && age >= 18 && age <= 120;

  const valid =
    prenom.trim().length >= 2 &&
    nom.trim().length >= 2 &&
    isValidIvorianPhone(telephone) &&
    dateValid &&
    lieuNaissance.trim() &&
    docImage &&
    selfieImage;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">Vérification d'identité</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {wasRejected && (
          <div className="split-note" style={{ background: '#FBE4E1', color: 'var(--coral)' }}>
            <XCircle size={16} />
            <span>
              Votre précédente vérification a été refusée. Vous pouvez la reprendre en soumettant de
              nouvelles informations et photos.
            </span>
          </div>
        )}

        <div className="verify-intro">
          <ShieldCheck size={16} />
          <span>
            Pour {contextLabel || 'utiliser cette fonctionnalité'}, confirmez votre identité. Ces
            informations ne sont demandées qu'une seule fois et vos informations resteront
            confidentielles. Votre demande sera examinée par notre équipe sous 24h minimum.
          </span>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Prénom</label>
            <input
              value={prenom}
              onChange={(e) => setPrenom(onlyLetters(e.target.value))}
              placeholder="Prénom"
              minLength={2}
            />
          </div>
          <div className="field">
            <label>Nom</label>
            <input
              value={nom}
              onChange={(e) => setNom(onlyLetters(e.target.value))}
              placeholder="Nom"
              minLength={2}
            />
          </div>
        </div>
        <div className="field">
          <label>Numéro de téléphone</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={telephone}
            onChange={(e) => setTelephone(onlyDigits(e.target.value))}
            placeholder="0707123456"
          />
          {telephone.length > 0 && !isValidIvorianPhone(telephone) && (
            <p className="helper" style={{ color: 'var(--coral)' }}>
              Numéro invalide — 10 chiffres, commençant par 0 (ex. 0707123456).
            </p>
          )}
          <p className="helper">
            Ce numéro sera visible par l'expéditeur une fois son paiement validé, pour suivre son colis.
          </p>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Date de naissance</label>
            <input
              type="date"
              value={dateNaissance}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDateNaissance(e.target.value)}
            />
            {dateNaissance && !dateValid && (
              <p className="helper" style={{ color: 'var(--coral)' }}>
                Vous devez avoir au moins 18 ans pour vérifier votre identité.
              </p>
            )}
          </div>
          <div className="field">
            <label>Lieu de naissance</label>
            <input
              value={lieuNaissance}
              onChange={(e) => setLieuNaissance(sanitizeText(e.target.value, 80))}
              placeholder="Ville, pays"
              maxLength={80}
            />
          </div>
        </div>

        <div className="field">
          <label>Pièce d'identité</label>
          <div className="doctype-row">
            <button
              type="button"
              className={'doctype-btn ' + (docType === 'cni' ? 'active' : '')}
              onClick={() => setDocType('cni')}
            >
              Carte nationale
            </button>
            <button
              type="button"
              className={'doctype-btn ' + (docType === 'permis' ? 'active' : '')}
              onClick={() => setDocType('permis')}
            >
              Permis de conduire
            </button>
            <button
              type="button"
              className={'doctype-btn ' + (docType === 'passeport' ? 'active' : '')}
              onClick={() => setDocType('passeport')}
            >
              Passeport
            </button>
          </div>

          <input
            ref={docInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleDocUpload(e.target.files && e.target.files[0])}
          />

          {docImage ? (
            <div className="proof-preview">
              <img src={docImage} className="proof-thumb" alt="Pièce d'identité" />
              <div className="proof-preview-info">
                Document capturé
                <span>
                  {docType === 'cni'
                    ? 'Carte nationale d’identité'
                    : docType === 'permis'
                    ? 'Permis de conduire'
                    : 'Passeport'}
                </span>
              </div>
              <button type="button" className="proof-retake" onClick={() => setShowCardCamera(true)}>
                Reprendre
              </button>
            </div>
          ) : (
            <button type="button" className="proof-upload" onClick={() => setShowCardCamera(true)}>
              <Camera size={16} />
              {uploadingDoc ? 'Traitement de la photo…' : "Prendre une photo de la pièce"}
            </button>
          )}
        </div>

        <div className="field">
          <label>Selfie du voyageur</label>
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={(e) => handleSelfieUpload(e.target.files && e.target.files[0])}
          />

          {selfieImage ? (
            <div className="proof-preview">
              <img src={selfieImage} className="proof-thumb" alt="Selfie" />
              <div className="proof-preview-info">
                Selfie capturé
                <span>Utilisé pour comparer avec la pièce d'identité</span>
              </div>
              <button type="button" className="proof-retake" onClick={() => openPicker(selfieInputRef)}>
                Reprendre
              </button>
            </div>
          ) : (
            <button type="button" className="proof-upload" onClick={() => openPicker(selfieInputRef)}>
              <Camera size={16} />
              {uploadingSelfie ? 'Traitement de la photo…' : 'Prendre un selfie'}
            </button>
          )}
        </div>

        <button
          className="btn-amber"
          disabled={!valid || submitting}
          style={{ opacity: valid && !submitting ? 1 : 0.5 }}
          onClick={async () => {
            if (!valid || submitting) return;
            setSubmitting(true);
            try {
              await onSubmit({ prenom, nom, telephone, dateNaissance, lieuNaissance, docType, docImage, selfieImage });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <BadgeCheck size={18} /> {submitting ? 'Envoi…' : 'Envoyer pour vérification'}
        </button>
      </div>

      {showCardCamera && (
        <CardCameraCapture
          onCapture={handleDocCapture}
          onClose={() => setShowCardCamera(false)}
          onFallback={() => {
            setShowCardCamera(false);
            openPicker(docInputRef);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Pending / rejected verification status sheet                      */
/* ---------------------------------------------------------------- */
function KycStatusSheet({ onClose, request }) {
  if (!request) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">Vérification en cours</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="verify-intro">
          <Clock3 size={16} />
          <span>
            Votre pièce d'identité et votre selfie ont été transmis à notre équipe le{' '}
            {formatDate(request.submittedAt)}. La vérification prend généralement moins de 24h. Vous
            pourrez publier un trajet ou envoyer un colis dès que votre profil sera approuvé.
          </span>
        </div>

        <div className="admin-photos">
          <div className="admin-photo-block">
            {request.docImage ? <img src={request.docImage} alt="Pièce d'identité" /> : <div />}
            <span>Pièce d'identité</span>
          </div>
          <div className="admin-photo-block">
            {request.selfieImage ? <img src={request.selfieImage} alt="Selfie" /> : <div />}
            <span>Selfie</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Trip form sheet                                                    */
/* ---------------------------------------------------------------- */
/* ---------------------------------------------------------------- */
/* Review block (expéditeur note le voyageur après livraison)        */
/* ---------------------------------------------------------------- */
function ReviewBlock({ existing, onSubmit }) {
  const [rating, setRating] = useState(existing ? existing.rating : 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(!!existing);

  if (submitted) {
    const shown = existing || { rating, comment };
    return (
      <div className="review-block">
        <div className="review-head">
          <Star size={14} fill="#F5A623" color="#F5A623" />
          <span>Vous avez noté ce voyageur {shown.rating}/5</span>
        </div>
        {shown.comment && <p className="helper" style={{ margin: '4px 0 0' }}>{shown.comment}</p>}
      </div>
    );
  }

  return (
    <div className="review-block">
      <div className="review-head">Noter le voyageur</div>
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="review-star-btn"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
            aria-label={n + ' étoiles'}
          >
            <Star
              size={22}
              fill={(hoverRating || rating) >= n ? '#F5A623' : 'none'}
              color="#F5A623"
            />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(sanitizeText(e.target.value, 300))}
        placeholder="Un mot sur ce voyageur (optionnel)"
        maxLength={300}
      />
      <button
        type="button"
        className="btn-sm teal"
        disabled={!rating}
        style={{ opacity: rating ? 1 : 0.5, marginTop: 8 }}
        onClick={() => {
          if (!rating) return;
          onSubmit(rating, sanitizeText(comment, 300));
          setSubmitted(true);
        }}
      >
        <Star size={14} /> Envoyer mon avis
      </button>
    </div>
  );
}

function TripFormSheet({ onClose, onSubmit, initialTrip }) {
  const isEdit = !!initialTrip;
  const toLocalInputValue = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso; // already in datetime-local format
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  };
  const [from, setFrom] = useState(initialTrip ? initialTrip.from : '');
  const [to, setTo] = useState(initialTrip ? initialTrip.to : '');
  const [date, setDate] = useState(initialTrip ? toLocalInputValue(initialTrip.date) : '');
  const [capacityKg, setCapacityKg] = useState(initialTrip ? String(initialTrip.capacityKg) : '');
  const [pricePerKg, setPricePerKg] = useState(initialTrip ? String(initialTrip.pricePerKg) : '');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const markTouched = (f) => setTouched((t) => ({ ...t, [f]: true }));

  const fromValid = isNonEmptyText(from, 2);
  const toValid = isNonEmptyText(to, 2) && to.trim().toLowerCase() !== from.trim().toLowerCase();
  const dateValid = !!date && new Date(date).getTime() > Date.now() - 5 * 60000;
  const capacityValid = capacityKg !== '' && parseFloat(capacityKg) > 0 && parseFloat(capacityKg) <= 500;
  const priceValid = pricePerKg !== '' && parseFloat(pricePerKg) > 0 && parseFloat(pricePerKg) <= 100000;

  const valid = fromValid && toValid && dateValid && capacityValid && priceValid;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ from: sanitizeText(from, 60), to: sanitizeText(to, 60), date, capacityKg, pricePerKg, notes: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">{isEdit ? 'Modifier le trajet' : 'Publier un trajet'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="field-row">
          <div className={'field' + (touched.from && !fromValid ? ' has-error' : '')}>
            <label>Ville de départ</label>
            <input
              value={from}
              onChange={(e) => setFrom(sanitizeText(e.target.value, 60))}
              onBlur={() => markTouched('from')}
              placeholder="Abidjan"
              maxLength={60}
            />
            <FieldError show={touched.from && !fromValid}>Au moins 2 caractères.</FieldError>
          </div>
          <div className={'field' + (touched.to && !toValid ? ' has-error' : '')}>
            <label>Ville d'arrivée</label>
            <input
              value={to}
              onChange={(e) => setTo(sanitizeText(e.target.value, 60))}
              onBlur={() => markTouched('to')}
              placeholder="Yamoussoukro"
              maxLength={60}
            />
            <FieldError show={touched.to && !toValid}>
              Doit être différente de la ville de départ.
            </FieldError>
          </div>
        </div>
        <div className={'field' + (touched.date && !dateValid ? ' has-error' : '')}>
          <label>Date et heure de départ</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => markTouched('date')}
          />
          <FieldError show={touched.date && !dateValid}>
            Choisissez une date et une heure à venir.
          </FieldError>
          {isEdit && (
            <p className="helper">
              Choisissez une date à venir pour que ce trajet redevienne visible dans les recherches.
            </p>
          )}
        </div>
        <div className="field-row">
          <div className={'field' + (touched.capacityKg && !capacityValid ? ' has-error' : '')}>
            <label>Capacité disponible (kg)</label>
            <input
              type="number"
              min="0.1"
              max="500"
              step="0.1"
              value={capacityKg}
              onChange={(e) => setCapacityKg(clampNumber(e.target.value, { min: 0, max: 500 }))}
              onBlur={() => markTouched('capacityKg')}
              placeholder="20"
            />
            <FieldError show={touched.capacityKg && !capacityValid}>Entre 0,1 et 500 kg.</FieldError>
          </div>
          <div className={'field' + (touched.pricePerKg && !priceValid ? ' has-error' : '')}>
            <label>Tarif indicatif (FCFA/kg)</label>
            <input
              type="number"
              min="1"
              max="100000"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(clampNumber(e.target.value, { min: 0, max: 100000 }))}
              onBlur={() => markTouched('pricePerKg')}
              placeholder="3000"
            />
            <FieldError show={touched.pricePerKg && !priceValid}>Entre 1 et 100 000 FCFA.</FieldError>
          </div>
        </div>
        <button
          className="btn-amber"
          disabled={!valid || submitting}
          style={{ opacity: valid && !submitting ? 1 : 0.5 }}
          onClick={submit}
        >
          {submitting ? 'Envoi…' : isEdit ? 'Enregistrer et republier' : 'Publier le trajet'}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Reviews sheet (all published reviews for a voyageur)              */
/* ---------------------------------------------------------------- */
function ReviewsSheet({ trip, reviews, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">Avis sur {trip.voyageurName}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="helper" style={{ marginBottom: 14 }}>
          {reviews.length} avis publié{reviews.length > 1 ? 's' : ''} par des expéditeurs
        </div>

        {reviews.length === 0 && (
          <div className="empty-state">
            <Star size={34} />
            <div className="t">Aucun avis publié pour l'instant</div>
          </div>
        )}

        {reviews.map((r) => (
          <div className="ship-card" key={r.id}>
            <div className="ship-top">
              <div>
                <div className="ship-title">{r.expediteurName}</div>
                <div className="ship-route">{formatDate(r.createdAt)}</div>
              </div>
              <span className="rating-inline" style={{ fontSize: '0.85rem' }}>
                <Star size={14} fill="#F5A623" /> {r.rating}/5
              </span>
            </div>
            {r.comment && <p className="helper" style={{ marginTop: 6 }}>{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Change trip sheet (when the original trip has expired)            */
/* ---------------------------------------------------------------- */
function ChangeTripSheet({ shipment, trips, shipments, onClose, onSelect }) {
  const now = Date.now();
  const candidates = trips
    .filter((t) => !t.adminDisabled && new Date(t.date).getTime() >= now)
    .map((t) => {
      const used = shipments
        .filter((s) => s.tripId === t.id && ['accepte', 'paye', 'expedie', 'livre'].includes(s.status))
        .reduce((sum, s) => sum + s.weightKg, 0);
      return { ...t, remaining: Math.max(t.capacityKg - used, 0) };
    })
    .filter((t) => t.remaining >= shipment.weightKg)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">Changer de trajet</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="helper" style={{ marginBottom: 14 }}>
          Colis « {shipment.description || 'Colis'} » · {shipment.weightKg} kg
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <Car size={34} />
            <div className="t">Aucun trajet disponible</div>
            <div>
              Vous ne pouvez pas expédier de colis pour le moment, car il n'y a pas de trajet disponible.
            </div>
          </div>
        ) : (
          candidates.map((t) => (
            <div className="ship-card" key={t.id}>
              <div className="ship-top">
                <div>
                  <div className="ship-title">
                    {t.from} → {t.to}
                  </div>
                  <div className="ship-route">
                    Départ {formatDate(t.date)} · voyageur {t.voyageurName}
                  </div>
                </div>
                {t.voyageurVerified && (
                  <span className="verified-badge">
                    <BadgeCheck size={13} /> Vérifié
                  </span>
                )}
              </div>
              <div className="ship-grid">
                <div>
                  <div className="k">Capacité restante</div>
                  <div className="v">{t.remaining.toFixed(1)} kg</div>
                </div>
                <div>
                  <div className="k">Tarif indicatif</div>
                  <div className="v">{Math.round(t.pricePerKg).toLocaleString('fr-FR')} FCFA/kg</div>
                </div>
              </div>
              <div className="actions-row">
                <button className="btn-sm teal" onClick={() => onSelect(t)}>
                  <ArrowRight size={14} /> Choisir ce trajet
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Shipment form sheet                                                */
/* ---------------------------------------------------------------- */
function ShipmentFormSheet({ trip, onClose, onSubmit }) {
  const [expediteurName, setExpediteurName] = useState('');
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [expediteurPhone, setExpediteurPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const markTouched = (f) => setTouched((t) => ({ ...t, [f]: true }));

  const nameValid = expediteurName.trim().length >= 2;
  const descValid = isNonEmptyText(description, 3);
  const weightValid = weightKg !== '' && parseFloat(weightKg) > 0 && parseFloat(weightKg) <= 100;
  const valueValid = declaredValue !== '' && parseFloat(declaredValue) > 0 && parseFloat(declaredValue) <= 10000000;
  const minPrice =
    declaredValue && parseFloat(declaredValue) > 0
      ? Math.max(Math.round(parseFloat(declaredValue) * 0.12 * 100) / 100, 1000)
      : 0;
  const priceValid =
    proposedPrice !== '' &&
    parseFloat(proposedPrice) > 0 &&
    parseFloat(proposedPrice) <= 10000000 &&
    parseFloat(proposedPrice) >= minPrice;
  const phoneValid = isValidIvorianPhone(expediteurPhone);
  const recipientNameValid = recipientName.trim().length >= 2;
  const recipientPhoneValid = recipientPhone.length === 0 || isValidIvorianPhone(recipientPhone);

  const valid =
    nameValid && descValid && weightValid && valueValid && priceValid && phoneValid &&
    recipientNameValid && recipientPhoneValid;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        expediteurName,
        description: sanitizeText(description, 120),
        weightKg,
        declaredValue,
        proposedPrice,
        expediteurPhone,
        recipientName,
        recipientPhone,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="cge-display">Envoyer un colis</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="helper" style={{ marginBottom: 14 }}>
          Trajet {trip.from} → {trip.to} · départ le {formatDate(trip.date)} · {trip.voyageurName}
        </div>

        <div className={'field' + (touched.expediteurName && !nameValid ? ' has-error' : '')}>
          <label>Votre nom complet (expéditeur)</label>
          <input
            value={expediteurName}
            onChange={(e) => setExpediteurName(onlyLetters(e.target.value))}
            onBlur={() => markTouched('expediteurName')}
            placeholder="Nom complet"
            maxLength={60}
          />
          <FieldError show={touched.expediteurName && !nameValid}>Au moins 2 caractères.</FieldError>
        </div>

        <div className={'field' + (touched.description && !descValid ? ' has-error' : '')}>
          <label>Description du colis</label>
          <input
            value={description}
            onChange={(e) => setDescription(sanitizeText(e.target.value, 120))}
            onBlur={() => markTouched('description')}
            placeholder="Documents, vêtements, cadeau…"
            maxLength={120}
          />
          <FieldError show={touched.description && !descValid}>
            Décrivez le colis en quelques mots.
          </FieldError>
        </div>
        <div className="field-row">
          <div className={'field' + (touched.weightKg && !weightValid ? ' has-error' : '')}>
            <label>Poids (kg)</label>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(clampNumber(e.target.value, { min: 0, max: 100 }))}
              onBlur={() => markTouched('weightKg')}
              placeholder="2"
            />
            <FieldError show={touched.weightKg && !weightValid}>Entre 0,1 et 100 kg.</FieldError>
          </div>
          <div className={'field' + (touched.declaredValue && !valueValid ? ' has-error' : '')}>
            <label>Valeur déclarée (FCFA)</label>
            <input
              type="number"
              min="1"
              max="10000000"
              value={declaredValue}
              onChange={(e) => setDeclaredValue(clampNumber(e.target.value, { min: 0, max: 10000000 }))}
              onBlur={() => markTouched('declaredValue')}
              placeholder="50000"
            />
            <FieldError show={touched.declaredValue && !valueValid}>Montant invalide.</FieldError>
          </div>
        </div>
        <div className={'field' + (touched.proposedPrice && !priceValid ? ' has-error' : '')}>
          <label>Tarif proposé au voyageur (FCFA)</label>
          <input
            type="number"
            min="1"
            max="10000000"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(clampNumber(e.target.value, { min: 0, max: 10000000 }))}
            onBlur={() => markTouched('proposedPrice')}
            placeholder="15000"
          />
          {minPrice > 0 && (
            <p className="helper">
              Minimum requis : <b>{fcfa(minPrice)}</b> (12&nbsp;% de la valeur déclarée du colis, avec
              un plancher de 1 000 FCFA).
            </p>
          )}
          <FieldError show={touched.proposedPrice && !priceValid}>
            {proposedPrice !== '' && parseFloat(proposedPrice) < minPrice
              ? `Le tarif doit être d'au moins ${fcfa(minPrice)} (12 % de la valeur déclarée, minimum 1 000 FCFA).`
              : 'Montant invalide.'}
          </FieldError>
        </div>
        <div className={'field' + (touched.expediteurPhone && !phoneValid ? ' has-error' : '')}>
          <label>Votre numéro de téléphone (expéditeur)</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={expediteurPhone}
            onChange={(e) => setExpediteurPhone(onlyDigits(e.target.value))}
            onBlur={() => markTouched('expediteurPhone')}
            placeholder="0707123456"
          />
          <FieldError show={touched.expediteurPhone && !phoneValid}>
            10 chiffres, commençant par 0 (ex. 0707123456).
          </FieldError>
          <p className="helper">
            Visible par le voyageur une fois votre paiement validé, pour le contacter au besoin.
          </p>
        </div>
        <div className="field-row">
          <div className={'field' + (touched.recipientName && !recipientNameValid ? ' has-error' : '')}>
            <label>Nom du destinataire</label>
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(onlyLetters(e.target.value))}
              onBlur={() => markTouched('recipientName')}
              placeholder="Nom complet"
              maxLength={60}
            />
            <FieldError show={touched.recipientName && !recipientNameValid}>
              Au moins 2 caractères.
            </FieldError>
          </div>
          <div className={'field' + (touched.recipientPhone && !recipientPhoneValid ? ' has-error' : '')}>
            <label>Téléphone</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(onlyDigits(e.target.value))}
              onBlur={() => markTouched('recipientPhone')}
              placeholder="0707123456"
            />
            <FieldError show={touched.recipientPhone && !recipientPhoneValid}>
              10 chiffres, commençant par 0.
            </FieldError>
          </div>
        </div>

        {proposedPrice && (
          <div className="split-note">
            <Sparkles size={16} />
            <span>
              Si le voyageur accepte : {fcfa(parseFloat(proposedPrice || 0) * 0.7)} lui reviennent à la
              livraison, {fcfa(parseFloat(proposedPrice || 0) * 0.3)} de commission plateforme. Le montant
              reste sécurisé jusqu'à la confirmation du destinataire.
            </span>
          </div>
        )}

        <button
          className="btn-amber"
          disabled={!valid || submitting}
          style={{ opacity: valid && !submitting ? 1 : 0.5 }}
          onClick={submit}
        >
          {submitting ? 'Envoi…' : 'Envoyer la demande au voyageur'}
        </button>
      </div>
    </div>
  );
}
