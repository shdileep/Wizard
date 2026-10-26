import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Dragon } from "./Dragon";
import { LandingContactLight, LandingShelf } from "./Landing";
import { HOVER_START, dragonPoseAt, dragonPositionAt, scrollState } from "./motion";
import { Terrain } from "./Terrain";
import { DragonNestEggs, type EggData } from "./DragonEggs";

// 3D Fire Breath Particle Stream from Dragon
function DragonFireStream({ curve, active }: { curve: THREE.CatmullRomCurve3; active: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    const t = scrollState.progress;
    const currentDragonPos = dragonPoseAt(curve, t).pos;
    const mouthPos = currentDragonPos.clone().add(new THREE.Vector3(0, 2.5, 1.2));
    groupRef.current.position.copy(mouthPos);

    if (lightRef.current) {
      lightRef.current.intensity = 150 + Math.sin(state.clock.elapsedTime * 25) * 70;
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} color="#ff4500" distance={35} decay={1.5} />
      <Sparkles
        count={280}
        scale={[6, 4, 16]}
        size={6.5}
        speed={1.5}
        color="#ff3700"
        opacity={0.95}
        position={[0, -0.6, 5]}
      />
      <Sparkles
        count={180}
        scale={[4, 3, 12]}
        size={4.5}
        speed={1.8}
        color="#ffd700"
        opacity={0.85}
        position={[0, -0.3, 4]}
      />
    </group>
  );
}

// 3D Wizard Wand Spell Beam Attack
function WizardSpellBeam({ curve, active }: { curve: THREE.CatmullRomCurve3; active: boolean }) {
  const hitLightRef = useRef<THREE.PointLight>(null!);
  const wandLightRef = useRef<THREE.PointLight>(null!);
  const sparkGroupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!active) return;
    const t = scrollState.progress;
    const currentDragonPos = dragonPoseAt(curve, t).pos;
    const targetPos = currentDragonPos.clone().add(new THREE.Vector3(0, 2.2, 0));
    const camPos = curve.getPointAt(HOVER_START);
    const wandOrigin = camPos.clone().add(new THREE.Vector3(1.2, -0.8, -2.5));

    if (hitLightRef.current) {
      hitLightRef.current.position.copy(targetPos);
      hitLightRef.current.intensity = 180 + Math.sin(state.clock.elapsedTime * 35) * 90;
    }
    if (wandLightRef.current) {
      wandLightRef.current.position.copy(wandOrigin);
    }
    if (sparkGroupRef.current) {
      sparkGroupRef.current.position.copy(wandOrigin.clone().lerp(targetPos, 0.5));
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Spell Core Flash at Impact */}
      <pointLight ref={hitLightRef} color="#00ffff" distance={40} decay={1.5} />
      {/* Wand Tip Glow */}
      <pointLight ref={wandLightRef} color="#80e5ff" intensity={90} distance={15} />

      {/* Magical Electric Arc Sparkles along beam */}
      <group ref={sparkGroupRef}>
        <Sparkles
          count={340}
          scale={[3, 3, 20]}
          size={5.5}
          speed={2.5}
          color="#00e5ff"
          opacity={0.95}
        />
        <Sparkles
          count={220}
          scale={[2, 2, 18]}
          size={4}
          speed={3.2}
          color="#ffffff"
          opacity={0.9}
        />
      </group>
    </group>
  );
}

export function SceneContent({
  onReady,
  onSelectEgg = () => {},
  onEggProximity = () => {},
  dragonDefeated = false,
  selectedEggId = null,
  fireActive = false,
  spellBeamActive = false,
}: {
  onReady: () => void;
  onSelectEgg?: (egg: EggData) => void;
  onEggProximity?: () => void;
  dragonDefeated?: boolean;
  selectedEggId?: number | null;
  fireActive?: boolean;
  spellBeamActive?: boolean;
}) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 8, 100),
        new THREE.Vector3(-2, 7, 70),
        new THREE.Vector3(2, 6, 40),
        new THREE.Vector3(0, 5, 15),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 4, -8),
      ],
      false,
      "catmullrom",
      0.5,
    );
  }, []);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // Position the 4 eggs right on the landing ground directly in front of the dragon
  const shelfNestPos = useMemo(() => {
    const p = dragonPositionAt(curve, HOVER_START);
    return [p.x, -2.15, p.z - 4.5] as [number, number, number];
  }, [curve]);

  return (
    <>
      <fog attach="fog" args={["#121820", 20, 160]} />
      <ambientLight intensity={0.9} color="#71849f" />
      <directionalLight
        position={[-45, 65, 35]}
        intensity={1.35}
        color="#d4deee"
      />
      <hemisphereLight args={["#607795", "#18140f", 1.15]} />
      <directionalLight
        position={[35, 8, 75]}
        intensity={0.4}
        color="#ff9944"
      />
      {/* Focused Golden Illumination on Dragon & Egg Nest */}
      <pointLight
        position={[-0.8, -0.5, -4.5]}
        intensity={45}
        color="#ffd899"
        distance={18}
        decay={1.8}
      />
      <pointLight
        position={[0.8, 1.5, -2.5]}
        intensity={35}
        color="#ffffff"
        distance={15}
        decay={2}
      />

      <Terrain />
      <LandingShelf curve={curve} t={0} scale={0.85} />
      <LandingShelf curve={curve} t={HOVER_START} />
      <LandingContactLight curve={curve} />
      <Dragon curve={curve} />
      <CameraRig
        curve={curve}
        dragonDefeated={dragonDefeated}
        selectedEggId={selectedEggId}
        nestPos={shelfNestPos}
      />

      {/* 4 Scaled Dragon Eggs in the Nest */}
      <group position={shelfNestPos}>
        <DragonNestEggs
          onSelectEgg={onSelectEgg}
          onEggProximity={onEggProximity}
          dragonDefeated={dragonDefeated}
          selectedEggId={selectedEggId}
        />
      </group>

      {/* Dynamic Combat FX */}
      <DragonFireStream curve={curve} active={fireActive} />
      <WizardSpellBeam curve={curve} active={spellBeamActive} />

      {/* Atmospheric Fire Embers */}
      <Sparkles
        count={220}
        scale={[80, 40, 80]}
        size={2.5}
        speed={0.4}
        color="#ff6a2a"
        opacity={0.6}
      />
    </>
  );
}
