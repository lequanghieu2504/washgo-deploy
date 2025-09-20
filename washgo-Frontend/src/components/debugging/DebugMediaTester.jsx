import React, { useMemo, useRef, useState } from "react";

function fmtBytes(n) {
  if (!n && n !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 2 : 0)} ${u[i]}`;
}

// ✅ XHR upload có hỗ trợ headers (Authorization)
async function xhrUpload(url, formData, onProgress, headers) {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    }
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      const status = xhr.status || 0;
      const hs = new Headers();
      const ct = xhr.getResponseHeader("Content-Type") || "application/json";
      hs.set("Content-Type", ct);
      resolve(new Response(xhr.responseText, { status, headers: hs }));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export default function DebugMediaTester() {
  // ✅ Mặc định BE 8080 (có thể override)
  const [apiBase, setApiBase] = useState("http://localhost:8080");
  const api = (path) => `${apiBase.replace(/\/+$/, "")}${path}`;
  // ✅ Biến URL tương đối (/api|/uploads) thành tuyệt đối tới 8080
  const absUrl = (u) =>
    !u ? "" : u.startsWith("/") ? `${apiBase.replace(/\/+$/, "")}${u}` : u;
  // 🔐 Token (Bearer ...) cho các endpoint cần auth
  const [authToken, setAuthToken] = useState("");

  const buildAuthHeaders = () => {
    if (!authToken.trim()) return {};
    return {
      Authorization: authToken.trim().startsWith("Bearer ")
        ? authToken.trim()
        : `Bearer ${authToken.trim()}`,
    };
  };

  // -----------------------
  // CARWASH: UPLOAD
  // -----------------------
  const [carwashId, setCarwashId] = useState(1);
  const carwashFileRef = useRef(null);
  const [carwashCover, setCarwashCover] = useState(false);
  const [carwashSort, setCarwashSort] = useState(0);
  const [visibility, setVisibility] = useState("PUBLIC");
  const [carwashProgress, setCarwashProgress] = useState(0);
  const [carwashLog, setCarwashLog] = useState("");

  // -----------------------
  // CARWASH: LIST
  // -----------------------
  const [listCarwashId, setListCarwashId] = useState(1);
  const [items, setItems] = useState([]);
  const [listLog, setListLog] = useState("");

  // -----------------------
  // AVATAR USER
  // -----------------------
  const [userId, setUserId] = useState(1);
  const avatarFileRef = useRef(null);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarLog, setAvatarLog] = useState("");
  const [avatarDTO, setAvatarDTO] = useState(null); // ✅ giữ URL avatar vừa up

  // -----------------------
  // FEEDBACK: UPLOAD
  // -----------------------
  const [feedbackId, setFeedbackId] = useState(1);
  const feedbackFileRef = useRef(null);
  const [feedbackCover, setFeedbackCover] = useState(false);
  const [feedbackSort, setFeedbackSort] = useState(0);
  const [feedbackVisibility, setFeedbackVisibility] = useState("PRIVATE");
  const [feedbackProgress, setFeedbackProgress] = useState(0);
  const [feedbackLog, setFeedbackLog] = useState("");

  // -----------------------
  // FEEDBACK: LIST
  // -----------------------
  const [listFeedbackId, setListFeedbackId] = useState(1);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [listFeedbackLog, setListFeedbackLog] = useState("");

  // -----------------------
  // FEEDBACK: DELETE feedback entity
  // -----------------------
  const [delFeedbackId, setDelFeedbackId] = useState(1);
  const [delFeedbackLog, setDelFeedbackLog] = useState("");

  // note
  const baseNote = useMemo(
    () => `API base: ${apiBase || "(same origin)"}`,
    [apiBase]
  );

  // -----------------------
  // CARWASH handlers
  // -----------------------
  const handleUploadCarwash = async () => {
    setCarwashLog("");
    setCarwashProgress(0);
    const f = carwashFileRef.current?.files?.[0];
    if (!carwashId) return setCarwashLog("Thiếu carwashId");
    if (!f) return setCarwashLog("Chưa chọn file");

    const url = api(
      `/api/media/carwash/${encodeURIComponent(
        String(carwashId)
      )}?cover=${carwashCover}&sortOrder=${carwashSort}&visibility=${visibility}`
    );
    const fd = new FormData();
    fd.append("file", f);

    try {
      const resp = await xhrUpload(
        url,
        fd,
        setCarwashProgress,
        buildAuthHeaders()
      );
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      const data = await resp.json();
      setCarwashLog("OK: " + JSON.stringify(data, null, 2));
      if (listCarwashId === carwashId) {
        void handleListCarwash();
      }
    } catch (e) {
      setCarwashLog("Lỗi: " + (e?.message || String(e)));
    } finally {
      setTimeout(() => setCarwashProgress(0), 600);
    }
  };

  const handleListCarwash = async () => {
    setListLog("");
    setItems([]);
    if (!listCarwashId) return setListLog("Thiếu carwashId");
    try {
      const resp = await fetch(
        api(`/api/media/carwash/${encodeURIComponent(String(listCarwashId))}`),
        {
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setItems(data);
      setListLog(`Tổng ${data.length} media`);
    } catch (e) {
      setListLog("Lỗi: " + (e?.message || String(e)));
    }
  };

  // ⏎ Nhấn Enter để tải danh sách carwash theo ID
  const onListCarwashEnter = (e) => {
    if (e.key === "Enter") {
      void handleListCarwash();
    }
  };

  // ✅ XÓA media của CARWASH (unlink)
  const handleDeleteCarwashMedia = async (mediaId) => {
    if (!listCarwashId) return alert("Thiếu carwashId để xoá");
    if (!confirm(`Xoá media ${mediaId} khỏi Carwash ${listCarwashId}?`)) return;
    try {
      const resp = await fetch(
        api(
          `/api/media/carwash/${encodeURIComponent(
            String(listCarwashId)
          )}/${mediaId}`
        ),
        {
          method: "DELETE",
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok && resp.status !== 204) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      await handleListCarwash();
    } catch (e) {
      alert("Xoá thất bại: " + (e?.message || String(e)));
    }
  };

  // -----------------------
  // AVATAR handlers
  // -----------------------
  const handleUploadAvatar = async () => {
    setAvatarLog("");
    setAvatarProgress(0);
    const f = avatarFileRef.current?.files?.[0];
    if (!userId) return setAvatarLog("Thiếu userId");
    if (!f) return setAvatarLog("Chưa chọn ảnh");

    const url = api(
      `/api/media/users/${encodeURIComponent(String(userId))}/avatar`
    );
    const fd = new FormData();
    fd.append("file", f);

    try {
      const resp = await xhrUpload(
        url,
        fd,
        setAvatarProgress,
        buildAuthHeaders()
      );
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      const data = await resp.json();
      setAvatarLog("OK: " + JSON.stringify(data, null, 2));
      setAvatarDTO(data);
    } catch (e) {
      setAvatarLog("Lỗi: " + (e?.message || String(e)));
    } finally {
      setTimeout(() => setAvatarProgress(0), 600);
    }
  };

  // ✅ XÓA avatar user
  const handleDeleteAvatar = async () => {
    if (!userId) return alert("Thiếu userId để xoá avatar");
    if (!confirm(`Xoá avatar của user ${userId}?`)) return;
    try {
      const resp = await fetch(
        api(`/api/media/users/${encodeURIComponent(String(userId))}/avatar`),
        {
          method: "DELETE",
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok && resp.status !== 204) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      setAvatarDTO(null);
      setAvatarLog("Đã xoá avatar (204)");
    } catch (e) {
      alert("Xoá avatar thất bại: " + (e?.message || String(e)));
    }
  };

  // -----------------------
  // FEEDBACK handlers
  // -----------------------
  const handleUploadFeedback = async () => {
    setFeedbackLog("");
    setFeedbackProgress(0);
    const f = feedbackFileRef.current?.files?.[0];
    if (!feedbackId) return setFeedbackLog("Thiếu feedbackId");
    if (!f) return setFeedbackLog("Chưa chọn file");

    const url = api(
      `/api/feedback/${encodeURIComponent(
        String(feedbackId)
      )}/media?cover=${feedbackCover}&sortOrder=${feedbackSort}&visibility=${feedbackVisibility}`
    );
    const fd = new FormData();
    fd.append("file", f);

    try {
      const resp = await xhrUpload(
        url,
        fd,
        setFeedbackProgress,
        buildAuthHeaders()
      );
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      const data = await resp.json();
      setFeedbackLog("OK: " + JSON.stringify(data, null, 2));
      if (listFeedbackId === feedbackId) {
        void handleListFeedback();
      }
    } catch (e) {
      setFeedbackLog("Lỗi: " + (e?.message || String(e)));
    } finally {
      setTimeout(() => setFeedbackProgress(0), 600);
    }
  };

  const handleListFeedback = async () => {
    setListFeedbackLog("");
    setFeedbackItems([]);
    if (!listFeedbackId) return setListFeedbackLog("Thiếu feedbackId");
    try {
      const resp = await fetch(
        api(
          `/api/feedback/${encodeURIComponent(String(listFeedbackId))}/media`
        ),
        {
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setFeedbackItems(data);
      setListFeedbackLog(`Tổng ${data.length} media`);
    } catch (e) {
      setListFeedbackLog("Lỗi: " + (e?.message || String(e)));
    }
  };

  // ⏎ Nhấn Enter để tải danh sách feedback theo ID
  const onListFeedbackEnter = (e) => {
    if (e.key === "Enter") {
      void handleListFeedback();
    }
  };

  // ✅ XÓA media của FEEDBACK (unlink)
  const handleDeleteFeedbackMedia = async (mediaId) => {
    if (!listFeedbackId) return alert("Thiếu feedbackId để xoá");
    if (!confirm(`Xoá media ${mediaId} khỏi Feedback ${listFeedbackId}?`))
      return;
    try {
      const resp = await fetch(
        api(
          `/api/media/feedback/${encodeURIComponent(
            String(listFeedbackId)
          )}/${mediaId}`
        ),
        {
          method: "DELETE",
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok && resp.status !== 204) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      await handleListFeedback();
    } catch (e) {
      alert("Xoá thất bại: " + (e?.message || String(e)));
    }
  };

  // ✅ XÓA FEEDBACK entity
  const handleDeleteFeedbackEntity = async () => {
    if (!delFeedbackId) return setDelFeedbackLog("Thiếu feedbackId");
    if (!confirm(`Xoá feedback ${delFeedbackId}? (không thể hoàn tác)`)) return;
    setDelFeedbackLog("");
    try {
      const resp = await fetch(
        api(`/api/feedback/${encodeURIComponent(String(delFeedbackId))}`),
        {
          method: "DELETE",
          headers: buildAuthHeaders(),
        }
      );
      if (!resp.ok && resp.status !== 204) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t}`);
      }
      setDelFeedbackLog("Đã xoá feedback (204)");
      // nếu đang xem list media của feedback vừa xoá, clear luôn
      if (listFeedbackId === delFeedbackId) {
        setFeedbackItems([]);
        setListFeedbackLog("Feedback đã xoá");
      }
    } catch (e) {
      setDelFeedbackLog("Lỗi xoá: " + (e?.message || String(e)));
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Washgo — Debug Media</h1>
      <p className="text-sm text-gray-600 mb-6">
        Test:{" "}
        <code className="bg-gray-100 px-1 rounded">/api/media/carwash/:id</code>
        ,
        <code className="bg-gray-100 px-1 rounded ml-1">
          /api/media/users/:id/avatar
        </code>
        ,
        <code className="bg-gray-100 px-1 rounded ml-1">
          /api/feedback/:id/media
        </code>
        ,
        <code className="bg-gray-100 px-1 rounded ml-1">
          /api/media/serve/:id
        </code>
      </p>

      {/* CONFIG */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-3">Config</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="http://localhost:8080"
            className="border rounded px-3 py-2 w-full sm:w-96"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
          />
          <input
            placeholder="Bearer eyJhbGciOi... (JWT nếu endpoint yêu cầu)"
            className="border rounded px-3 py-2 w-full sm:flex-1"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
          />
        </div>
        <span className="text-gray-600 text-sm">{baseNote}</span>
      </section>

      {/* UPLOAD CARWASH MEDIA */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Upload media cho Carwash</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Carwash ID</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-32"
              value={carwashId}
              min={1}
              onChange={(e) => setCarwashId(Number(e.target.value))}
            />
            <label className="text-sm text-gray-700">Visibility</label>
            <select
              className="border rounded px-3 py-2"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={carwashCover}
                onChange={(e) => setCarwashCover(e.target.checked)}
              />
              Cover
            </label>
            <label className="text-sm text-gray-700">Sort</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-24"
              value={carwashSort}
              onChange={(e) => setCarwashSort(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={carwashFileRef}
              type="file"
              accept="image/*,video/*"
              className="block"
            />
            {carwashProgress > 0 && (
              <div className="flex items-center gap-2">
                <progress value={carwashProgress} max={100} className="w-56" />
                <span className="text-sm text-gray-600">
                  {carwashProgress}%
                </span>
              </div>
            )}
            <button
              onClick={handleUploadCarwash}
              className="border px-4 py-2 rounded bg-white hover:bg-gray-50"
            >
              Upload
            </button>
          </div>
          <pre className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap min-h-[20px]">
            {carwashLog}
          </pre>
        </div>
      </section>

      {/* LIST CARWASH MEDIA */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">
          Xem & xoá ảnh/video Carwash
        </h2>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="text-sm text-gray-700">Carwash ID</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-32"
            value={listCarwashId}
            min={1}
            onChange={(e) => setListCarwashId(Number(e.target.value))}
            onKeyDown={onListCarwashEnter}
          />
          <button
            onClick={handleListCarwash}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-50"
          >
            Tải danh sách
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-3">{listLog}</div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="border rounded-xl p-3">
              {m.mediaType?.toUpperCase() === "VIDEO" ||
              (m.mime || "").startsWith("video/") ? (
                <video
                  src={absUrl(m.url)}
                  controls
                  className="w-full h-44 object-cover rounded-md bg-gray-100"
                />
              ) : (
                <img
                  src={absUrl(m.url)}
                  alt={m.id}
                  className="w-full h-44 object-cover rounded-md bg-gray-100"
                />
              )}
              <div className="text-xs text-gray-600 mt-2">
                {m.mediaType} • {m.mime || ""} • {fmtBytes(m.sizeBytes)}{" "}
                {m.cover ? "• COVER" : ""}
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={absUrl(m.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-xs underline"
                >
                  Mở
                </a>
                <button
                  onClick={() => handleDeleteCarwashMedia(m.id)}
                  className="text-red-600 text-xs underline"
                  title="Xoá media khỏi carwash (unlink)"
                >
                  Xoá
                </button>
                <code className="text-[10px] bg-gray-100 px-1 rounded">
                  {m.id}
                </code>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-sm text-gray-500">
            Chưa có media nào cho Carwash này.
          </div>
        )}
      </section>

      {/* FEEDBACK: UPLOAD MEDIA */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Upload media cho Feedback</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Feedback ID</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-32"
              value={feedbackId}
              min={1}
              onChange={(e) => setFeedbackId(Number(e.target.value))}
            />
            <label className="text-sm text-gray-700">Visibility</label>
            <select
              className="border rounded px-3 py-2"
              value={feedbackVisibility}
              onChange={(e) => setFeedbackVisibility(e.target.value)}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={feedbackCover}
                onChange={(e) => setFeedbackCover(e.target.checked)}
              />
              Cover
            </label>
            <label className="text-sm text-gray-700">Sort</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-24"
              value={feedbackSort}
              onChange={(e) => setFeedbackSort(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={feedbackFileRef}
              type="file"
              accept="image/*,video/*"
              className="block"
            />
            {feedbackProgress > 0 && (
              <div className="flex items-center gap-2">
                <progress value={feedbackProgress} max={100} className="w-56" />
                <span className="text-sm text-gray-600">
                  {feedbackProgress}%
                </span>
              </div>
            )}
            <button
              onClick={handleUploadFeedback}
              className="border px-4 py-2 rounded bg-white hover:bg-gray-50"
            >
              Upload
            </button>
          </div>
          <pre className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap min-h-[20px]">
            {feedbackLog}
          </pre>
        </div>
      </section>

      {/* FEEDBACK: LIST + DELETE MEDIA */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">
          Xem & xoá ảnh/video Feedback
        </h2>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="text-sm text-gray-700">Feedback ID</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-32"
            value={listFeedbackId}
            min={1}
            onChange={(e) => setListFeedbackId(Number(e.target.value))}
            onKeyDown={onListFeedbackEnter}
          />
          <button
            onClick={handleListFeedback}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-50"
          >
            Tải danh sách
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-3">{listFeedbackLog}</div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {feedbackItems.map((m) => (
            <div key={m.id} className="border rounded-xl p-3">
              {m.mediaType?.toUpperCase() === "VIDEO" ||
              (m.mime || "").startsWith("video/") ? (
                <video
                  src={absUrl(m.url)}
                  controls
                  className="w-full h-44 object-cover rounded-md bg-gray-100"
                />
              ) : (
                <img
                  src={absUrl(m.url)}
                  alt={m.id}
                  className="w-full h-44 object-cover rounded-md bg-gray-100"
                />
              )}
              <div className="text-xs text-gray-600 mt-2">
                {m.mediaType} • {m.mime || ""} • {fmtBytes(m.sizeBytes)}{" "}
                {m.cover ? "• COVER" : ""}
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={absUrl(m.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-xs underline"
                >
                  Mở
                </a>
                <button
                  onClick={() => handleDeleteFeedbackMedia(m.id)}
                  className="text-red-600 text-xs underline"
                  title="Xoá media khỏi feedback (unlink)"
                >
                  Xoá
                </button>
                <code className="text-[10px] bg-gray-100 px-1 rounded">
                  {m.id}
                </code>
              </div>
            </div>
          ))}
        </div>
        {feedbackItems.length === 0 && (
          <div className="text-sm text-gray-500">
            Chưa có media nào cho Feedback này.
          </div>
        )}
      </section>

      {/* DELETE FEEDBACK ENTITY */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-3">Xoá Feedback</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-gray-700">Feedback ID</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-32"
            value={delFeedbackId}
            min={1}
            onChange={(e) => setDelFeedbackId(Number(e.target.value))}
          />
          <button
            onClick={handleDeleteFeedbackEntity}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-50 text-red-600"
          >
            Xoá feedback
          </button>
          <span className="text-sm text-gray-600">{delFeedbackLog}</span>
        </div>
      </section>

      {/* AVATAR */}
      <section className="border rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Upload / Xoá avatar User</h2>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="text-sm text-gray-700">User ID</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-32"
            value={userId}
            min={1}
            onChange={(e) => setUserId(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={avatarFileRef}
            type="file"
            accept="image/*"
            className="block"
          />
          {avatarProgress > 0 && (
            <div className="flex items-center gap-2">
              <progress value={avatarProgress} max={100} className="w-56" />
              <span className="text-sm text-gray-600">{avatarProgress}%</span>
            </div>
          )}
          <button
            onClick={handleUploadAvatar}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-50"
          >
            Upload avatar
          </button>
          <button
            onClick={handleDeleteAvatar}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-50 text-red-600"
          >
            Xoá avatar
          </button>

          {/* ✅ Preview avatar vừa upload */}
          {avatarDTO?.url && (
            <img
              src={absUrl(avatarDTO.url)}
              alt="avatar"
              className="w-20 h-20 object-cover rounded-full border"
            />
          )}
        </div>
        <pre className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap min-h-[20px] mt-3">
          {avatarLog}
        </pre>
      </section>

      <p className="text-xs text-gray-500">
        Mẹo: endpoint có @PreAuthorize thì nhớ paste JWT vào ô Authorization.
        Nếu backend dùng session/CSRF thì cần cấu hình thêm.
      </p>
    </div>
  );
}
