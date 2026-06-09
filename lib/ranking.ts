// Feed ranking knob. The score itself is computed in SQL (feed_ranked view).
// This mirror is only for optimistic client-side re-sorting after a salute.
export const GRAVITY = 1.5;
export function hotScore(salutes: number, comments: number, createdAtIso: string) {
  const ageHours = (Date.now() - new Date(createdAtIso).getTime()) / 3.6e6;
  return (salutes + 0.5 * comments + 1) / Math.pow(ageHours + 2, GRAVITY);
}
