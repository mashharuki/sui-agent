// clsxからClassValue型とclsx関数をインポート
import { type ClassValue, clsx } from "clsx";
// tailwind-mergeからtwMerge関数をインポート
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を結合し、競合するクラスをマージするためのユーティリティ関数です。
 * clsxを使ってクラス名を動的に結合し、twMergeでTailwindの競合を解決します。
 * @param {...ClassValue[]} inputs - 結合するクラス名のリスト。文字列、配列、オブジェクトなど、clsxが受け入れる任意の形式。
 * @returns {string} - マージされた最終的なクラス名の文字列。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
