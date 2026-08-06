import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, ChevronRight, KeyRound, LoaderCircle, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateUserPermissions,
  type AdminUsersData,
  type ManagedUser,
} from "../features/admin-users/admin-users.api";

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
      const user = result.users.find((item) => item.id === id);
      setSelectedPermissions(new Set(user?.permissions ?? []));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kullanıcılar alınamadı.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void reload(); }, []);

  const selectedUser = data?.users.find((user) => user.id === selectedId) ?? null;
  const filteredUsers = useMemo(() => {
    const needle = query.toLocaleLowerCase("tr-TR");
    return (data?.users ?? []).filter((user) => `${user.full_name ?? ""} ${user.email ?? ""}`.toLocaleLowerCase("tr-TR").includes(needle));
  }, [data, query]);
  const permissionGroups = useMemo(() => {
    const groups: Record<string, NonNullable<typeof data>["permissions"]> = {};
    for (const permission of data?.permissions ?? []) {
      (groups[permission.module] ??= []).push(permission);
    }
    return Object.entries(groups);
  }, [data]);

  function selectUser(user: ManagedUser) {
    setSelectedId(user.id);
    setSelectedPermissions(new Set(user.permissions));
  }

  async function savePermissions() {
    if (!selectedUser) return;
    setSavingPermissions(true);
    try {
      await updateUserPermissions(selectedUser.id, [...selectedPermissions]);
      toast.success("Kullanıcı yetkileri güncellendi.");
      await reload(selectedUser.id);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Yetkiler kaydedilemedi."); }
    finally { setSavingPermissions(false); }
  }

  async function removeUser(user: ManagedUser) {
    if (!window.confirm(`${user.full_name ?? user.email} kullanıcısı kalıcı olarak silinsin mi?`)) return;
    try { await deleteAdminUser(user.id); toast.success("Kullanıcı silindi."); setSelectedId(null); await reload(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Kullanıcı silinemedi."); }
  }

  if (loading && !data) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-200"><ShieldCheck className="h-4 w-4" />Sadece Süper Yönetici</div><h2 className="text-3xl font-black tracking-tight">Kullanıcı ve Yetki Yönetimi</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Kullanıcı hesaplarını, ekran erişimlerini ve ekran içindeki işlem yetkilerini tek merkezden yönetin.</p></div>
        <button onClick={() => setEditor({ mode: "create" })} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold transition hover:bg-blue-500"><Plus className="h-4 w-4" />Yeni kullanıcı</button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold"><Users className="h-5 w-5 text-blue-600" />Kullanıcılar</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{data?.users.length ?? 0}</span></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kullanıcı ara..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div></div>
          <div className="max-h-[680px] divide-y divide-slate-100 overflow-y-auto">
            {filteredUsers.map((user) => <button key={user.id} onClick={() => selectUser(user)} className={`flex w-full items-center gap-3 p-4 text-left transition ${selectedId === user.id ? "bg-blue-50" : "hover:bg-slate-50"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${user.is_active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{(user.full_name ?? user.email ?? "K").slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{user.full_name || "İsimsiz kullanıcı"}</span><span className="block truncate text-xs text-slate-500">{user.email}</span><span className="mt-1 block text-[11px] font-semibold text-blue-600">{user.role?.name ?? "Rol atanmamış"}</span></span><span className={`h-2 w-2 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-300"}`} /><ChevronRight className="h-4 w-4 text-slate-300" /></button>)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedUser ? <><div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-lg font-black text-white"><UserRound className="h-6 w-6" /></span><div><h3 className="text-lg font-black">{selectedUser.full_name}</h3><p className="text-sm text-slate-500">{selectedUser.email} · {selectedUser.role?.name}</p></div></div><div className="flex gap-2"><button onClick={() => setEditor({ mode: "edit", user: selectedUser })} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-slate-50"><Pencil className="h-4 w-4" />Düzenle</button><button onClick={() => void removeUser(selectedUser)} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label="Kullanıcıyı sil"><Trash2 className="h-4 w-4" /></button></div></div>
          <div className="p-6"><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h4 className="flex items-center gap-2 font-black"><KeyRound className="h-5 w-5 text-blue-600" />Ekran ve işlem yetkileri</h4><p className="mt-1 text-sm text-slate-500">İşaretli alanları bu kullanıcı görebilir veya kullanabilir.</p></div><button onClick={() => void savePermissions()} disabled={savingPermissions} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{savingPermissions ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Yetkileri kaydet</button></div>
          <div className="grid gap-4 lg:grid-cols-2">{permissionGroups.map(([module, permissions]) => <div key={module} className="rounded-2xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><h5 className="text-sm font-black text-slate-900">{moduleLabels[module] ?? module}</h5><button onClick={() => { const next = new Set(selectedPermissions); const allSelected = permissions.every((item) => next.has(item.code)); permissions.forEach((item) => allSelected ? next.delete(item.code) : next.add(item.code)); setSelectedPermissions(next); }} className="text-xs font-bold text-blue-600 hover:text-blue-800">Tümünü seç</button></div><div className="space-y-2">{permissions.map((permission) => <label key={permission.code} className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"><input type="checkbox" checked={selectedPermissions.has(permission.code)} onChange={() => { const next = new Set(selectedPermissions); next.has(permission.code) ? next.delete(permission.code) : next.add(permission.code); setSelectedPermissions(next); }} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600" /><span><span className="block text-sm font-bold text-slate-700">{permission.name}</span>{permission.description ? <span className="mt-0.5 block text-xs leading-5 text-slate-400">{permission.description}</span> : null}</span></label>)}</div></div>)}</div></div></> : <div className="grid min-h-96 place-items-center p-8 text-center text-slate-500"><div><Users className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="font-bold">Bir kullanıcı seçin</p></div></div>}
        </section>
      </div>

      {editor ? <UserEditor editor={editor} roles={data?.roles ?? []} onClose={() => setEditor(null)} onSaved={async (id) => { setEditor(null); await reload(id); }} /> : null}
    </div>
  );
}

function UserEditor({ editor, roles, onClose, onSaved }: { editor: NonNullable<EditorState>; roles: AdminUsersData["roles"]; onClose: () => void; onSaved: (id?: string) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); const form = new FormData(event.currentTarget);
    const input = { email: String(form.get("email")), fullName: String(form.get("fullName")), phone: String(form.get("phone")) || null, roleCode: String(form.get("roleCode")), isActive: form.get("isActive") === "on", password: String(form.get("password")) || undefined };
    try { if (editor.mode === "create") { const result = await createAdminUser({ ...input, password: input.password ?? "" }); toast.success("Kullanıcı oluşturuldu."); await onSaved(result.id); } else if (editor.user) { await updateAdminUser(editor.user.id, input); toast.success("Kullanıcı güncellendi."); await onSaved(editor.user.id); } }
    catch (error) { toast.error(error instanceof Error ? error.message : "İşlem tamamlanamadı."); } finally { setSaving(false); }
  }
  const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-6"><h3 className="text-xl font-black">{editor.mode === "create" ? "Yeni kullanıcı ekle" : "Kullanıcıyı düzenle"}</h3><p className="mt-1 text-sm text-slate-500">Hesap ve rol bilgilerini belirleyin.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700 sm:col-span-2">Ad soyad<input className={fieldClass} name="fullName" defaultValue={editor.user?.full_name ?? ""} required /></label><label className="text-sm font-bold text-slate-700 sm:col-span-2">E-posta<input className={fieldClass} name="email" type="email" defaultValue={editor.user?.email ?? ""} required /></label><label className="text-sm font-bold text-slate-700">Telefon<input className={fieldClass} name="phone" defaultValue={editor.user?.phone ?? ""} /></label><label className="text-sm font-bold text-slate-700">Rol<select className={fieldClass} name="roleCode" defaultValue={editor.user?.role?.code ?? "user"}>{roles.map((role) => <option key={role.id} value={role.code}>{role.name}</option>)}</select></label><label className="text-sm font-bold text-slate-700 sm:col-span-2">{editor.mode === "create" ? "Şifre" : "Yeni şifre (değişmeyecekse boş bırakın)"}<input className={fieldClass} name="password" type="password" minLength={8} required={editor.mode === "create"} /></label><label className="flex items-center gap-3 text-sm font-bold text-slate-700 sm:col-span-2"><input name="isActive" type="checkbox" defaultChecked={editor.user?.is_active ?? true} className="h-4 w-4 accent-blue-600" />Kullanıcı aktif</label></div><div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold hover:bg-slate-50">Vazgeç</button><button disabled={saving} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{editor.mode === "create" ? "Kullanıcı oluştur" : "Değişiklikleri kaydet"}</button></div></form></div>;
}
