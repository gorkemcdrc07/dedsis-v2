import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, ChevronRight, KeyRound, LoaderCircle, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser, updateUserPermissions, type AdminUsersData, type ManagedUser } from "../features/admin-users/admin-users.api";

const moduleLabels: Record<string, string> = {
  screens: "Ekran erişimleri", dashboard: "Ana Panel işlemleri", operations: "Operasyon işlemleri",
  accounting: "Muhasebe işlemleri", hr: "İnsan Kaynakları işlemleri", evidea: "Evidea işlemleri",
  basbug: "Başbuğ işlemleri", users: "Kullanıcı yönetimi", roles: "Rol yönetimi", audit: "İşlem kayıtları",
};

type EditorState = { mode: "create" | "edit"; user?: ManagedUser } | null;

export function UserManagementPage() {
  const [data, setData] = useState<AdminUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);

  async function reload(preferredId?: string) {
    setLoading(true);
    try {
      const result = await getAdminUsers();
      setData(result);
      const id = preferredId ?? selectedId ?? result.users[0]?.id ?? null;
      setSelectedId(id);
      setSelectedPermissions(new Set(result.users.find((item) => item.id === id)?.permissions ?? []));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Kullanıcılar alınamadı."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void reload(); }, []);
  const selectedUser = data?.users.find((user) => user.id === selectedId) ?? null;
  const filteredUsers = useMemo(() => {
    const needle = query.toLocaleLowerCase("tr-TR");
    return (data?.users ?? []).filter((user) => `${user.full_name ?? ""} ${user.email ?? ""}`.toLocaleLowerCase("tr-TR").includes(needle));
  }, [data, query]);
  const permissionGroups = useMemo(() => {
    const groups: Record<string, NonNullable<typeof data>["permissions"]> = {};
    for (const permission of data?.permissions ?? []) (groups[permission.module] ??= []).push(permission);
    return Object.entries(groups);
  }, [data]);
  const activeCount = data?.users.filter((user) => user.is_active).length ?? 0;

  function selectUser(user: ManagedUser) { setSelectedId(user.id); setSelectedPermissions(new Set(user.permissions)); }
  function toggleGroup(permissions: AdminUsersData["permissions"]) {
    setSelectedPermissions((current) => {
      const next = new Set(current); const allSelected = permissions.every((item) => next.has(item.code));
      permissions.forEach((item) => allSelected ? next.delete(item.code) : next.add(item.code)); return next;
    });
  }
  async function savePermissions() {
    if (!selectedUser) return; setSavingPermissions(true);
    try { await updateUserPermissions(selectedUser.id, [...selectedPermissions]); toast.success("Kullanıcı yetkileri güncellendi."); await reload(selectedUser.id); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Yetkiler kaydedilemedi."); }
    finally { setSavingPermissions(false); }
  }
  async function removeUser(user: ManagedUser) {
    if (!window.confirm(`${user.full_name ?? user.email} kullanıcısı kalıcı olarak silinsin mi?`)) return;
    try { await deleteAdminUser(user.id); toast.success("Kullanıcı silindi."); setSelectedId(null); await reload(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Kullanıcı silinemedi."); }
  }

  if (loading && !data) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600" /></div>;
  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 text-white shadow-2xl shadow-slate-300/60">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100"><ShieldCheck className="h-4 w-4" />Süper Yönetici Merkezi</div><h2 className="text-3xl font-black tracking-tight">Kullanıcı ve Yetki Yönetimi</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Hesapları yönetin, kullanıcıların görebileceği ekranları ve kullanabileceği işlemleri tek yerden belirleyin.</p></div>
        <button type="button" onClick={() => setEditor({ mode: "create" })} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"><Plus className="h-4 w-4" />Yeni kullanıcı</button>
      </div>
      <div className="relative mt-7 grid gap-3 sm:grid-cols-3"><Stat label="Toplam kullanıcı" value={data?.users.length ?? 0} /><Stat label="Aktif kullanıcı" value={activeCount} /><Stat label="Tanımlı rol" value={data?.roles.length ?? 0} /></div>
    </section>

    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
        <div className="border-b border-slate-100 p-5"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-black"><Users className="h-5 w-5 text-blue-600" />Kullanıcılar</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{filteredUsers.length}</span></div><div className="relative mt-4"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad veya e-posta ara..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div></div>
        <div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">{filteredUsers.map((user) => <button type="button" key={user.id} onClick={() => selectUser(user)} className={`group flex w-full items-center gap-3 p-4 text-left transition ${selectedId === user.id ? "bg-blue-50" : "hover:bg-slate-50"}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-black ${user.is_active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{(user.full_name ?? user.email ?? "K").slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-slate-900">{user.full_name || "İsimsiz kullanıcı"}</span><span className="block truncate text-xs text-slate-500">{user.email}</span><span className="mt-1 block text-[11px] font-bold text-blue-600">{user.role?.name ?? "Rol atanmamış"}</span></span><span title={user.is_active ? "Aktif" : "Pasif"} className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-300"}`} /><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" /></button>)}</div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
        {selectedUser ? <><div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg"><UserRound className="h-6 w-6" /></span><div><div className="flex items-center gap-2"><h3 className="text-lg font-black">{selectedUser.full_name || "İsimsiz kullanıcı"}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${selectedUser.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{selectedUser.is_active ? "AKTİF" : "PASİF"}</span></div><p className="mt-1 text-sm text-slate-500">{selectedUser.email} · {selectedUser.role?.name ?? "Rol yok"}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => setEditor({ mode: "edit", user: selectedUser })} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold hover:bg-slate-50"><Pencil className="h-4 w-4" />Hesabı düzenle</button><button type="button" onClick={() => void removeUser(selectedUser)} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50" aria-label="Kullanıcıyı sil"><Trash2 className="h-4 w-4" /></button></div></div>
        <div className="p-6"><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h4 className="flex items-center gap-2 font-black"><KeyRound className="h-5 w-5 text-blue-600" />Ekran ve işlem yetkileri</h4><p className="mt-1 text-sm text-slate-500">Açık olan yetkiler bu kullanıcı için hemen geçerli olur.</p></div><button type="button" onClick={() => void savePermissions()} disabled={savingPermissions} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-60">{savingPermissions ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Yetkileri kaydet</button></div>
        <div className="grid gap-4 lg:grid-cols-2">{permissionGroups.map(([module, permissions]) => { const selectedCount = permissions.filter((item) => selectedPermissions.has(item.code)).length; return <article key={module} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-md"><div className="mb-3 flex items-center justify-between gap-3"><div><h5 className="text-sm font-black text-slate-900">{moduleLabels[module] ?? module}</h5><p className="mt-0.5 text-[11px] font-bold text-slate-400">{selectedCount}/{permissions.length} yetki açık</p></div><button type="button" onClick={() => toggleGroup(permissions)} className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">{selectedCount === permissions.length ? "Tümünü kapat" : "Tümünü aç"}</button></div><div className="space-y-1">{permissions.map((permission) => <label key={permission.code} className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"><input type="checkbox" checked={selectedPermissions.has(permission.code)} onChange={() => setSelectedPermissions((current) => { const next = new Set(current); next.has(permission.code) ? next.delete(permission.code) : next.add(permission.code); return next; })} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600" /><span><span className="block text-sm font-bold text-slate-700">{permission.name}</span>{permission.description ? <span className="mt-0.5 block text-xs leading-5 text-slate-400">{permission.description}</span> : null}</span></label>)}</div></article>; })}</div></div></> : <div className="grid min-h-[500px] place-items-center p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-100"><Users className="h-7 w-7 text-slate-400" /></span><p className="mt-4 font-black text-slate-900">Bir kullanıcı seçin</p><p className="mt-1 text-sm text-slate-500">Hesap ve yetki ayrıntıları burada görüntülenecek.</p></div></div>}
      </section>
    </div>
    {editor ? <UserEditor editor={editor} roles={data?.roles ?? []} onClose={() => setEditor(null)} onSaved={async (id) => { setEditor(null); await reload(id); }} /> : null}
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><div className="text-2xl font-black">{value}</div><div className="mt-0.5 text-xs font-bold text-slate-300">{label}</div></div>; }

function UserEditor({ editor, roles, onClose, onSaved }: { editor: NonNullable<EditorState>; roles: AdminUsersData["roles"]; onClose: () => void; onSaved: (id?: string) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); const form = new FormData(event.currentTarget);
    const input = { email: String(form.get("email")), fullName: String(form.get("fullName")), phone: String(form.get("phone")) || null, roleCode: String(form.get("roleCode")), isActive: form.get("isActive") === "on", password: String(form.get("password")) || undefined };
    try { if (editor.mode === "create") { const result = await createAdminUser({ ...input, password: input.password ?? "" }); toast.success("Kullanıcı oluşturuldu."); await onSaved(result.id); } else if (editor.user) { await updateAdminUser(editor.user.id, input); toast.success("Kullanıcı güncellendi."); await onSaved(editor.user.id); } }
    catch (error) { toast.error(error instanceof Error ? error.message : "İşlem tamamlanamadı."); } finally { setSaving(false); }
  }
  const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={submit} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><div className="mb-6"><div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><UserRound className="h-5 w-5" /></div><h3 className="text-xl font-black">{editor.mode === "create" ? "Yeni kullanıcı ekle" : "Kullanıcıyı düzenle"}</h3><p className="mt-1 text-sm text-slate-500">Hesap bilgilerini, rolü ve giriş durumunu belirleyin.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700 sm:col-span-2">Ad soyad<input className={fieldClass} name="fullName" defaultValue={editor.user?.full_name ?? ""} required /></label><label className="text-sm font-bold text-slate-700 sm:col-span-2">E-posta<input className={fieldClass} name="email" type="email" defaultValue={editor.user?.email ?? ""} required /></label><label className="text-sm font-bold text-slate-700">Telefon<input className={fieldClass} name="phone" defaultValue={editor.user?.phone ?? ""} /></label><label className="text-sm font-bold text-slate-700">Rol<select className={fieldClass} name="roleCode" defaultValue={editor.user?.role?.code ?? "user"}>{roles.map((role) => <option key={role.id} value={role.code}>{role.name}</option>)}</select></label><label className="text-sm font-bold text-slate-700 sm:col-span-2">{editor.mode === "create" ? "Şifre" : "Yeni şifre (değişmeyecekse boş bırakın)"}<input className={fieldClass} name="password" type="password" minLength={8} required={editor.mode === "create"} /></label><label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 sm:col-span-2"><input name="isActive" type="checkbox" defaultChecked={editor.user?.is_active ?? true} className="h-4 w-4 accent-blue-600" />Kullanıcı aktif</label></div><div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold hover:bg-slate-50">Vazgeç</button><button disabled={saving} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{editor.mode === "create" ? "Kullanıcı oluştur" : "Değişiklikleri kaydet"}</button></div></form></div>;
}
