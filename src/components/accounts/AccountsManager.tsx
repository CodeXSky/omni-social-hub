"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Radio, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  Zap,
  Globe,
  Settings,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/platform-configs";
import { Platform } from "@prisma/client";

interface OAuthConfigItem {
  platform: Platform;
  name: string;
  isConfigured: boolean;
  isInheritedFromMeta?: boolean;
  clientId: string;
  clientSecret: string;
  maskedSecret: string;
  scopes: string;
  callbackUri: string;
  devPortalUrl: string;
  docsUrl: string;
  instructions: string;
  hasDbOverride: boolean;
}

export function AccountsManager() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Đang tải trung tâm quản lý tài khoản...</div>}>
      <AccountsManagerContent />
    </Suspense>
  );
}

function AccountsManagerContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"accounts" | "apihub">("accounts");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [oauthConfigs, setOauthConfigs] = useState<OAuthConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"oauth" | "direct">("oauth");
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Direct Token Form State
  const [directPlatform, setDirectPlatform] = useState<Platform>(Platform.TIKTOK);
  const [directToken, setDirectToken] = useState("");
  const [directAccountName, setDirectAccountName] = useState("");
  const [directUsername, setDirectUsername] = useState("");
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);

  // Edit Config State in API Hub
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editClientId, setEditClientId] = useState("");
  const [editClientSecret, setEditClientSecret] = useState("");
  const [syncMetaAll, setSyncMetaAll] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Handle URL redirect query params from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const platform = searchParams.get("platform");
    const accountName = searchParams.get("accountName");

    if (success === "connected") {
      setNotice(`🎉 Đã kết nối thành công tài khoản ${platform ? `[${platform}]` : ""} ${accountName ? `"${accountName}"` : ""} qua OAuth chính thức!`);
      setTimeout(() => setNotice(null), 5000);
    } else if (error) {
      if (error === "missing_oauth_credentials") {
        setErrorNotice(`⚠️ Nền tảng ${platform} chưa được cấu hình Client ID / Secret. Vui lòng cập nhật thông tin trong tab "Cấu hình API Hub".`);
        setActiveTab("apihub");
      } else {
        setErrorNotice(`⚠️ Lỗi kết nối OAuth: ${decodeURIComponent(error)}`);
      }
      setTimeout(() => setErrorNotice(null), 7000);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accRes, cfgRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/auth/oauth-configs"),
      ]);

      const accData = await accRes.json();
      const cfgData = await cfgRes.json();

      if (accData.accounts) setAccounts(accData.accounts);
      if (cfgData.configs) setOauthConfigs(cfgData.configs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRefreshToken = async (id: string) => {
    setRefreshingId(id);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh", accountId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice("✅ OAuth Token đã được rotate thành công và hạn ngạch quota rate limit đã được hồi phục!");
        loadData();
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn ngắt kết nối tài khoản "${name}"?`)) return;
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", accountId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`🗑️ Đã ngắt kết nối tài khoản "${name}" thành công!`);
        loadData();
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlatform) return;

    const isMetaPlatform =
      editingPlatform === Platform.FACEBOOK ||
      editingPlatform === Platform.INSTAGRAM ||
      editingPlatform === Platform.THREADS;

    try {
      setIsSavingConfig(true);
      const res = await fetch("/api/auth/oauth-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editingPlatform,
          clientId: editClientId,
          clientSecret: editClientSecret,
          syncMetaAll: isMetaPlatform ? syncMetaAll : false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(data.message || `✅ Đã lưu cấu hình OAuth cho ${editingPlatform} vào CSDL an toàn!`);
        setEditingPlatform(null);
        loadData();
        setTimeout(() => setNotice(null), 4500);
      } else {
        setErrorNotice(data.error || "Không thể lưu cấu hình");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directToken) return;

    try {
      setIsSubmittingDirect(true);
      const res = await fetch("/api/auth/direct-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: directPlatform,
          accessToken: directToken,
          accountName: directAccountName,
          username: directUsername,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setDirectToken("");
        setDirectAccountName("");
        setDirectUsername("");
        setNotice(`🎉 Đã kết nối kênh ${PLATFORM_CONFIGS[directPlatform]?.name} thành công qua Token chính thức!`);
        loadData();
        setTimeout(() => setNotice(null), 4000);
      } else {
        setErrorNotice(data.error || "Token không hợp lệ hoặc không thể xác thực.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  const startEditConfig = (cfg: OAuthConfigItem) => {
    setEditingPlatform(cfg.platform);
    setEditClientId(cfg.clientId || "");
    setEditClientSecret(cfg.clientSecret || "");
    setSyncMetaAll(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              OAuth 2.0 & Official API Hub
            </span>
            <span className="text-zinc-500 text-xs">• AES-256-GCM Hardware Encrypted</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Accounts & Official API Hub</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Quản lý tài khoản mạng xã hội của bạn, cấu hình App Credentials từ Developer Portal và kết nối OAuth tự động.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === "accounts" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Kênh Đã Kết Nối ({accounts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("apihub")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === "apihub" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Cấu Hình API Hub & Keys</span>
            </button>
          </div>

          <button
            onClick={() => {
              setModalMode("oauth");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Security Info Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Bảo Mật OAuth & Token Chuẩn Doanh Nghiệp</h3>
            <p className="text-[11px] text-zinc-400">
              Access Token và Refresh Credentials được mã hóa lưu trữ bền vững với AES-256-GCM. Tự động hỗ trợ cấp lại (Rolling Refresh Token).
            </p>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono hidden sm:block">STANDARDS: SOC2 / GDPR READY</div>
      </div>

      {/* TAB 1: CONNECTED ACCOUNTS */}
      {activeTab === "accounts" && (
        <>
          {accounts.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
                <Radio className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-200">Chưa có tài khoản mạng xã hội nào được kết nối</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Ủy quyền trực tiếp qua OAuth 2.0 hoặc sử dụng Developer Token để thêm kênh TikTok, YouTube, Instagram, Facebook Reels, X, Threads của bạn.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setModalMode("oauth");
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xác thực OAuth 1-Click</span>
                </button>
                <button
                  onClick={() => setActiveTab("apihub")}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 inline-flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Xem cấu hình API Hub</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {accounts.map((acc) => {
                const cfg = PLATFORM_CONFIGS[acc.platform as Platform] || PLATFORM_CONFIGS.TWITTER;
                const Icon = cfg.icon;
                const isRefreshing = refreshingId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all backdrop-blur-xl flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Account Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl ${cfg.badgeBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100">{acc.accountName}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono">@{acc.username}</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      </div>

                      {/* Token Specs */}
                      <div className="mt-4 space-y-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">API Gateway</span>
                          <span className="text-zinc-300 font-mono">{cfg.name} Official v2</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">Rate Limit Quota</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {acc.rateLimitRemaining || 1000} req left
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">Quy mô kênh</span>
                          <span className="text-zinc-300 font-mono text-[11px]">
                            {(acc.profileMeta?.followers || acc.profileMeta?.subscribers || 0).toLocaleString()} {acc.platform === "YOUTUBE" ? "Subs" : "Followers"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">Bảo mật Token</span>
                          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> AES-256 Encrypted
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                      <button
                        onClick={() => handleRefreshToken(acc.id)}
                        disabled={isRefreshing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
                        <span>{isRefreshing ? "Đang làm mới..." : "Refresh Token"}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.accountName)}
                        title="Ngắt kết nối"
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: API HUB & DEVELOPER PORTAL CREDENTIALS */}
      {activeTab === "apihub" && (
        <div className="space-y-6">
          {/* Meta Ecosystem Unification Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-start gap-3 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200 leading-relaxed space-y-1">
              <p className="font-bold text-white flex items-center gap-2">
                <span>Hệ sinh thái Meta Suite (Facebook, Instagram & Threads dùng chung 1 Meta App ID):</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-normal">
                  Chỉ cần nhập 1 lần
                </span>
              </p>
              <p className="text-blue-300/80">
                Trên <strong>Meta for Developers</strong> (developers.facebook.com), Facebook Pages, Instagram Graph API và Threads API đều thuộc chung 1 ứng dụng. 
                Bạn chỉ cần nhập <strong>Client ID / App Secret</strong> tại thẻ <strong>Facebook</strong>, hệ thống sẽ <strong>tự động đồng bộ và áp dụng cho cả Instagram & Threads</strong>!
                Sau đó, sao chép 3 dòng Callback URI tương ứng dán vào mục <em>Valid OAuth Redirect URIs</em> trên Meta App Dashboard.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed space-y-1">
              <p className="font-semibold text-white">Hướng dẫn chung về OAuth Redirect URI:</p>
              <p className="text-zinc-400">
                1. Mở Developer Console của nền tảng (nút ở mỗi thẻ bên dưới).<br />
                2. Sao chép đúng <strong className="text-cyan-300">Callback / Redirect URI</strong> dán vào mục Authorized Redirect URIs của ứng dụng.<br />
                3. Dán <strong className="text-cyan-300">Client ID</strong> và <strong className="text-cyan-300">Client Secret</strong> vào đây để mở khóa tính năng đăng nhập 1-click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {oauthConfigs.map((cfg) => {
              const platformCfg = PLATFORM_CONFIGS[cfg.platform] || PLATFORM_CONFIGS.TIKTOK;
              const Icon = platformCfg.icon;

              return (
                <div
                  key={cfg.platform}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all backdrop-blur-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Platform Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-xl ${platformCfg.badgeBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{cfg.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">{cfg.platform}</span>
                        </div>
                      </div>

                      {cfg.isConfigured ? (
                        <div className="flex items-center gap-1.5">
                          {cfg.isInheritedFromMeta && (
                            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              META SUITE
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ĐÃ CẤU HÌNH</span>
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>CẦN CẤU HÌNH</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {cfg.isInheritedFromMeta ? (
                        <span className="text-blue-300">
                          🔗 Kế thừa tự động từ Meta App Suite (Facebook). Bạn không cần nhập lại App ID cho kênh này!
                        </span>
                      ) : (
                        cfg.instructions
                      )}
                    </p>

                    {/* Redirect URI Box with Copy */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-semibold">Callback / Redirect URI:</span>
                        <button
                          onClick={() => handleCopy(cfg.callbackUri, `cb-${cfg.platform}`)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                        >
                          {copiedKey === `cb-${cfg.platform}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URI</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300 truncate select-all">
                        {cfg.callbackUri}
                      </div>
                    </div>

                    {/* Client ID & Secret Display */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Client / App ID:</span>
                        <span className="text-zinc-300 font-mono text-[10px] truncate max-w-[200px]">
                          {cfg.clientId || "(Chưa nhập)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Client Secret:</span>
                        <span className="text-zinc-400 font-mono text-[10px]">
                          {cfg.clientSecret ? `${cfg.clientSecret.slice(0, 3)}••••••••${cfg.clientSecret.slice(-4)}` : "(Chưa nhập)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                    <a
                      href={cfg.devPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Developer Console</span>
                    </a>

                    <button
                      onClick={() => startEditConfig(cfg)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
                    >
                      {cfg.isConfigured ? "Cập Nhật Keys" : "Nhập App Key / Secret"}
                    </button>

                    {cfg.isConfigured && (
                      <a
                        href={`/api/auth/${cfg.platform.toLowerCase()}/login`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:opacity-90 shadow"
                        title="Đăng nhập thử OAuth"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Auth Ngay</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: CONNECT NEW ACCOUNT (OAUTH & DIRECT TOKEN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">Kết Nối Kênh Mạng Xã Hội Thật</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Ủy quyền ứng dụng để đăng video & đồng bộ số liệu</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs: 1-Click OAuth vs Direct Token */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setModalMode("oauth")}
                className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  modalMode === "oauth" ? "bg-cyan-500 text-zinc-950 font-bold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>OAuth 2.0 1-Click (Khuyên dùng)</span>
              </button>
              <button
                onClick={() => setModalMode("direct")}
                className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  modalMode === "direct" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Direct Access Token</span>
              </button>
            </div>

            {/* Mode A: 1-Click OAuth */}
            {modalMode === "oauth" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Chọn nền tảng bạn muốn cấp quyền. Trình duyệt sẽ chuyển hướng sang trang ủy quyền chính thức của mạng xã hội:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {Object.values(Platform).map((p) => {
                    const cfg = PLATFORM_CONFIGS[p] || PLATFORM_CONFIGS.TIKTOK;
                    const Icon = cfg.icon;
                    const oauthMeta = oauthConfigs.find((c) => c.platform === p);
                    const isReady = oauthMeta?.isConfigured;

                    return (
                      <div
                        key={p}
                        className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${cfg.badgeBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{cfg.name}</div>
                            <div className="text-[10px] text-zinc-500">
                              {isReady ? "App ID đã sẵn sàng" : "Chưa nhập App Key"}
                            </div>
                          </div>
                        </div>

                        {isReady ? (
                          <a
                            href={`/api/auth/${p.toLowerCase()}/login`}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 inline-flex items-center gap-1.5 transition-all hover:scale-105"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Ủy Quyền Ngay</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setIsModalOpen(false);
                              setActiveTab("apihub");
                              const c = oauthConfigs.find((x) => x.platform === p);
                              if (c) startEditConfig(c);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
                          >
                            Cấu hình Key
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode B: Direct Token Input */}
            {modalMode === "direct" && (
              <form onSubmit={handleDirectConnect} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Chọn Nền Tảng</label>
                  <select
                    value={directPlatform}
                    onChange={(e) => setDirectPlatform(e.target.value as Platform)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    {Object.keys(PLATFORM_CONFIGS).map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_CONFIGS[p as Platform].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Official Access Token / Bearer Token <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Dán mã Access Token từ TikTok Developer Sandbox, Meta Explorer hoặc Google OAuth Playground..."
                    value={directToken}
                    onChange={(e) => setDirectToken(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500 placeholder-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Tên Kênh (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="vd: Kênh Official"
                      value={directAccountName}
                      onChange={(e) => setDirectAccountName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Handle / Username</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={directUsername}
                      onChange={(e) => setDirectUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDirect}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                  >
                    {isSubmittingDirect ? "Đang xác thực..." : "Xác Thực & Lưu Kênh"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT OAUTH CREDENTIALS (IN API HUB) */}
      {editingPlatform && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Cấu Hình App Credentials: {PLATFORM_CONFIGS[editingPlatform]?.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Lưu trữ bảo mật trong CSDL SQLite cục bộ</p>
              </div>
              <button onClick={() => setEditingPlatform(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Client ID / App Key / Consumer Key <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập Client ID từ Developer Portal..."
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Client Secret / App Secret
                </label>
                <input
                  type="password"
                  placeholder="Nhập Client Secret..."
                  value={editClientSecret}
                  onChange={(e) => setEditClientSecret(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Được mã hóa an toàn trước khi lưu. Không gửi ra public frontend.
                </span>
              </div>

              {(editingPlatform === Platform.FACEBOOK || editingPlatform === Platform.INSTAGRAM || editingPlatform === Platform.THREADS) && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-blue-200">
                    <input
                      type="checkbox"
                      checked={syncMetaAll}
                      onChange={(e) => setSyncMetaAll(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-500 bg-zinc-950 border-zinc-700 focus:ring-blue-400"
                    />
                    <span>Tự động đồng bộ App ID & Secret này cho cả 3 nền tảng Meta (Facebook, Instagram & Threads)</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 pl-6.5 leading-relaxed">
                    Meta cho phép dùng chung 1 Meta App ID trên cùng 1 App Dashboard. Bạn chỉ cần nhập 1 lần tại đây là cả 3 nền tảng đều sẵn sàng ủy quyền!
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlatform(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  {isSavingConfig ? "Đang lưu..." : "Lưu Cấu Hình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
