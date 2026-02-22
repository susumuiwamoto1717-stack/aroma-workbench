"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import {
  AppState,
  Fragrance,
  Pattern,
  Question,
  PatternNote,
} from "./types";
import { defaultFragrances } from "./sampleData";

type Action =
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "SET_FRAGRANCES"; payload: Fragrance[] }
  | { type: "ADD_FRAGRANCE"; payload: Fragrance }
  | { type: "UPDATE_FRAGRANCE"; payload: Fragrance }
  | { type: "DELETE_FRAGRANCE"; payload: string }
  | { type: "ADD_PATTERN"; payload: Pattern }
  | { type: "UPDATE_PATTERN"; payload: Pattern }
  | { type: "DELETE_PATTERN"; payload: string }
  | {
      type: "UPDATE_QUESTION";
      payload: { patternId: string; question: Question };
    }
  | { type: "ADD_NOTE"; payload: { patternId: string; note: PatternNote } }
  | {
      type: "DELETE_NOTE";
      payload: { patternId: string; noteId: string };
    };

const initialState: AppState = {
  fragrances: defaultFragrances,
  patterns: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;

    case "SET_FRAGRANCES":
      return { ...state, fragrances: action.payload };

    case "ADD_FRAGRANCE":
      return { ...state, fragrances: [...state.fragrances, action.payload] };

    case "UPDATE_FRAGRANCE":
      return {
        ...state,
        fragrances: state.fragrances.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };

    case "DELETE_FRAGRANCE":
      return {
        ...state,
        fragrances: state.fragrances.filter((f) => f.id !== action.payload),
      };

    case "ADD_PATTERN":
      return { ...state, patterns: [...state.patterns, action.payload] };

    case "UPDATE_PATTERN":
      return {
        ...state,
        patterns: state.patterns.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case "DELETE_PATTERN":
      return {
        ...state,
        patterns: state.patterns.filter((p) => p.id !== action.payload),
      };

    case "UPDATE_QUESTION": {
      const { patternId, question } = action.payload;
      return {
        ...state,
        patterns: state.patterns.map((p) => {
          if (p.id !== patternId) return p;
          const exists = p.questions.find((q) => q.number === question.number);
          const questions = exists
            ? p.questions.map((q) =>
                q.number === question.number ? question : q
              )
            : [...p.questions, question];
          return { ...p, questions, updatedAt: new Date().toISOString() };
        }),
      };
    }

    case "ADD_NOTE": {
      const { patternId, note } = action.payload;
      return {
        ...state,
        patterns: state.patterns.map((p) =>
          p.id === patternId
            ? { ...p, notes: [...p.notes, note], updatedAt: new Date().toISOString() }
            : p
        ),
      };
    }

    case "DELETE_NOTE": {
      const { patternId, noteId } = action.payload;
      return {
        ...state,
        patterns: state.patterns.map((p) =>
          p.id === patternId
            ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
            : p
        ),
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aroma-workbench");
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        if (parsed.fragrances && parsed.patterns) {
          dispatch({ type: "LOAD_STATE", payload: parsed });
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("aroma-workbench", JSON.stringify(state));
    }
  }, [state, loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppState must be used within AppProvider");
  return context;
}

const questionTemplates: { text: string; labels: string[] }[] = [
  {
    text: "今の自分に一番近い気持ちは？",
    labels: [
      "穏やかで満たされている",
      "何か新しいことを始めたい",
      "少し疲れていて、癒されたい",
      "自分を高めたい、集中したい",
    ],
  },
  {
    text: "今、心に浮かぶ色は？",
    labels: ["青・水色", "緑・深緑", "赤・ピンク", "黄・オレンジ"],
  },
  {
    text: "今一番いたい場所は？",
    labels: [
      "静かな森の中",
      "海辺で風を感じる場所",
      "花が咲き誇る庭園",
      "暖炉のあるあたたかい部屋",
    ],
  },
  {
    text: "理想の朝の過ごし方は？",
    labels: [
      "窓を開けて深呼吸する",
      "ゆっくりお茶を淹れる",
      "音楽をかけてストレッチ",
      "本を読みながら静かに過ごす",
    ],
  },
  {
    text: "今、触れたいと思うものは？",
    labels: [
      "シルクのような滑らかなもの",
      "木の幹のぬくもり",
      "ひんやりした石や陶器",
      "ふわふわの毛布やカシミア",
    ],
  },
  {
    text: "心地よいと感じる景色は？",
    labels: [
      "春の桜並木を歩く",
      "夏の朝、露に濡れた草原",
      "秋の夕暮れ、落ち葉の道",
      "冬の夜、温かい飲み物を手に",
    ],
  },
  {
    text: "直感で、惹かれる情景は？",
    labels: [
      "透明な水が静かに流れている",
      "夕焼けに染まる空",
      "星が輝く静かな夜空",
      "朝露が光る一枚の葉",
    ],
  },
];

export const questionChannels: Record<number, { label: string; description: string }> = {
  1: { label: "感情", description: "今の心理状態を聞く" },
  2: { label: "色彩", description: "視覚から感覚をマッピング" },
  3: { label: "空間", description: "居心地の良い環境を探る" },
  4: { label: "生活", description: "日常の好みから読み取る" },
  5: { label: "触覚", description: "身体感覚の好みを探る" },
  6: { label: "情景", description: "複合的な感覚を統合する" },
  7: { label: "直感", description: "理屈を超えた本能で判断" },
};

export function createEmptyPattern(name: string): Pattern {
  const now = new Date().toISOString();
  const questions: Question[] = questionTemplates.map((tmpl, i) => ({
    id: crypto.randomUUID(),
    number: i + 1,
    text: tmpl.text,
    choices: tmpl.labels.map((label) => ({
      id: crypto.randomUUID(),
      label,
      fragranceIds: [],
    })),
  }));

  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    questions,
    notes: [],
  };
}

export function calculateScores(
  pattern: Pattern,
  answers: Map<number, string>,
  fragrances: Fragrance[]
): { fragranceId: string; score: number; matchedQuestions: number[] }[] {
  const scoreMap = new Map<string, { score: number; matchedQuestions: number[] }>();

  fragrances.forEach((f) => {
    scoreMap.set(f.id, { score: 0, matchedQuestions: [] });
  });

  answers.forEach((choiceId, questionNumber) => {
    const question = pattern.questions.find((q) => q.number === questionNumber);
    if (!question) return;
    const choice = question.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    choice.fragranceIds.forEach((fId) => {
      const entry = scoreMap.get(fId);
      if (entry) {
        entry.score += 1;
        entry.matchedQuestions.push(questionNumber);
      }
    });
  });

  return Array.from(scoreMap.entries())
    .map(([fragranceId, data]) => ({ fragranceId, ...data }))
    .sort((a, b) => b.score - a.score);
}
