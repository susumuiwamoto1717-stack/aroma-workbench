"use client";

import { useState, useMemo, use } from "react";
import { useAppState, questionChannels } from "@/lib/store";
import { PatternNote } from "@/lib/types";
import Link from "next/link";

const DESIGN_ORDER = [7, 6, 5, 4, 3, 2, 1];

export default function PatternEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, dispatch } = useAppState();
  const pattern = state.patterns.find((p) => p.id === id);
  const [activeQ, setActiveQ] = useState(7);
  const [noteText, setNoteText] = useState("");
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);

  if (!pattern) {
    return (
      <div className="p-8">
        <p className="text-gray-500">パターンが見つかりません。</p>
        <Link href="/patterns" className="text-blue-600 hover:underline mt-2 inline-block">
          ← パターン一覧に戻る
        </Link>
      </div>
    );
  }

  const currentQuestion = pattern.questions.find((q) => q.number === activeQ);

  const assignedFragranceIds = useMemo(() => {
    if (!currentQuestion) return new Set<string>();
    const ids = new Set<string>();
    currentQuestion.choices.forEach((c) =>
      c.fragranceIds.forEach((fId) => ids.add(fId))
    );
    return ids;
  }, [currentQuestion]);

  const unassigned = state.fragrances.filter(
    (f) => !assignedFragranceIds.has(f.id)
  );

  const questionNotes = pattern.notes.filter(
    (n) => n.questionNumber === activeQ
  );

  function updateQuestionText(text: string) {
    if (!currentQuestion) return;
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        patternId: id,
        question: { ...currentQuestion, text },
      },
    });
  }

  function updateChoiceLabel(choiceIndex: number, label: string) {
    if (!currentQuestion) return;
    const newChoices = currentQuestion.choices.map((c, i) =>
      i === choiceIndex ? { ...c, label } : c
    );
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        patternId: id,
        question: { ...currentQuestion, choices: newChoices },
      },
    });
  }

  function assignToChoice(choiceIndex: number, fragranceId: string) {
    if (!currentQuestion) return;
    const newChoices = currentQuestion.choices.map((c, i) => {
      if (i === choiceIndex) {
        if (c.fragranceIds.includes(fragranceId)) return c;
        return { ...c, fragranceIds: [...c.fragranceIds, fragranceId] };
      }
      return {
        ...c,
        fragranceIds: c.fragranceIds.filter((fId) => fId !== fragranceId),
      };
    });
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        patternId: id,
        question: { ...currentQuestion, choices: newChoices },
      },
    });
    setSelectedFragrance(null);
  }

  function removeFromChoice(choiceIndex: number, fragranceId: string) {
    if (!currentQuestion) return;
    const newChoices = currentQuestion.choices.map((c, i) =>
      i === choiceIndex
        ? { ...c, fragranceIds: c.fragranceIds.filter((fId) => fId !== fragranceId) }
        : c
    );
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        patternId: id,
        question: { ...currentQuestion, choices: newChoices },
      },
    });
  }

  function addNote() {
    if (!noteText.trim()) return;
    const note: PatternNote = {
      id: crypto.randomUUID(),
      questionNumber: activeQ,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_NOTE", payload: { patternId: id, note } });
    setNoteText("");
  }

  function deleteNote(noteId: string) {
    dispatch({ type: "DELETE_NOTE", payload: { patternId: id, noteId } });
  }

  function clearQuestion() {
    if (!currentQuestion) return;
    if (!confirm("この質問の設定をすべてリセットしますか？")) return;
    const newChoices = currentQuestion.choices.map((c) => ({
      ...c,
      label: "",
      fragranceIds: [],
    }));
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        patternId: id,
        question: { ...currentQuestion, text: "", choices: newChoices },
      },
    });
  }

  function getQuestionStatus(qNum: number) {
    if (!pattern) return "empty";
    const q = pattern.questions.find((q) => q.number === qNum);
    if (!q) return "empty";
    const hasText = !!q.text;
    const hasChoices = q.choices.some(
      (c) => c.label && c.fragranceIds.length > 0
    );
    const allAssigned = q.choices.every((c) => c.fragranceIds.length > 0);
    if (hasText && allAssigned) return "complete";
    if (hasText || hasChoices) return "partial";
    return "empty";
  }

  const otherQuestionsRef = pattern.questions.filter(
    (q) => q.number !== activeQ && q.text
  );

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            href="/patterns"
            className="text-sm text-blue-600 hover:underline"
          >
            ← パターン一覧
          </Link>
          <h1 className="text-xl font-bold mt-1">{pattern.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearQuestion}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
          >
            Q{activeQ}をリセット
          </button>
          <Link
            href={`/simulator/${id}`}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
          >
            シミュレーション →
          </Link>
        </div>
      </div>

      {/* 設計順タブ（Q7→Q1） */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {DESIGN_ORDER.map((qNum, i) => {
          const status = getQuestionStatus(qNum);
          return (
            <button
              key={qNum}
              onClick={() => setActiveQ(qNum)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                activeQ === qNum
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "complete"
                      ? "bg-emerald-400"
                      : status === "partial"
                      ? "bg-amber-400"
                      : "bg-gray-300"
                  }`}
                />
                <span>Q{qNum}</span>
                <span className="text-[10px] text-gray-400">
                  Step{i + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左カラム: 未分類の香り */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              未分類の香り
              <span className="ml-2 text-xs text-gray-400 font-normal">
                {unassigned.length}種
              </span>
            </h3>
            {unassigned.length === 0 ? (
              <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                すべての香りが分類されました
              </p>
            ) : (
              <div className="space-y-1.5">
                {unassigned.map((f) => (
                  <button
                    key={f.id}
                    onClick={() =>
                      setSelectedFragrance(
                        selectedFragrance === f.id ? null : f.id
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedFragrance === f.id
                        ? "bg-blue-100 border-blue-300 border ring-2 ring-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">{f.name}</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {f.description}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedFragrance && (
              <p className="text-xs text-blue-600 mt-3 bg-blue-50 p-2 rounded">
                右の選択肢をクリックして割り当ててください
              </p>
            )}
          </div>

          {/* 他の質問の参照 */}
          {otherQuestionsRef.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-4 mt-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">
                他の質問（参照用）
              </h3>
              <div className="space-y-2">
                {otherQuestionsRef.map((q) => (
                  <div key={q.id} className="text-xs bg-gray-50 p-2 rounded-lg">
                    <div className="font-medium text-gray-600">
                      Q{q.number}: {q.text}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {q.choices
                        .filter((c) => c.label)
                        .map((c, i) => (
                          <span
                            key={i}
                            className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {c.label}({c.fragranceIds.length})
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 中央カラム: 質問と4つの選択肢 */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Q{activeQ} の質問文
              </label>
              {questionChannels[activeQ] && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                  チャンネル: {questionChannels[activeQ].label} — {questionChannels[activeQ].description}
                </span>
              )}
            </div>
            <input
              type="text"
              value={currentQuestion?.text || ""}
              onChange={(e) => updateQuestionText(e.target.value)}
              placeholder="例：今の気分を色で表すと？"
              className="w-full px-4 py-3 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {currentQuestion?.choices.map((choice, i) => {
              const choiceColors = [
                "border-blue-200 bg-blue-50/50",
                "border-rose-200 bg-rose-50/50",
                "border-emerald-200 bg-emerald-50/50",
                "border-amber-200 bg-amber-50/50",
              ];
              const headerColors = [
                "text-blue-700",
                "text-rose-700",
                "text-emerald-700",
                "text-amber-700",
              ];
              const fragrancesInChoice = choice.fragranceIds
                .map((fId) => state.fragrances.find((f) => f.id === fId))
                .filter(Boolean);

              return (
                <div
                  key={choice.id}
                  className={`rounded-xl border-2 p-4 ${choiceColors[i]} ${
                    selectedFragrance ? "cursor-pointer hover:shadow-md" : ""
                  } transition`}
                  onClick={() => {
                    if (selectedFragrance) {
                      assignToChoice(i, selectedFragrance);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold ${headerColors[i]}`}
                    >
                      選択肢 {i + 1}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({choice.fragranceIds.length}種)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={choice.label}
                    onChange={(e) => updateChoiceLabel(i, e.target.value)}
                    placeholder={`選択肢${i + 1}のラベル`}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-3 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="space-y-1 min-h-[60px]">
                    {fragrancesInChoice.map(
                      (f) =>
                        f && (
                          <div
                            key={f.id}
                            className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md text-xs group"
                          >
                            <span>{f.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromChoice(i, f.id);
                              }}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                              ✕
                            </button>
                          </div>
                        )
                    )}
                    {fragrancesInChoice.length === 0 && (
                      <p className="text-[11px] text-gray-300 text-center py-3">
                        {selectedFragrance
                          ? "クリックして追加"
                          : "香りを割り当ててください"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* メモ */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Q{activeQ} のメモ
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="なぜこのグループ分けにしたか、迷った点など"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <button
                onClick={addNote}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
              >
                追加
              </button>
            </div>
            {questionNotes.length > 0 ? (
              <div className="space-y-2">
                {questionNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2 bg-amber-50 px-3 py-2 rounded-lg text-sm group"
                  >
                    <span className="text-amber-400 text-xs mt-0.5">📝</span>
                    <div className="flex-1">
                      <p className="text-gray-700">{note.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(note.createdAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">まだメモはありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
