"use client";

import { useState, use } from "react";
import { useAppState, questionChannels } from "@/lib/store";
import Link from "next/link";

const CHANNEL_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-600" },
  2: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", badge: "bg-sky-100 text-sky-600" },
  3: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-600" },
  4: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-600" },
  5: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-600" },
  6: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-600" },
  7: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-600" },
};

const CHOICE_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
  { bg: "bg-pink-50", border: "border-pink-200", dot: "bg-pink-400" },
  { bg: "bg-green-50", border: "border-green-200", dot: "bg-green-400" },
  { bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-400" },
];

export default function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, dispatch } = useAppState();
  const pattern = state.patterns.find((p) => p.id === id);
  const [highlightedFragrance, setHighlightedFragrance] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingChoice, setEditingChoice] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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

  const sortedQuestions = [...pattern.questions].sort((a, b) => a.number - b.number);

  function startEditQuestion(qNum: number, currentText: string) {
    setEditingQuestion(qNum);
    setEditingChoice(null);
    setEditText(currentText);
  }

  function startEditChoice(choiceId: string, currentLabel: string) {
    setEditingChoice(choiceId);
    setEditingQuestion(null);
    setEditText(currentLabel);
  }

  function saveQuestionText(qNum: number) {
    const q = pattern!.questions.find((q) => q.number === qNum);
    if (!q) return;
    dispatch({
      type: "UPDATE_QUESTION",
      payload: { patternId: id, question: { ...q, text: editText } },
    });
    setEditingQuestion(null);
  }

  function saveChoiceLabel(qNum: number, choiceId: string) {
    const q = pattern!.questions.find((q) => q.number === qNum);
    if (!q) return;
    const newChoices = q.choices.map((c) =>
      c.id === choiceId ? { ...c, label: editText } : c
    );
    dispatch({
      type: "UPDATE_QUESTION",
      payload: { patternId: id, question: { ...q, choices: newChoices } },
    });
    setEditingChoice(null);
  }

  function getFragrancePositions(fragranceId: string) {
    const positions: { qNum: number; choiceIndex: number }[] = [];
    pattern!.questions.forEach((q) => {
      q.choices.forEach((c, ci) => {
        if (c.fragranceIds.includes(fragranceId)) {
          positions.push({ qNum: q.number, choiceIndex: ci });
        }
      });
    });
    return positions;
  }

  const highlightPositions = highlightedFragrance
    ? getFragrancePositions(highlightedFragrance)
    : [];

  const highlightedName = highlightedFragrance
    ? state.fragrances.find((f) => f.id === highlightedFragrance)?.name
    : null;

  const assignedCounts = sortedQuestions.map((q) => {
    const total = q.choices.reduce((sum, c) => sum + c.fragranceIds.length, 0);
    return { qNum: q.number, total, target: state.fragrances.length };
  });

  return (
    <div className="p-6 min-h-screen">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            href={`/patterns/${id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← エディターに戻る
          </Link>
          <h1 className="text-xl font-bold mt-1">{pattern.name} — マインドマップ</h1>
          <p className="text-xs text-gray-400 mt-1">
            質問文・選択肢をクリックで編集 / 香りをクリックで全質問での位置をハイライト
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/patterns/${id}`}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            詳細エディター
          </Link>
          <Link
            href={`/simulator/${id}`}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
          >
            シミュレーション →
          </Link>
        </div>
      </div>

      {/* ハイライト中の香り */}
      {highlightedFragrance && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-blue-700">{highlightedName}</span>
            <span className="text-blue-500 ml-2">
              が含まれるグループをハイライト中（{highlightPositions.length}/{sortedQuestions.length} 問で割り当て済み）
            </span>
          </div>
          <button
            onClick={() => setHighlightedFragrance(null)}
            className="text-blue-400 hover:text-blue-600 text-sm"
          >
            解除
          </button>
        </div>
      )}

      {/* 香り一覧（横並び・クリックでハイライト） */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          香り一覧（クリックでハイライト）
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {state.fragrances.map((f) => {
            const isHighlighted = highlightedFragrance === f.id;
            const positions = getFragrancePositions(f.id);
            const assignedCount = positions.length;
            return (
              <button
                key={f.id}
                onClick={() =>
                  setHighlightedFragrance(isHighlighted ? null : f.id)
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs transition border ${
                  isHighlighted
                    ? "bg-blue-100 border-blue-400 text-blue-800 ring-2 ring-blue-200"
                    : assignedCount === 0
                    ? "bg-red-50 border-red-200 text-red-600"
                    : assignedCount < 7
                    ? "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-blue-50"
                }`}
              >
                {f.name}
                <span className="ml-1 opacity-60">{assignedCount}/7</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* マインドマップ本体（横スクロール） */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {sortedQuestions.map((q) => {
            const colors = CHANNEL_COLORS[q.number] || CHANNEL_COLORS[1];
            const channel = questionChannels[q.number];
            const assigned = assignedCounts.find((a) => a.qNum === q.number);

            return (
              <div
                key={q.id}
                className={`w-64 flex-shrink-0 rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}
              >
                {/* 質問ヘッダー */}
                <div className="p-3 border-b border-inherit">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${colors.text}`}>
                      Q{q.number}
                    </span>
                    {channel && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {channel.label}
                      </span>
                    )}
                  </div>

                  {editingQuestion === q.number ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-xs bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveQuestionText(q.number);
                          if (e.key === "Escape") setEditingQuestion(null);
                        }}
                        onBlur={() => saveQuestionText(q.number)}
                      />
                    </div>
                  ) : (
                    <p
                      className="text-sm font-medium cursor-pointer hover:bg-white/50 rounded px-1 py-0.5 -mx-1 transition"
                      onClick={() => startEditQuestion(q.number, q.text)}
                      title="クリックで編集"
                    >
                      {q.text || "(質問文を入力)"}
                    </p>
                  )}

                  {assigned && (
                    <p className={`text-[10px] mt-1 ${
                      assigned.total === assigned.target ? "text-emerald-600" : "text-gray-400"
                    }`}>
                      {assigned.total}/{assigned.target} 種 割り当て済み
                    </p>
                  )}
                </div>

                {/* 4つの選択肢 */}
                <div className="p-2 space-y-2">
                  {q.choices.map((choice, ci) => {
                    const cc = CHOICE_COLORS[ci];
                    const isChoiceHighlighted =
                      highlightedFragrance &&
                      highlightPositions.some(
                        (p) => p.qNum === q.number && p.choiceIndex === ci
                      );
                    const fragrancesInChoice = choice.fragranceIds
                      .map((fId) => state.fragrances.find((f) => f.id === fId))
                      .filter(Boolean);

                    return (
                      <div
                        key={choice.id}
                        className={`rounded-lg border p-2 transition ${
                          isChoiceHighlighted
                            ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                            : `${cc.border} ${cc.bg}`
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
                          {editingChoice === choice.id ? (
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-1.5 py-0.5 border rounded text-[11px] bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveChoiceLabel(q.number, choice.id);
                                if (e.key === "Escape") setEditingChoice(null);
                              }}
                              onBlur={() => saveChoiceLabel(q.number, choice.id)}
                            />
                          ) : (
                            <span
                              className="text-[11px] font-medium cursor-pointer hover:bg-white/60 rounded px-1 py-0.5 -mx-0.5 transition flex-1 truncate"
                              onClick={() => startEditChoice(choice.id, choice.label)}
                              title="クリックで編集"
                            >
                              {choice.label || "(ラベルを入力)"}
                            </span>
                          )}
                          <span className="text-[9px] text-gray-400">
                            {choice.fragranceIds.length}
                          </span>
                        </div>

                        {fragrancesInChoice.length > 0 ? (
                          <div className="flex flex-wrap gap-0.5">
                            {fragrancesInChoice.map(
                              (f) =>
                                f && (
                                  <span
                                    key={f.id}
                                    onClick={() =>
                                      setHighlightedFragrance(
                                        highlightedFragrance === f.id ? null : f.id
                                      )
                                    }
                                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${
                                      highlightedFragrance === f.id
                                        ? "bg-blue-200 text-blue-800 font-bold"
                                        : "bg-white/80 text-gray-600 hover:bg-blue-100"
                                    }`}
                                  >
                                    {f.name}
                                  </span>
                                )
                            )}
                          </div>
                        ) : (
                          <p className="text-[9px] text-gray-300 pl-3.5">未割り当て</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
