/** "Ready" or "N problems". */
export default function Badge({ ok, n }: { ok: boolean; n: number }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? "bg-brand/10 text-brand" : "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
      }`}
    >
      {ok ? "Ready" : `${n} problem${n === 1 ? "" : "s"}`}
    </span>
  );
}
