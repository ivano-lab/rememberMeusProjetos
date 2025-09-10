import React, { useEffect, useState, useRef } from "react";

// Gerenciador Multioperacional
// Single-file React component (Tailwind CSS assumed available)
// Uso: importe e renderize <MultiOpManager /> numa app React. Salva no localStorage.

export default function MultiOpManager() {
  const [projects, setProjects] = useState(() => {
    try {
      const raw = localStorage.getItem("mo_projects_v1");
      return raw ? JSON.parse(raw) : sampleData();
    } catch (e) {
      return sampleData();
    }
  });

  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterPriority, setFilterPriority] = useState("Todas");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("mo_projects_v1", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (showModal && titleRef.current) titleRef.current.focus();
  }, [showModal]);

  function sampleData() {
    return [
      {
        id: idNow(),
        title: "Ql-Gpt-mini",
        category: "Software/IA",
        priority: "Alta",
        status: "Backlog",
        tags: ["IA","educacional"],
        notes: "Minigpt educativo — começar arquitetura e dataset",
      },
      {
        id: idNow(1),
        title: "Rapsódia de Silício (Roteiro)",
        category: "Narrativa/HQ",
        priority: "Média",
        status: "Doing",
        tags: ["HQ","roteiro"],
        notes: "Revisar capítulo 2 e transformar em script de quadrinhos",
      },
      {
        id: idNow(2),
        title: "EasyIt (task manager)",
        category: "Software/IA",
        priority: "Alta",
        status: "Review",
        tags: ["produtividade"],
        notes: "Protótipo funcional — testar fluxos de deploy",
      },
    ];
  }

  function idNow(suffix = 0) {
    return `${Date.now()}_${Math.floor(Math.random() * 9999)}_${suffix}`;
  }

  function openNewModal() {
    setEditing({
      id: null,
      title: "",
      category: "Exploratório",
      priority: "Média",
      status: "Backlog",
      tags: [],
      notes: "",
    });
    setShowModal(true);
  }

  function saveProject(p) {
    if (!p.title || !p.title.trim()) return alert("Defina um título para o projeto");
    if (p.id) {
      setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    } else {
      p.id = idNow();
      setProjects((prev) => [p, ...prev]);
    }
    setShowModal(false);
    setEditing(null);
  }

  function removeProject(id) {
    if (!confirm("Remover projeto?")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function startEdit(p) {
    setEditing({ ...p });
    setShowModal(true);
  }

  function quickCapture(text) {
    const p = {
      id: idNow(),
      title: text.slice(0, 60) || "Rascunho rápido",
      category: "Rascunho",
      priority: "Baixa",
      status: "Backlog",
      tags: ["quick"],
      notes: text,
    };
    setProjects((prev) => [p, ...prev]);
  }

  // Filters & search
  const categories = ["Todas", ...Array.from(new Set(projects.map((p) => p.category)))];

  const visible = projects.filter((p) => {
    if (filterCategory !== "Todas" && p.category !== filterCategory) return false;
    if (filterPriority !== "Todas" && p.priority !== filterPriority) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = (p.title + " " + p.notes + " " + p.tags.join(" ")).toLowerCase();
      return hay.includes(q);
    }
    return true;
  });

  const columns = ["Backlog", "Doing", "Review", "Done"];

  function onDrop(ev, status) {
    const id = ev.dataTransfer.getData("text/plain");
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  function onDragStart(ev, id) {
    ev.dataTransfer.setData("text/plain", id);
  }

  // Simple stats
  const stats = {
    total: projects.length,
    byStatus: columns.reduce((acc, s) => ({ ...acc, [s]: projects.filter((p) => p.status === s).length }), {}),
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciador Multioperacional</h1>
          <p className="text-sm text-slate-600">Visão rápida dos seus projetos — priorize. capture. execute.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-sm text-slate-700">Projetos: <strong>{stats.total}</strong></div>
          <button onClick={openNewModal} className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm">+ Novo</button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 md:col-span-3 bg-white p-4 rounded shadow-sm">
          <div className="flex gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar (título, notas, tags)" className="flex-1 border rounded px-3 py-2" />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded px-3 py-2">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border rounded px-3 py-2">
              <option value="Todas">Todas</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
            <button onClick={() => { setQuery(""); setFilterCategory("Todas"); setFilterPriority("Todas"); }} className="px-3 py-2 border rounded">Limpar</button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border rounded">
              <div className="text-xs text-slate-500">Backlog</div>
              <div className="text-lg font-semibold">{stats.byStatus.Backlog || 0}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-xs text-slate-500">Doing</div>
              <div className="text-lg font-semibold">{stats.byStatus.Doing || 0}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-xs text-slate-500">Review</div>
              <div className="text-lg font-semibold">{stats.byStatus.Review || 0}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-xs text-slate-500">Done</div>
              <div className="text-lg font-semibold">{stats.byStatus.Done || 0}</div>
            </div>
          </div>

        </div>

        <aside className="col-span-1 bg-white p-4 rounded shadow-sm">
          <div className="text-sm font-semibold mb-2">Captura rápida</div>
          <QuickCapture onCapture={quickCapture} />

          <div className="mt-4 text-sm">
            <div className="font-semibold">Categorias</div>
            <div className="text-slate-600 text-sm mt-1">{categories.slice(1).join(' • ')}</div>
          </div>

        </aside>
      </section>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col} className="bg-white p-3 rounded shadow-sm min-h-[200px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col)}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{col}</h3>
                <div className="text-sm text-slate-500">{projects.filter((p) => p.status === col).length}</div>
              </div>

              <div className="space-y-3">
                {visible.filter((p) => p.status === col).map((p) => (
                  <article key={p.id} draggable onDragStart={(e) => onDragStart(e, p.id)} className="border rounded p-3 hover:shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{p.title}</h4>
                        <div className="text-xs text-slate-500">{p.category} • {p.priority}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-sm px-2 py-1 border rounded">Editar</button>
                        <button onClick={() => removeProject(p.id)} className="text-sm px-2 py-1 border rounded text-red-600">Excluir</button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 line-clamp-3">{p.notes}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {p.tags?.map((t) => <span key={t} className="text-xs px-2 py-1 border rounded">{t}</span>)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setEditing(null); }} />
          <div className="bg-white rounded p-6 z-10 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3">{editing.id ? 'Editar projeto' : 'Novo projeto'}</h2>
            <div className="grid gap-3">
              <input ref={titleRef} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Título" className="border px-3 py-2 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Categoria" className="border px-3 py-2 rounded" />
                <select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })} className="border px-3 py-2 rounded">
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="border px-3 py-2 rounded">
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={editing.tags?.join(", ") || ""} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="tags (separadas por vírgula)" className="border px-3 py-2 rounded" />
              <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Notas" className="border px-3 py-2 rounded h-28" />

              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={() => saveProject(editing)} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function QuickCapture({ onCapture }) {
  const [text, setText] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onCapture(text.trim()); setText(""); } }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Rascunho rápido — ideia, título, lembrete..." className="w-full border rounded px-3 py-2 h-24 mb-2" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setText(""); }} className="px-3 py-1 border rounded">Limpar</button>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Capturar</button>
      </div>
    </form>
  );
}
