import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { SceneContent } from "./SceneContent";
import { scrollState, HOVER_START } from "./motion";
import { EGG_PROJECTS, type EggData } from "./DragonEggs";
import { chime, rumble, spellCast, dragonRoar, fireBreath, eggOpen } from "../sound";

type DragonState = "guarding" | "fire_warning" | "fighting" | "fed" | "retreated";

export function Dragon3DExperience({ onBack }: { onBack: () => void }) {
  const [ready, setReady] = useState(false);
  const [dragonState, setDragonState] = useState<DragonState>("guarding");
  const [fireActive, setFireActive] = useState(false);
  const [spellBeamActive, setSpellBeamActive] = useState(false);
  const [selectedEgg, setSelectedEgg] = useState<EggData | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string>(
    "The Hungarian Horntail fiercely guards her 4 dragon eggs. Defend yourself!"
  );
  const [screenShake, setScreenShake] = useState(false);
  const [fireFlash, setFireFlash] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize dragon right at the nest guarding the eggs
  useEffect(() => {
    scrollState.progress = HOVER_START;
  }, []);

  // Trigger fire defense when player tries to touch the eggs while guarded
  const handleEggProximity = () => {
    if (dragonState === "retreated" || dragonState === "fed") return;

    if (fireActive || spellBeamActive) return;

    setFireActive(true);
    setFireFlash(true);
    setScreenShake(true);
    dragonRoar();

    setBannerMessage("🔥 The dragon unleashes a torrent of fire to protect her clutch! Use Fight ⚔️ or Feed 🍖!");

    setTimeout(() => {
      setFireFlash(false);
      setScreenShake(false);
    }, 1200);

    setTimeout(() => {
      setFireActive(false);
    }, 2200);
  };

  // Fight Sequence: Wizard Wand Spell Attack vs Dragon Fire
  const handleFight = () => {
    if (dragonState === "fighting" || dragonState === "retreated") return;

    setDragonState("fighting");
    setSpellBeamActive(true);
    setFireActive(true);
    setScreenShake(true);

    spellCast();
    dragonRoar();
    setBannerMessage("⚡ You cast a powerful wand blast! The dragon counters with fire as the magical duel begins!");

    // Animate dragon being pushed back over 3.8s while fighting back
    const startProgress = HOVER_START;
    const targetProgress = 0.02; // dragon retreats far into the mountains
    const startTime = performance.now();
    const duration = 3800;

    const pushDragonBack = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out pushback
      const ease = 1 - Math.pow(1 - t, 2.5);
      const current = startProgress + (targetProgress - startProgress) * ease;
      scrollState.progress = current;

      if (t < 1) {
        requestAnimationFrame(pushDragonBack);
      } else {
        // Duel resolved
        setSpellBeamActive(false);
        setFireActive(false);
        setScreenShake(false);
        setDragonState("retreated");
        chime(880);
        setBannerMessage("✨ The dragon has retreated into the mountain storm! The 4 Dragon Eggs are now yours to inspect!");
      }
    };

    requestAnimationFrame(pushDragonBack);
  };

  // Feed Sequence: Toss roasted feast to distract dragon
  const handleFeed = () => {
    if (dragonState === "fighting" || dragonState === "retreated" || dragonState === "fed") return;

    setDragonState("fed");
    chime(520);
    rumble(2);
    setBannerMessage("🍖 You toss an enchanted roasted feast to the canyon ledge! The dragon flies over to feed!");

    const startProgress = HOVER_START;
    const targetProgress = 0.25; // flies to ledge
    const startTime = performance.now();
    const duration = 2400;

    const flyToFeast = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = t * (2 - t);
      const current = startProgress + (targetProgress - startProgress) * ease;
      scrollState.progress = current;

      if (t < 1) {
        requestAnimationFrame(flyToFeast);
      } else {
        setBannerMessage("✨ The dragon is distracted feeding! You can now claim the 4 Dragon Eggs!");
      }
    };

    requestAnimationFrame(flyToFeast);
  };

  // Select and crack open a dragon egg
  const handleSelectEgg = (egg: EggData) => {
    setSelectedEgg(egg);
    eggOpen();
    rumble(1.5);
  };

  const isDragonDefeated = dragonState === "retreated" || dragonState === "fed";

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden bg-[#121820] ${
        screenShake ? "anim-shake" : ""
      }`}
    >
      {/* 3D Real Dragon Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ fov: 55, near: 0.1, far: 500 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#121820"]} />
          <Suspense fallback={null}>
            <SceneContent
              onReady={() => setReady(true)}
              onSelectEgg={handleSelectEgg}
              onEggProximity={handleEggProximity}
              dragonDefeated={isDragonDefeated}
              selectedEggId={selectedEgg?.id ?? null}
              fireActive={fireActive}
              spellBeamActive={spellBeamActive}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Screen Fire Flash on Dragon Attack */}
      {fireFlash && (
        <div
          className="absolute inset-0 z-30 pointer-events-none animate-in fade-in duration-150"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255, 60, 0, 0.45) 0%, rgba(255, 140, 0, 0.25) 50%, transparent 80%)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none vignette" />

      {/* Loading Overlay */}
      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#121820] text-primary">
          <p className="font-display text-lg tracking-[0.3em] uppercase anim-flicker">
            Entering the Dragon Arena…
          </p>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded bg-primary/20">
            <div className="h-full w-full animate-pulse bg-primary" />
          </div>
        </div>
      )}

      {/* Top Header & Status Banner */}
      <div className="absolute inset-x-0 top-5 z-20 pointer-events-none text-center px-4">
        <p className="font-display text-xs tracking-[0.35em] text-primary/70 uppercase">
          The Dragon Arena
        </p>
        <h2
          className="font-display text-2xl md:text-4xl tracking-[0.2em] font-bold uppercase mt-1"
          style={{
            color: "oklch(0.75 0.2 55)",
            textShadow: "0 0 24px oklch(0.75 0.2 55)",
          }}
        >
          4 Dragon Eggs of Power
        </h2>
        <div className="mt-2 inline-block px-5 py-1.5 rounded-full bg-background/85 border border-primary/40 backdrop-blur-md shadow-xl">
          <p className="text-xs md:text-sm italic text-amber-200 drop-shadow">
            {bannerMessage}
          </p>
        </div>
      </div>

      {/* Top Right Action Bar: Fight & Feed Buttons */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-3">
        {!isDragonDefeated ? (
          <>
            <button
              onClick={handleFight}
              disabled={dragonState === "fighting"}
              className="rune-btn py-2 px-4 text-xs md:text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                borderColor: "#00e5ff",
                boxShadow: "0 0 24px rgba(0, 229, 255, 0.45)",
                background: "oklch(0.12 0.02 240 / 85%)",
                color: "#e0f7ff",
              }}
              title="Cast wizard wand power attack to drive the dragon away"
            >
              Fight ⚔️
            </button>
            <button
              onClick={handleFeed}
              disabled={dragonState === "fighting"}
              className="rune-btn py-2 px-4 text-xs md:text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                borderColor: "#ff9900",
                boxShadow: "0 0 24px rgba(255, 153, 0, 0.45)",
                background: "oklch(0.12 0.02 50 / 85%)",
                color: "#ffe8cc",
              }}
              title="Toss enchanted feast to lure dragon away"
            >
              Feed 🍖
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setDragonState("guarding");
              scrollState.progress = HOVER_START;
              setSelectedEgg(null);
              setBannerMessage("The Hungarian Horntail fiercely guards her 4 dragon eggs. Defend yourself!");
              chime(440);
            }}
            className="rune-btn py-1.5 px-3 text-xs cursor-pointer"
          >
            Reset Duel ⚔️
          </button>
        )}
      </div>


      {/* Egg Inspection Card Modal (Opens when an egg is clicked) */}
      {selectedEgg && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-background/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
          <div
            className="relative max-w-xl w-full rounded-lg p-6 md:p-8 text-center shadow-2xl border"
            style={{
              borderColor: selectedEgg.color,
              background: "oklch(0.1 0.01 60 / 94%)",
              boxShadow: `0 0 60px ${selectedEgg.emissive}, inset 0 0 35px color-mix(in oklch, ${selectedEgg.color} 35%, transparent)`,
            }}
          >
            <div className="text-4xl md:text-5xl mb-2 anim-flicker">✨ 🪺 ✨</div>
            <p className="text-xs uppercase tracking-[0.25em] font-display" style={{ color: selectedEgg.color }}>
              {selectedEgg.name}
            </p>
            <h3 className="font-display text-2xl md:text-4xl tracking-widest text-foreground font-bold mt-1">
              {selectedEgg.projectName}
            </h3>
            <p className="mt-1 text-sm italic text-amber-200 font-medium">
              {selectedEgg.projectRole}
            </p>

            <div className="mt-4 text-sm md:text-base text-foreground/90 leading-relaxed text-left bg-black/50 p-4 rounded border border-white/10 shadow-inner">
              <p>{selectedEgg.desc}</p>
            </div>

            {/* Tech Badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {selectedEgg.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 text-xs rounded-full border font-mono tracking-wider font-semibold"
                  style={{
                    borderColor: selectedEgg.color,
                    background: "rgba(0,0,0,0.6)",
                    color: selectedEgg.color,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setSelectedEgg(null)}
                className="rune-btn px-6 py-2 text-sm cursor-pointer hover:scale-105 transition-all"
                style={{ borderColor: selectedEgg.color, color: selectedEgg.color }}
              >
                Close Egg ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Wand Overlay when Casting Spell */}
      {spellBeamActive && (
        <div className="absolute bottom-4 right-10 z-30 pointer-events-none animate-in fade-in zoom-in-75 duration-300">
          <div
            className="h-44 w-4 -rotate-45 rounded-t-full shadow-2xl"
            style={{
              background: "linear-gradient(to top, #3e2723, #d7ccc8, #ffffff)",
              boxShadow: "0 0 40px #00e5ff, 0 0 80px #ffffff",
            }}
          />
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center pointer-events-auto">
        <button className="rune-btn cursor-pointer px-6 py-2 text-sm md:text-base" onClick={onBack}>
          ← Return to the doors
        </button>
      </div>
    </div>
  );
}
