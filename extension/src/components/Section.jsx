export default function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {" "}
          {title}{" "}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500"> {description} </p>
        )}{" "}
      </div>
      <div className="my-4 border-t border-zinc-800" />
      <div className="space-y-5"> {children} </div>{" "}
    </section>
  );
}
