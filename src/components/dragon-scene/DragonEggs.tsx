import { Html, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type EggData = {
  id: number;
  name: string;
  projectName: string;
  projectRole: string;
  desc: string;
  tech: string[];
  color: string;
  emissive: string;
  scaleColor: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const EGG_PROJECTS: EggData[] = [
  {
    id: 1,
    name: "Hungarian Horntail Golden Egg",
    projectName: "Zavran AI",
    projectRole: "Flagship AI Product Platform",
    desc: "Autonomous multi-agent orchestration platform delivering real-time intelligent workflow automation and deep reasoning pipelines.",
    tech: ["Python", "FastAPI", "LangChain", "Vector DB", "React"],
    color: "#ffd700",
    emissive: "#ffaa00",
    scaleColor: "#b8860b",
    position: [-1.8, 0.5, 0.1],
    rotation: [0.1, 0.4, -0.15],
  },
  {
    id: 2,
    name: "Obsidian Fire Dragon Egg",
    projectName: "Shubh AI Studio",
    projectRole: "Generative AI Creative Suite",
    desc: "Next-gen studio for generative media, style fine-tuning, automated prompt synthesis, and real-time multi-modal rendering.",
    tech: ["PyTorch", "Hugging Face", "Next.js", "Docker", "AWS"],
    color: "#ff3b30",
    emissive: "#ff2200",
    scaleColor: "#8b0000",
    position: [-0.65, 0.55, 0.8],
    rotation: [-0.1, -0.3, 0.1],
  },
  {
    id: 3,
    name: "Emerald Wyrm Scaled Egg",
    projectName: "Moxsend & MoxQuote",
    projectRole: "Smart Outreach & AI Quoting Engine",
    desc: "Intelligent B2B communication automation with context-aware price modeling, dynamic quote generation, and LLM verification.",
    tech: ["FastAPI", "LangGraph", "RAG", "PostgreSQL", "React"],
    color: "#00e676",
    emissive: "#00ff88",
    scaleColor: "#004d40",
    position: [0.65, 0.55, 0.8],
    rotation: [0.15, 0.6, 0.05],
  },
  {
    id: 4,
    name: "Arcane Copper Dragon Egg",
    projectName: "RenoCred / Taqdeer",
    projectRole: "AI Credit & Fintech Intelligence",
    desc: "High-throughput credit risk evaluation engine, automated document underwriting, and regulatory compliant financial analytics.",
    tech: ["Python", "SQL", "Machine Learning", "FastAPI", "AWS"],
    color: "#ff9100",
    emissive: "#ff6d00",
    scaleColor: "#d84315",
    position: [1.8, 0.5, 0.1],
    rotation: [-0.15, -0.5, -0.1],
  },
];

// Procedural Dragon Scale Texture Generator
function createScaleTexture(baseColorHex: string, scaleColorHex: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  const rows = 16;
  const cols = 16;
  const w = 512 / cols;
  const h = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const xOffset = (r % 2) * (w / 2);
    for (let c = -1; c <= cols; c++) {
      const cx = c * w + xOffset + w / 2;
      const cy = r * h + h / 2;

      // Scale petal / triangle
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.7);
      ctx.lineTo(cx + w * 0.6, cy + h * 0.4);
      ctx.lineTo(cx, cy + h * 0.8);
      ctx.lineTo(cx - w * 0.6, cy + h * 0.4);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.8);
      grad.addColorStop(0, scaleColorHex);
      grad.addColorStop(0.7, baseColorHex);
      grad.addColorStop(1, "#111111");

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 235, 150, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function SingleDragonEgg({
  egg,
  onSelect,
  onEggProximity,
  dragonDefeated,
  opened,
}: {
  egg: EggData;
  onSelect: (egg: EggData) => void;
  onEggProximity: () => void;
  dragonDefeated: boolean;
  opened: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const scaleTex = useMemo(
    () => createScaleTexture(egg.color, egg.scaleColor),
    [egg.color, egg.scaleColor]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const floatOffset = Math.sin(time * 2.2 + egg.id) * 0.03;
    meshRef.current.position.y = egg.position[1] + (hovered ? floatOffset + 0.14 : floatOffset);

    if (hovered || opened) {
      meshRef.current.rotation.y += 0.025;
    }
  });

  return (
    <group position={egg.position} rotation={egg.rotation}>
      {/* 3D Scaled Dragon Egg */}
      <mesh
        ref={meshRef}
        scale={[0.44, 0.64, 0.44]} // authentic dragon egg proportions
        onClick={(e) => {
          e.stopPropagation();
          if (!dragonDefeated) {
            onEggProximity();
          } else {
            onSelect(egg);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
          if (!dragonDefeated) {
            onEggProximity();
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[1, 36, 36]} />
        <meshStandardMaterial
          map={scaleTex}
          color={egg.color}
          roughness={0.25}
          metalness={0.8}
          emissive={egg.emissive}
          emissiveIntensity={hovered || opened ? 1.6 : 0.65}
          bumpMap={scaleTex}
          bumpScale={0.08}
        />
      </mesh>

      {/* Larger Raycast Hitbox for seamless click detection */}
      <mesh
        scale={[0.7, 0.95, 0.7]}
        position={[0, 0.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (!dragonDefeated) {
            onEggProximity();
          } else {
            onSelect(egg);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
          if (!dragonDefeated) {
            onEggProximity();
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        visible={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Egg Glow Light */}
      <pointLight
        color={egg.emissive}
        intensity={hovered || opened ? 45 : 18}
        distance={6}
        decay={2}
        position={[0, 0.4, 0.2]}
      />

      {/* Glowing Egg Spores */}
      <Sparkles
        count={hovered || opened ? 35 : 18}
        scale={[1.4, 1.8, 1.4]}
        size={3.5}
        speed={0.9}
        color={egg.emissive}
        opacity={0.85}
        position={[0, 0.5, 0]}
      />

      {/* 3D Floating Hover Tooltip (Only appears over the hovered 3D egg when dragon is defeated) */}
      {hovered && dragonDefeated && !opened && (
        <Html position={[0, 1.15, 0]} center distanceFactor={14}>
          <div
            className="pointer-events-none whitespace-nowrap rounded px-3 py-1.5 text-xs font-display tracking-widest uppercase shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-75 duration-200 border flex items-center gap-1.5"
            style={{
              background: "rgba(10, 12, 16, 0.95)",
              borderColor: egg.color,
              color: egg.color,
              boxShadow: `0 0 18px ${egg.emissive}`,
            }}
          >
            <span>🪺</span>
            <span>Claim {egg.projectName}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export function DragonNestEggs({
  onSelectEgg,
  onEggProximity,
  dragonDefeated,
  selectedEggId,
}: {
  onSelectEgg: (egg: EggData) => void;
  onEggProximity: () => void;
  dragonDefeated: boolean;
  selectedEggId: number | null;
}) {
  return (
    <group>
      {/* Stone Nest Ring with Golden Hot Embers */}
      <mesh position={[0, 0.05, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 2.5, 32]} />
        <meshStandardMaterial
          color="#332211"
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Nest Sparkles */}
      <Sparkles
        count={70}
        scale={[5, 1.5, 3.5]}
        size={3}
        speed={0.6}
        color="#ffaa00"
        opacity={0.85}
        position={[0, 0.3, 0.4]}
      />

      {/* 4 Golden & Scaly Eggs */}
      {EGG_PROJECTS.map((egg) => (
        <SingleDragonEgg
          key={egg.id}
          egg={egg}
          onSelect={onSelectEgg}
          onEggProximity={onEggProximity}
          dragonDefeated={dragonDefeated}
          opened={selectedEggId === egg.id}
        />
      ))}
    </group>
  );
}
