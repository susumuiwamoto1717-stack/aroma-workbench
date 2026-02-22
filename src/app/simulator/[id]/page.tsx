"use client";

import { useState, use } from "react";
import { useAppState, calculateScores } from "@/lib/store";
import Link from "next/link";

export default function SimulatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state } = useAppState();
  const pattern = state.patterns.find((p) => p.id === id);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [showResult, setShowResult] = useState(false);

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

  const availableQuestions = pattern.questions
    .filter(
      (q) =>
        q.text && q.choices.some((c) => c.label && c.fragranceIds.length > 0)
    )
    .sort((a, b) => a.number - b.number);

  if (availableQuestions.length === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          href={`/patterns/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← エディターに戻る
        </Link>
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center mt-4">
          <p className="text-gray-500">
            まだ質問が設計されていません。先にエディターで質問を作成してください。
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion =
    currentStep <= availableQuestions.length
      ? availableQuestions[currentStep - 1]
      : null;

  const scores = calculateScores(pattern, answers, state.fragrances);

  function selectChoice(choiceId: string) {
    const q = availableQuestions[currentStep - 1];
    if (!q) return;
    const newAnswers = new Map(answers);
    newAnswers.set(q.number, choiceId);
    setAnswers(newAnswers);

    if (currentStep < availableQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  }

  function reset() {
    setAnswers(new Map());
    setCurrentStep(1);
    setShowResult(false);
  }

  function goBack() {
    if (currentStep > 1) {
      const q = availableQuestions[currentStep - 2];
      const newAnswers = new Map(answers);
      newAnswers.delete(q.number);
      setAnswers(newAnswers);
      setCurrentStep(currentStep - 1);
      setShowResult(false);
    }
  }

  if (showResult) {
    const topScore = scores[0]?.score || 0;
    const winners = scores.filter((s) => s.score === topScore);

    return (
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/patterns/${id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← エディターに戻る
            </Link>
            <h1 className="text-xl font-bold mt-1">
              シミュレーション結果 — {pattern.name}
            </h1>
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            もう一度
          </button>
        </div>

        {/* 結果 */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-2">あなたの香りは...</p>
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {winners.map((w) => {
              const f = state.fragrances.find((f) => f.id === w.fragranceId);
              return f?.name;
            }).join(" / ")}
          </div>
          <p className="text-sm text-gray-400">
            スコア: {topScore} / {availableQuestions.length}
          </p>
          {winners.length > 1 && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full">
              同点が {winners.length} 種あります — 質問の調整が必要かもしれません
            </p>
          )}
        </div>

        {/* 回答の振り返り */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4">回答の振り返り</h2>
          <div className="space-y-3">
            {availableQuestions.map((q) => {
              const answeredChoiceId = answers.get(q.number);
              const choice = q.choices.find((c) => c.id === answeredChoiceId);
              return (
                <div key={q.id} className="flex items-start gap-3 text-sm">
                  <span className="flex-none w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    Q{q.number}
                  </span>
                  <div>
                    <div className="text-gray-600">{q.text}</div>
                    <div className="font-medium text-gray-800 mt-0.5">
                      → {choice?.label || "未回答"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 全スコアランキング */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold mb-4">全香りスコア</h2>
          <div className="space-y-2">
            {scores.map((s, i) => {
              const f = state.fragrances.find((f) => f.id === s.fragranceId);
              if (!f) return null;
              const barWidth =
                topScore > 0 ? (s.score / topScore) * 100 : 0;
              return (
                <div key={s.fragranceId} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-gray-400 text-right">
                    {i + 1}
                  </span>
                  <span className="w-32 text-sm truncate">{f.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        i === 0
                          ? "bg-blue-500"
                          : s.score === topScore
                          ? "bg-blue-400"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-gray-500 text-right">
                    {s.score}
                  </span>
                  <span className="text-[10px] text-gray-400 w-24">
                    Q{s.matchedQuestions.join(",")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/patterns/${id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← エディターに戻る
          </Link>
          <h1 className="text-xl font-bold mt-1">
            シミュレーション — {pattern.name}
          </h1>
        </div>
        <button
          onClick={reset}
          className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
        >
          リセット
        </button>
      </div>

      {/* プログレスバー */}
      <div className="flex gap-1 mb-8">
        {availableQuestions.map((q, i) => (
          <div
            key={q.id}
            className={`flex-1 h-2 rounded-full ${
              i < currentStep - 1
                ? "bg-blue-500"
                : i === currentStep - 1
                ? "bg-blue-300"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {currentQuestion && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              質問 {currentStep} / {availableQuestions.length}
            </span>
            <h2 className="text-xl font-semibold mt-2">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.choices
              .filter((c) => c.label)
              .map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => selectChoice(choice.id)}
                  className="p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
                >
                  <span className="text-sm font-medium group-hover:text-blue-700">
                    {choice.label}
                  </span>
                </button>
              ))}
          </div>

          {currentStep > 1 && (
            <button
              onClick={goBack}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600"
            >
              ← 前の質問に戻る
            </button>
          )}
        </div>
      )}

      {/* リアルタイムスコア（先生用） */}
      {answers.size > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            リアルタイムスコア（先生確認用）
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {scores.slice(0, 8).map((s) => {
              const f = state.fragrances.find((f) => f.id === s.fragranceId);
              if (!f) return null;
              return (
                <div
                  key={s.fragranceId}
                  className="bg-white px-3 py-2 rounded-lg text-xs flex justify-between"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="font-bold text-blue-600 ml-2">
                    {s.score}
                  </span>
                </div>
              );
            })}
          </div>
          {scores.length > 8 && (
            <p className="text-[10px] text-gray-400 mt-2">
              上位8種を表示中（残り{scores.length - 8}種）
            </p>
          )}
        </div>
      )}
    </div>
  );
}
