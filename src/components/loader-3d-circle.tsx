type Loader3DCircleProps = {
  message?: string;
};

export default function Loader3DCircle({ message = "Loading..." }: Loader3DCircleProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 perspective-[900px]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20 transform-3d">
          <span className="absolute inset-0 rounded-full border-2 border-emerald-500/75 transform-[rotateX(70deg)] animate-spin" />
          <span
            className="absolute inset-0 rounded-full border-2 border-cyan-400/70 transform-[rotateY(70deg)] animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
          />
          <span
            className="absolute inset-0 rounded-full border-2 border-primary/75 transform-[rotateX(70deg)_rotateY(35deg)] animate-spin"
            style={{ animationDuration: "0.95s" }}
          />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_24px_rgba(34,197,94,0.8)]" />
        </div>

        <p className="text-sm font-medium tracking-wide text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
