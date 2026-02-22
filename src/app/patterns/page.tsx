"use client";

import { useState } from "react";
import { useAppState, createEmptyPattern } from "@/lib/store";
import Link from "next/link";

export default function PatternsPage() {
  const { state, dispatch } = useAppState();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  function createPattern() {
    if (!newName.trim()) return;
    const pattern = createEmptyPattern(newName.trim());
    dispatch({ type: "ADD_PATTERN", payload: pattern });
    setNewName("");
    setShowCreate(false);
  }

  function deletePattern(id: string) {
    if (!confirm("このパターンを削除しますか？")) return;
    dispatch({ type: "DELETE_PATTERN", payload: id });
  }

  function duplicatePattern(id: string) {
    const original = state.patterns.find((p) => p.id === id);
    if (!original) return;
    const now = new Date().toISOString();
    const copy = {
      ...structuredClone(original),
      id: crypto.randomUUID(),
      name: `${original.name}（コピー）`,
      createdAt: now,
      updatedAt: now,
    };
    copy.questions.forEach((q) => {
      q.id = crypto.randomUUID();
      q.choices.forEach((c) => {
        c.id = crypto.randomUUID();
      });
    });
    dispatch({ type: "ADD_PATTERN", payload: copy });
  }

  function getProgress(pattern: typeof state.patterns[0]) {
    const filled = pattern.questions.filter(
      (q) =>
        q.text &&
        q.choices.some((c) => c.label && c.fragranceIds.length > 0)
    ).length;
    return filled;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">パターン一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            質問パターンを作成して試行錯誤しましょう
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          + 新しいパターン
        </button>
      </div>

      {showCreate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">新しいパターンを作成</h3>
          <input
            type="text"
            placeholder="パターン名（例：感情ベース v1）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createPattern()}
          />
          <div className="flex gap-2">
            <button
              onClick={createPattern}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              作成する
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {state.patterns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-400 mb-4">
            まだパターンがありません
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            最初のパターンを作成
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {state.patterns.map((pattern) => {
            const progress = getProgress(pattern);
            return (
              <div
                key={pattern.id}
                className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{pattern.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      作成:{" "}
                      {new Date(pattern.createdAt).toLocaleDateString("ja-JP")}{" "}
                      / 更新:{" "}
                      {new Date(pattern.updatedAt).toLocaleDateString("ja-JP")}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }, (_, i) => {
                          const q = pattern.questions.find(
                            (q) => q.number === i + 1
                          );
                          const isFilled =
                            q &&
                            q.text &&
                            q.choices.some(
                              (c) => c.label && c.fragranceIds.length > 0
                            );
                          return (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                                isFilled
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {i + 1}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-400">
                        {progress}/7 設計済み
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/patterns/${pattern.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/patterns/${pattern.id}/overview`}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      マップ
                    </Link>
                    {progress > 0 && (
                      <Link
                        href={`/simulator/${pattern.id}`}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                      >
                        テスト
                      </Link>
                    )}
                    <button
                      onClick={() => duplicatePattern(pattern.id)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition"
                      title="複製"
                    >
                      複製
                    </button>
                    <button
                      onClick={() => deletePattern(pattern.id)}
                      className="px-3 py-2 bg-gray-100 text-red-500 text-sm rounded-lg hover:bg-red-50 transition"
                      title="削除"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
