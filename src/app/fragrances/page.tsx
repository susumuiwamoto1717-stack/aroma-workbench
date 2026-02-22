"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { Fragrance } from "@/lib/types";

export default function FragrancesPage() {
  const { state, dispatch } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function startEdit(f: Fragrance) {
    setEditingId(f.id);
    setEditName(f.name);
    setEditDesc(f.description);
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    dispatch({
      type: "UPDATE_FRAGRANCE",
      payload: { id: editingId, name: editName.trim(), description: editDesc.trim() },
    });
    setEditingId(null);
  }

  function addFragrance() {
    if (!newName.trim()) return;
    const newF: Fragrance = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim(),
    };
    dispatch({ type: "ADD_FRAGRANCE", payload: newF });
    setNewName("");
    setNewDesc("");
    setShowAdd(false);
  }

  function deleteFragrance(id: string) {
    if (!confirm("この香りを削除しますか？")) return;
    dispatch({ type: "DELETE_FRAGRANCE", payload: id });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">香り管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.fragrances.length}種類の香りが登録されています
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          + 追加
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">新しい香りを追加</h3>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="香りの名前"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              autoFocus
            />
          </div>
          <input
            type="text"
            placeholder="説明（任意）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={addFragrance}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              追加する
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setNewName("");
                setNewDesc("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 w-8">
                #
              </th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">
                名前
              </th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">
                説明
              </th>
              <th className="text-right text-xs text-gray-500 font-medium px-5 py-3 w-28">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {state.fragrances.map((f, i) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                {editingId === f.id ? (
                  <>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        autoFocus
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={saveEdit}
                        className="text-blue-600 text-sm hover:underline mr-3"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 text-sm hover:underline"
                      >
                        取消
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{f.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {f.description}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => startEdit(f)}
                        className="text-blue-600 text-sm hover:underline mr-3"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteFragrance(f.id)}
                        className="text-red-400 text-sm hover:underline"
                      >
                        削除
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
