"use client";

import { useAppState } from "@/lib/store";
import Link from "next/link";

export default function Home() {
  const { state } = useAppState();
  const completedPatterns = state.patterns.filter((p) =>
    p.questions.every(
      (q) => q.text && q.choices.every((c) => c.label && c.fragranceIds.length > 0)
    )
  );

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">アロマ診断ロジック設計ワークベンチ</h1>
      <p className="text-gray-500 mb-8">
        先生方が香り診断の質問ロジックを試行錯誤しながら設計するためのツールです。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl font-bold text-blue-600">
            {state.fragrances.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">登録済みの香り</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl font-bold text-emerald-600">
            {state.patterns.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">作成したパターン</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl font-bold text-amber-600">
            {completedPatterns.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">完成したパターン</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">使い方</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex-none w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <span className="font-medium text-gray-800">香りを管理</span>
              <span className="ml-2">
                20種のブレンド香水を登録・編集します。
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-none w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <span className="font-medium text-gray-800">パターンを作成</span>
              <span className="ml-2">
                新しい質問パターンを作り、逆算エディターで設計します。
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-none w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <span className="font-medium text-gray-800">逆算で設計</span>
              <span className="ml-2">
                Q7（最後の質問）から順に、香りをグループ分けしながら質問を作ります。
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-none w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <div>
              <span className="font-medium text-gray-800">シミュレーション</span>
              <span className="ml-2">
                お客さん視点で質問に答えて、結果を検証します。
              </span>
            </div>
          </li>
        </ol>
      </div>

      <div className="flex gap-4">
        <Link
          href="/fragrances"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          香り管理へ →
        </Link>
        <Link
          href="/patterns"
          className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
        >
          パターン一覧へ →
        </Link>
      </div>
    </div>
  );
}
