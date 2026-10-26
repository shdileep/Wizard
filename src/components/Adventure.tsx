import { useEffect, useMemo, useState } from "react";
import castle from "@/assets/castle.jpg";
import corridor from "@/assets/corridor.jpg";
import chamber from "@/assets/chamber.jpg";
import hub from "@/assets/hub.jpg";
import dragon from "@/assets/dragon.jpg";
import observatory from "@/assets/observatory.jpg";
import broom from "@/assets/broom.png";
import { wind, impact, chime, rumble } from "./sound";
import { rooms, projects, skills, experience, education, certifications, achievements, contact, type Room } from "./portfolio-data";
import { Dragon3DExperience } from "./dragon-scene/Dragon3DExperience";

type Stage = "intro" | "launch" | "flight" | "fall" | "land" | "corridor" | "wall" | "chamber" | "hub" | "room";

const Bg = ({ src, className = "", style }: { src: string; className?: string; style?: React.CSSProperties }) => (
  <img src={src} alt="" className={`absolute inset-0 h-full w-full object-cover ${className}`} style={style} />
);

function Particles({ count = 40, color = "var(--color-primary)" }: { count?: number; color?: string }) {
  const ps = useMemo(
    () => Array.from({ length: count }, () => ({ l: Math.random() * 100, d: 6 + Math.random() * 10, delay: Math.random() * 10, s: 1 + Math.random() * 3 })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ps.map((p, i) => (
        <span key={i} className="absolute bottom-0 rounded-full" style={{ left: `${p.l}%`, width: p.s, height: p.s, background: color, boxShadow: `0 0 8px ${color}`, animation: `drift ${p.d}s linear ${p.delay}s infinite` }} />
      ))}
    </div>
  );
}

function Clouds({ n = 14, dur = 2 }: { n?: number; dur?: number }) {
  const cs = useMemo(() => Array.from({ length: n }, () => ({ a: Math.random() * Math.PI * 2, delay: Math.random() * dur * 2 })), [n, dur]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {cs.map((c, i) => (
        <span key={i} className="absolute left-1/2 top-1/2 h-64 w-96 rounded-full" style={{ background: "radial-gradient(ellipse, oklch(0.75 0.01 250 / 55%), transparent 70%)", ["--dx" as string]: `${Math.cos(c.a) * 120 - 50}vw`, ["--dy" as string]: `${Math.sin(c.a) * 120 - 50}vh`, animation: `cloudRush ${dur}s ease-in ${c.delay}s infinite` }} />
      ))}
    </div>
  );
}

const Caption = ({ children, k }: { children: React.ReactNode; k?: string | number }) => (
  <p key={k} className="anim-rise px-6 font-display text-center text-sm tracking-[0.3em] text-primary glow-text uppercase md:text-base">{children}</p>
);

const corridorEvents = [
  "A candle sparks to life beside you…",
  "Somewhere behind, a door slams shut.",
  "The portrait's eyes follow you.",
  "A shadow slides across the corridor.",
  "Symbols glow on the far wall. Something is guiding you.",
];

export function Adventure() {
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("stage") as Stage;
      if (param && ["intro", "launch", "flight", "fall", "land", "corridor", "wall", "chamber", "hub", "room"].includes(param)) {
        return param;
      }
    }
    return "intro";
  });
  const [step, setStep] = useState(0);
  const [wallOpen, setWallOpen] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(3);
  const [hoveredRoomIndex, setHoveredRoomIndex] = useState<number | null>(null);
  const [enteringRoom, setEnteringRoom] = useState<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(() => {
    if (typeof window !== "undefined") {
      const roomParam = new URLSearchParams(window.location.search).get("room");
      if (roomParam) {
        return rooms.find((r) => r.id === roomParam) ?? null;
      }
    }
    return null;
  });

  useEffect(() => {
    const timers: Record<string, [Stage, number]> = { launch: ["flight", 1500], flight: ["fall", 7000], fall: ["land", 2600], land: ["corridor", 3200] };
    const t = timers[stage];
    if (!t) return;
    if (stage === "fall") rumble(2.6);
    if (stage === "land") impact();
    const id = setTimeout(() => setStage(t[0]), t[1]);
    return () => clearTimeout(id);
  }, [stage]);

  const enterRoom = (r: Room) => {
    if (enteringRoom) return;
    setEnteringRoom(r);
    rumble(2.5);
    impact();
    chime(700);
    setTimeout(() => {
      setRoom(r);
      setStage("room");
      setEnteringRoom(null);
    }, 1400);
  };

  useEffect(() => {
    if (stage !== "hub" || enteringRoom) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedRoomIndex((prev) => {
          const next = (prev - 1 + rooms.length) % rooms.length;
          chime(450 + next * 35);
          return next;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedRoomIndex((prev) => {
          const next = (prev + 1) % rooms.length;
          chime(450 + next * 35);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        enterRoom(rooms[selectedRoomIndex]!);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, selectedRoomIndex, enteringRoom]);

  const tapBroom = () => {
    wind(10);
    chime(520);
    setStage("launch");
  };

  const walk = () => {
    if (step < corridorEvents.length - 1) {
      setStep(step + 1);
      chime(300 + step * 60);
    } else setStage("wall");
  };

  const openWall = () => {
    setWallOpen(true);
    rumble(3);
    setTimeout(() => setStage("chamber"), 3200);
  };

  const activeRoom = rooms[selectedRoomIndex]!;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background select-none">
      {/* INTRO + LAUNCH */}
      {(stage === "intro" || stage === "launch") && (
        <section className="absolute inset-0 animate-in fade-in duration-[3000ms]">
          <Bg src={castle} className="anim-pan opacity-80" />
          <div className="absolute inset-0 vignette" />
          <Particles count={30} />
          <div className="absolute inset-x-0 top-[12%] px-6 text-center">
            <h1 className="anim-rise font-display text-3xl tracking-[0.25em] text-foreground glow-text md:text-6xl">The Castle Awaits</h1>
            <p className="anim-rise mt-3 text-lg italic text-muted-foreground" style={{ animationDelay: ".6s" }}>A portfolio by Dileep Sai Galla</p>
          </div>
          <button onClick={tapBroom} disabled={stage !== "intro"} aria-label="Tap the broomstick" className="absolute left-1/2 top-[58%] w-[85vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <img src={broom} alt="Flying broomstick" className={`w-full drop-shadow-[0_0_30px_oklch(0.8_0.13_80/50%)] ${stage === "launch" ? "anim-launch" : "anim-bob"}`} />
          </button>
          {stage === "intro" && (
            <div className="absolute inset-x-0 bottom-[12%] anim-flicker">
              <Caption>Tap the broomstick to begin your journey</Caption>
            </div>
          )}
          {stage === "launch" && <Particles count={80} color="oklch(0.85 0.15 85)" />}
        </section>
      )}

      {/* FLIGHT + FALL */}
      {(stage === "flight" || stage === "fall") && (
        <section className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <Bg src={castle} className={stage === "flight" ? "anim-fly" : "anim-fall"} style={{ transformOrigin: "40% 45%" }} />
          </div>
          <Clouds n={stage === "fall" ? 24 : 14} dur={stage === "fall" ? 0.9 : 2} />
          <div className="absolute inset-0 vignette" />
          {stage === "flight" && (
            <img src={broom} alt="" className="absolute -bottom-10 left-1/2 w-[160vw] max-w-none -translate-x-1/2 rotate-[80deg] opacity-90 md:w-[70vw] md:rotate-[75deg]" style={{ animation: "bob 1.2s ease-in-out infinite" }} />
          )}
          <div className="absolute inset-x-0 top-[15%]">
            {stage === "flight" ? <Caption k="f">Through the storm, toward the towers…</Caption> : <Caption k="x">The broom loses control!</Caption>}
          </div>
        </section>
      )}

      {/* LANDING */}
      {stage === "land" && (
        <section className="absolute inset-0 anim-shake">
          <Bg src={corridor} className="anim-wake" />
          <div className="absolute inset-0 vignette" />
          <div className="absolute inset-0 bg-background/40 animate-out fade-out duration-[2500ms] fill-mode-forwards" />
          <Particles count={60} color="oklch(0.7 0.02 80)" />
          <div className="absolute inset-x-0 bottom-[18%]"><Caption>You wake on cold stone…</Caption></div>
        </section>
      )}

      {/* CORRIDOR WALK */}
      {stage === "corridor" && (
        <section className="absolute inset-0 cursor-pointer" onClick={walk}>
          <Bg src={corridor} className="transition-transform duration-[1800ms] ease-out" style={{ transform: `scale(${1 + step * 0.35}) translateY(${step * 1.5}%)` }} />
          <div className="absolute inset-0 vignette" />
          <div className="absolute inset-0 anim-flicker bg-ember/5" />
          {step === 3 && <div className="absolute inset-y-0 w-1/2 bg-background/70 blur-2xl anim-shadow" />}
          <Particles count={40} color="oklch(0.85 0.1 80)" />
          <div className="absolute inset-x-0 top-[14%] px-6"><Caption k={step}>{corridorEvents[step]}</Caption></div>
          <p className="absolute inset-x-0 bottom-10 text-center italic text-muted-foreground anim-flicker">Tap to walk deeper</p>
        </section>
      )}

      {/* HIDDEN WALL */}
      {stage === "wall" && (
        <section className={`absolute inset-0 ${wallOpen ? "anim-shake" : ""}`}>
          <Bg src={chamber} className={wallOpen ? "anim-reveal" : "brightness-0"} />
          {(["L", "R"] as const).map((side) => (
            <div key={side} className={`absolute inset-y-0 w-1/2 ${side === "L" ? "left-0" : "right-0"}`} style={{ background: "repeating-linear-gradient(0deg, oklch(0.22 0.01 60) 0 58px, oklch(0.14 0.01 60) 58px 62px), repeating-linear-gradient(90deg, transparent 0 118px, oklch(0.12 0.01 60) 118px 122px)", animation: wallOpen ? `${side === "L" ? "splitL" : "splitR"} 3s ease-in-out .3s forwards` : undefined }}>
              <div className={`absolute top-1/2 -translate-y-1/2 font-display text-5xl text-venom anim-flicker ${side === "L" ? "right-6" : "left-6"}`} style={{ textShadow: "0 0 20px var(--color-venom)" }}>
                {side === "L" ? "ᛟ ᛉ ᛞ" : "ᛞ ᛉ ᛟ"}
              </div>
            </div>
          ))}
          {!wallOpen && (
            <button onClick={openWall} className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-venom/60 text-5xl text-venom anim-flicker" style={{ boxShadow: "0 0 40px var(--color-venom)" }} aria-label="Touch the serpent seal">
              🐍
            </button>
          )}
          {!wallOpen && <div className="absolute inset-x-0 bottom-[16%]"><Caption>An ancient seal. Touch it.</Caption></div>}
        </section>
      )}

      {/* CHAMBER REVEAL */}
      {stage === "chamber" && (
        <section className="absolute inset-0">
          <Bg src={chamber} className="anim-reveal" />
          <div className="absolute inset-0 vignette" />
          <Particles count={50} color="var(--color-venom)" />
          <div className="absolute inset-x-0 top-[12%] px-6 text-center">
            <h2 className="anim-rise font-display text-3xl tracking-[0.25em] text-venom md:text-5xl" style={{ animationDelay: "2s", textShadow: "0 0 24px var(--color-venom)" }}>What is this place?</h2>
          </div>
          <div className="absolute inset-x-0 bottom-[12%] flex justify-center anim-rise" style={{ animationDelay: "4s" }}>
            <button className="rune-btn" onClick={() => { setStage("hub"); rumble(2); }}>Descend deeper</button>
          </div>
        </section>
      )}

      {/* HUB — THE REAL SEVEN DOORS */}
      {stage === "hub" && (
        <section className="absolute inset-0 flex items-center justify-center bg-background overflow-hidden">
          {/* Ambient background blur for wide displays */}
          <Bg src={hub} className="anim-reveal opacity-40 blur-lg scale-110 pointer-events-none" />
          <div className="absolute inset-0 bg-background/50 pointer-events-none" />

          {/* Top Center Active Portal Banner */}
          <div className={`absolute inset-x-0 top-[3%] pointer-events-none z-20 flex flex-col items-center transition-opacity duration-300 ${enteringRoom ? "opacity-0" : "opacity-100"}`}>
            <p className="font-display text-xs tracking-[0.35em] text-primary/70 uppercase">
              Choose Your Path
            </p>
            <div
              key={activeRoom.id}
              className="anim-rise mt-1.5 px-6 py-2 rounded-full bg-background/90 border backdrop-blur-md text-center shadow-2xl transition-all duration-500"
              style={{
                borderColor: activeRoom.hue,
                boxShadow: `0 0 30px color-mix(in oklch, ${activeRoom.hue} 50%, transparent)`,
              }}
            >
              <h2
                className="font-display text-sm md:text-lg tracking-[0.25em] font-bold uppercase"
                style={{ color: activeRoom.hue, textShadow: `0 0 16px ${activeRoom.hue}` }}
              >
                {activeRoom.title}
              </h2>
              <p className="text-[11px] md:text-xs italic text-muted-foreground tracking-wider">
                {activeRoom.realm}
              </p>
            </div>
          </div>

          {/* Main 3:2 scene frame with aligned interactive real doors & realistic opening */}
          <div
            className={`relative aspect-[1536/1024] w-full h-full max-w-[calc(100vh*(1536/1024))] max-h-[calc(100vw/(1536/1024))] shadow-2xl overflow-hidden transition-all duration-[1400ms] ${
              enteringRoom ? "ease-in scale-[4.2]" : "ease-out"
            }`}
            style={{
              transformOrigin: enteringRoom
                ? `${enteringRoom.bounds.left + enteringRoom.bounds.width / 2}% ${enteringRoom.bounds.top + enteringRoom.bounds.height / 2}%`
                : "50% 50%",
            }}
          >
            <img src={hub} alt="The Hall of Seven Doors" className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none anim-reveal" />
            <div className="absolute inset-0 vignette pointer-events-none" />
            <Particles count={35} color="var(--color-venom)" />

            {/* Real Doors Interactive Hotspots (Pure Artwork - No Extra Shapes/Glows) */}
            {rooms.map((r, i) => {
              const isSelected = i === selectedRoomIndex;
              const isOpening = enteringRoom?.id === r.id;

              return (
                <button
                  key={r.id}
                  disabled={Boolean(enteringRoom)}
                  onClick={() => {
                    if (isSelected) {
                      enterRoom(r);
                    } else {
                      setSelectedRoomIndex(i);
                      chime(450 + i * 35);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!enteringRoom) {
                      setHoveredRoomIndex(i);
                      chime(450 + i * 35);
                    }
                  }}
                  onMouseLeave={() => setHoveredRoomIndex(null)}
                  className="group absolute cursor-pointer focus:outline-none transition-all duration-300 border-none bg-transparent p-0"
                  style={{
                    left: `${r.bounds.left}%`,
                    top: `${r.bounds.top}%`,
                    width: `${r.bounds.width}%`,
                    height: `${r.bounds.height}%`,
                  }}
                  aria-label={`Enter ${r.title} - ${r.realm}`}
                >
                  {/* Realistic Door Opening Leaves and Light Eruption when Entering */}
                  {isOpening && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {/* Core Energy Eruption */}
                      <div
                        className="absolute inset-0 rounded-t-[45%] anim-portal-burst z-10"
                        style={{
                          background: `radial-gradient(ellipse at 50% 50%, #ffffff 0%, color-mix(in oklch, ${r.hue} 90%, white) 40%, ${r.hue} 70%, transparent 95%)`,
                          boxShadow: `0 0 100px 50px ${r.hue}`,
                          mixBlendMode: "screen",
                        }}
                      />

                      {/* Left Door Leaf swinging inward */}
                      <div
                        className="absolute inset-y-0 left-0 w-1/2 anim-door-left z-20 rounded-tl-[45%]"
                        style={{
                          background: `linear-gradient(to right, oklch(0.12 0.02 50 / 95%), color-mix(in oklch, ${r.hue} 30%, black))`,
                          boxShadow: `inset -2px 0 10px ${r.hue}`,
                        }}
                      />

                      {/* Right Door Leaf swinging inward */}
                      <div
                        className="absolute inset-y-0 right-0 w-1/2 anim-door-right z-20 rounded-tr-[45%]"
                        style={{
                          background: `linear-gradient(to left, oklch(0.12 0.02 50 / 95%), color-mix(in oklch, ${r.hue} 30%, black))`,
                          boxShadow: `inset 2px 0 10px ${r.hue}`,
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Flash Overlay on Portal Transition */}
          {enteringRoom && (
            <div
              className="absolute inset-0 pointer-events-none animate-in fade-in duration-1000 z-50"
              style={{
                background: `radial-gradient(circle at center, color-mix(in oklch, ${enteringRoom.hue} 50%, white), transparent 85%)`,
                mixBlendMode: "screen",
              }}
            />
          )}

          {/* Bottom Navigation Control Bar */}
          <div className={`absolute inset-x-0 bottom-[4%] flex items-center justify-center gap-3 md:gap-5 z-20 transition-opacity duration-300 ${enteringRoom ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <button
              className="rune-btn px-4 py-2 text-sm md:text-base cursor-pointer"
              onClick={() => {
                const next = (selectedRoomIndex - 1 + rooms.length) % rooms.length;
                setSelectedRoomIndex(next);
                chime(450 + next * 35);
              }}
              aria-label="Previous door"
            >
              ‹
            </button>
            <button
              className="rune-btn px-7 py-2.5 text-sm md:text-base font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                borderColor: activeRoom.hue,
                boxShadow: `0 0 25px color-mix(in oklch, ${activeRoom.hue} 50%, transparent)`,
              }}
              onClick={() => enterRoom(activeRoom)}
            >
              Enter {activeRoom.title}
            </button>
            <button
              className="rune-btn px-4 py-2 text-sm md:text-base cursor-pointer"
              onClick={() => {
                const next = (selectedRoomIndex + 1) % rooms.length;
                setSelectedRoomIndex(next);
                chime(450 + next * 35);
              }}
              aria-label="Next door"
            >
              ›
            </button>
          </div>
        </section>
      )}

      {stage === "room" && room && <RoomView room={room} onBack={() => { setStage("hub"); chime(400); }} />}
    </main>
  );
}

const roomBg: Record<string, { src: string; filter?: string }> = {
  projects: { src: dragon },
  experience: { src: chamber, filter: "hue-rotate(200deg) saturate(1.4) brightness(.8)" },
  skills: { src: hub, filter: "saturate(1.3)" },
  education: { src: corridor, filter: "sepia(.4) brightness(.9)" },
  certifications: { src: chamber, filter: "hue-rotate(40deg) brightness(.9)" },
  achievements: { src: hub, filter: "hue-rotate(80deg) brightness(.85)" },
  contact: { src: observatory },
};

function RoomView({ room, onBack }: { room: Room; onBack: () => void }) {
  if (room.id === "projects") {
    return <Dragon3DExperience onBack={onBack} />;
  }

  const [unlocked, setUnlocked] = useState(room.id !== "experience");
  const bg = roomBg[room.id]!;
  return (
    <section className="absolute inset-0 animate-in fade-in zoom-in-110 duration-1000">
      <Bg src={bg.src} className="anim-pan" style={{ filter: bg.filter }} />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 bg-background/30" />
      <Particles count={40} color={room.hue} />
      <div className="absolute inset-0 overflow-y-auto px-5 pb-28 pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="anim-rise text-sm italic text-muted-foreground">{room.realm}</p>
          <h2 className="anim-rise font-display text-3xl tracking-[0.2em] uppercase md:text-5xl" style={{ color: room.hue, textShadow: `0 0 24px ${room.hue}` }}>{room.title}</h2>
          <p className="anim-rise mt-3 text-lg text-foreground/90" style={{ animationDelay: ".4s" }}>{room.intro}</p>
        </div>

        {/* UNLOCKED / INTERACTIVE REAL DRAGON NEST */}
        {!unlocked && room.id === "projects" && (
          <div className="relative mx-auto mt-6 max-w-4xl text-center">
            <p className="anim-flicker text-sm md:text-base italic text-amber-200/90 drop-shadow">
              Approach the nest and claim the golden egg from under the dragon’s wing…
            </p>

            {/* Clickable Real Egg Hotspot over the Dragon's Nest in the background */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => { setUnlocked(true); chime(880); rumble(2); }}
                className="rune-btn cursor-pointer transition-all hover:scale-105"
                style={{
                  borderColor: "oklch(0.85 0.18 85)",
                  boxShadow: "0 0 30px oklch(0.8 0.16 80 / 50%)",
                  background: "oklch(0.12 0.02 50 / 80%)",
                }}
              >
                Claim the Golden Egg 🪺
              </button>
            </div>

            {/* Direct click hotspot on the real eggs at the bottom right */}
            <button
              onClick={() => { setUnlocked(true); chime(880); rumble(2); }}
              className="fixed bottom-[4%] right-[14%] h-[24vh] w-[30vw] max-w-[420px] cursor-pointer rounded-full bg-transparent focus:outline-none"
              aria-label="Claim the golden eggs from the dragon's nest"
              title="Click the dragon's nest to claim the golden egg"
            />
          </div>
        )}
        {!unlocked && room.id === "experience" && (
          <div className="mt-[22vh] flex justify-center">
            <button className="rune-btn" onClick={() => { setUnlocked(true); impact(); }}>Slip past the guardian ⚷</button>
          </div>
        )}

        {unlocked && <div className="mx-auto mt-10 max-w-4xl"><RoomContent id={room.id} hue={room.hue} /></div>}
      </div>
      <button className="rune-btn absolute bottom-6 left-1/2 -translate-x-1/2" onClick={onBack}>← Return to the doors</button>
    </section>
  );
}

function RoomContent({ id, hue }: { id: string; hue: string }) {
  const card = "anim-rise border p-5 backdrop-blur-md";
  const cardStyle = (i: number) => ({ borderColor: hue, background: "oklch(0.1 0.01 60 / 65%)", boxShadow: `0 0 24px color-mix(in oklch, ${hue} 40%, transparent)`, animationDelay: `${i * 0.15}s` });
  switch (id) {
    case "projects":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p, i) => (
            <div key={p.name} className={card} style={cardStyle(i)}>
              <h3 className="font-display text-xl tracking-widest text-primary">{p.name}</h3>
              <p className="mt-1 text-foreground/80">{p.desc}</p>
            </div>
          ))}
        </div>
      );
    case "experience":
      return (
        <div className="space-y-4">
          {experience.map((e, i) => (
            <div key={i} className={`${card} parchment-card`} style={{ animationDelay: `${i * 0.2}s` }}>
              <h3 className="font-display text-lg">{e.role} · {e.org}</h3>
              <p className="text-sm italic">{e.period}</p>
              <p className="mt-2">{e.note}</p>
            </div>
          ))}
        </div>
      );
    case "skills":
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((s, i) => (
            <button key={s} onMouseEnter={() => chime(400 + i * 30)} onClick={() => chime(400 + i * 30)} className="anim-rise rounded-full border px-5 py-3 font-display text-sm tracking-widest text-foreground transition-all duration-300 hover:-translate-y-2 hover:scale-110" style={{ ...cardStyle(i), animationDelay: `${i * 0.06}s` }}>
              {s}
            </button>
          ))}
        </div>
      );
    case "education":
      return (
        <div className="parchment-card anim-rise mx-auto max-w-xl p-8 text-center">
          {education.map((e, i) => (
            <div key={i}>
              <h3 className="font-display text-2xl">{e.degree}</h3>
              <p className="mt-1 text-lg">{e.school}</p>
              <p className="italic">{e.period}</p>
            </div>
          ))}
        </div>
      );
    case "certifications":
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {certifications.map((c, i) => (
            <div key={c} className={`${card} text-center transition-transform hover:scale-105`} style={cardStyle(i)}>
              <div className="text-3xl" style={{ color: hue }}>✧</div>
              <p className="mt-2 font-display tracking-wider">{c}</p>
            </div>
          ))}
        </div>
      );
    case "achievements":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((a, i) => (
            <div key={a} className={card} style={cardStyle(i)}>
              <span className="text-2xl" style={{ color: hue }}>♛</span>
              <p className="mt-1 font-display tracking-wider">{a}</p>
            </div>
          ))}
        </div>
      );
    case "contact":
      return (
        <div className="parchment-card mx-auto max-w-xl p-8 text-center">
          <h3 className="anim-write font-display text-2xl tracking-[0.25em] md:text-3xl">{contact.name}</h3>
          <div className="mt-6 grid gap-3 anim-rise" style={{ animationDelay: "3s" }}>
            <a className="border border-ink/40 py-2 font-display tracking-widest hover:bg-ink/10" href={`mailto:${contact.email}`}>Email</a>
            <a className="border border-ink/40 py-2 font-display tracking-widest hover:bg-ink/10" href={`tel:${contact.phone.replace(/\s/g, "")}`}>Phone</a>
            <a className="border border-ink/40 py-2 font-display tracking-widest hover:bg-ink/10" href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="border border-ink/40 py-2 font-display tracking-widest hover:bg-ink/10" href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      );
  }
  return null;
}
