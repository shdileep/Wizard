import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { EGG_PROJECTS } from "./DragonEggs";
import { HOVER_START, dragonPoseAt, dragonPositionAt, scrollState } from "./motion";

export function CameraRig({
  curve,
  dragonDefeated = false,
  selectedEggId = null,
  nestPos,
}: {
  curve: THREE.CatmullRomCurve3;
  dragonDefeated?: boolean;
  selectedEggId?: number | null;
  nestPos?: [number, number, number];
}) {
  const currentPos = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const initRef = useRef(false);

  useFrame(({ camera }) => {
    const baseCamPos = curve.getPointAt(HOVER_START);
    const dragonPos = dragonPoseAt(curve, scrollState.progress).pos;
    const nestVec = nestPos
      ? new THREE.Vector3(...nestPos)
      : dragonPositionAt(curve, HOVER_START).add(new THREE.Vector3(0.3, 1.25, 4.8));

    if (selectedEggId != null) {
      // Smoothly zoom in on the specific clicked dragon egg
      const egg = EGG_PROJECTS.find((e) => e.id === selectedEggId);
      if (egg) {
        const eggWorldPos = nestVec
          .clone()
          .add(new THREE.Vector3(...egg.position))
          .add(new THREE.Vector3(0, -0.6, 0));
        targetLook.current.copy(eggWorldPos);
        targetPos.current.copy(eggWorldPos).add(new THREE.Vector3(0, 0.4, 2.0));
      }
    } else if (dragonDefeated) {
      // Dragon has retreated: Focus gaze onto the 4 dragon eggs on the ledge
      targetLook.current.copy(nestVec).add(new THREE.Vector3(0, -0.3, 0));
      targetPos.current.copy(baseCamPos).add(new THREE.Vector3(0, -0.25, 2.2));
    } else {
      // Guarding/fighting: Look at dragon & arena
      targetLook.current.copy(dragonPos).add(new THREE.Vector3(0, 0.8, 0));
      targetPos.current.copy(baseCamPos);
    }

    if (!initRef.current) {
      camera.position.copy(targetPos.current);
      camera.lookAt(targetLook.current);
      currentPos.current.copy(targetPos.current);
      currentLook.current.copy(targetLook.current);
      initRef.current = true;
      return;
    }

    currentPos.current.lerp(targetPos.current, 0.06);
    currentLook.current.lerp(targetLook.current, 0.06);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}
