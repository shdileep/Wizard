import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  DRAGON_MODEL_PATH,
  DRAGON_TARGET_SIZE,
  HOVER_START,
  TAKEOFF_END,
  dragonPoseAt,
  scrollState,
} from "./motion";

export function Dragon({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const group = useRef<THREE.Group>(null!);
  const modelScale = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const lastProgress = useRef(scrollState.progress);
  const scrollDirection = useRef<1 | -1>(1);

  const gltf = useGLTF(DRAGON_MODEL_PATH, true, true);
  const scene = useMemo(
    () => cloneSkeleton(gltf.scene) as THREE.Group,
    [gltf.scene],
  );
  const { actions, names } = useAnimations(gltf.animations, inner);

  const dragonBones = useMemo(() => {
    return {
      neck0: scene.getObjectByName("MountainDragon__Neck_06_13"),
      neck1: scene.getObjectByName("MountainDragon__Neck1_07_14"),
      neck2: scene.getObjectByName("MountainDragon__Neck2_08_15"),
      neck3: scene.getObjectByName("MountainDragon__Neck3_09_16"),
      head: scene.getObjectByName("MountainDragon__Head_010_17"),
    };
  }, [scene]);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const currentLook = useRef({ yaw: 0, pitch: 0, roll: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTarget.current.x = THREE.MathUtils.clamp(x, -1, 1);
      mouseTarget.current.y = THREE.MathUtils.clamp(y, -1, 1);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.frustumCulled = false;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((material: THREE.Material) => material.clone())
          : (mesh.material as THREE.Material).clone();

        const materials: THREE.Material[] = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material as THREE.Material];

        materials.forEach((material: THREE.Material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            material.emissive.set("#241b13");
            material.emissiveIntensity = Math.max(
              material.emissiveIntensity,
              0.08,
            );
            material.needsUpdate = true;
          }
        });
      }
    });

    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    inner.current.position.copy(center).multiplyScalar(-1);
    modelScale.current.scale.setScalar(DRAGON_TARGET_SIZE / maxDim);
  }, [scene]);

  useEffect(() => {
    const clip = names[0];
    if (!clip) return;
    const action = actions[clip];
    action?.reset().play();
    return () => {
      action?.stop();
    };
  }, [actions, names]);

  useFrame((state, delta) => {
    const t = scrollState.progress;
    const deltaProgress = t - lastProgress.current;
    if (Math.abs(deltaProgress) > 0.0005) {
      scrollDirection.current = deltaProgress > 0 ? 1 : -1;
      lastProgress.current = t;
    }
    const takeoffT = THREE.MathUtils.smoothstep(t, 0.03, TAKEOFF_END);
    const landingT = THREE.MathUtils.smoothstep(
      t,
      HOVER_START - 0.14,
      HOVER_START,
    );
    const airT = takeoffT * (1 - landingT);
    const bob = Math.sin(state.clock.elapsedTime * 1.4) * 0.6 * airT;
    const { pos, quat, turnT } = dragonPoseAt(
      curve,
      t,
      scrollDirection.current,
    );

    // Compute cursor tracking
    const targetX = mouseTarget.current.x || state.pointer.x || 0;
    const targetY = mouseTarget.current.y || state.pointer.y || 0;

    const targetYaw = targetX * 0.70;
    const targetPitch = -targetY * 0.45;
    const targetRoll = -targetX * 0.12;

    const dt = Math.min(Math.max(typeof delta === "number" && !isNaN(delta) ? delta : 0.016, 0.001), 0.1);
    const lerpFactor = 1 - Math.exp(-6 * dt);

    const safePrevYaw = isNaN(currentLook.current.yaw) ? 0 : currentLook.current.yaw;
    const safePrevPitch = isNaN(currentLook.current.pitch) ? 0 : currentLook.current.pitch;
    const safePrevRoll = isNaN(currentLook.current.roll) ? 0 : currentLook.current.roll;

    currentLook.current.yaw = THREE.MathUtils.lerp(safePrevYaw, targetYaw, lerpFactor);
    currentLook.current.pitch = THREE.MathUtils.lerp(safePrevPitch, targetPitch, lerpFactor);
    currentLook.current.roll = THREE.MathUtils.lerp(safePrevRoll, targetRoll, lerpFactor);

    const yaw = isNaN(currentLook.current.yaw) ? 0 : currentLook.current.yaw;
    const pitch = isNaN(currentLook.current.pitch) ? 0 : currentLook.current.pitch;
    const roll = isNaN(currentLook.current.roll) ? 0 : currentLook.current.roll;

    // Articulate neck segments and head to track cursor
    const { neck0, neck1, neck2, neck3, head } = dragonBones;
    if (neck0) {
      neck0.rotateY(yaw * 0.10);
      neck0.rotateZ(pitch * 0.10);
      neck0.rotateX(roll * 0.05);
    }
    if (neck1) {
      neck1.rotateY(yaw * 0.15);
      neck1.rotateZ(pitch * 0.15);
      neck1.rotateX(roll * 0.08);
    }
    if (neck2) {
      neck2.rotateY(yaw * 0.20);
      neck2.rotateZ(pitch * 0.20);
      neck2.rotateX(roll * 0.10);
    }
    if (neck3) {
      neck3.rotateY(yaw * 0.25);
      neck3.rotateZ(pitch * 0.25);
      neck3.rotateX(roll * 0.12);
    }
    if (head) {
      head.rotateY(yaw * 0.30);
      head.rotateZ(pitch * 0.30);
      head.rotateX(roll * 0.15);
    }

    group.current.position.copy(pos).setY(pos.y + bob);
    if (t > HOVER_START - 0.04) {
      group.current.quaternion.slerp(quat, 0.08);
    } else {
      group.current.quaternion.copy(quat);
    }
    group.current.rotation.z +=
      Math.sin(state.clock.elapsedTime * 1.4) * 0.08 * airT * (1 - turnT);
  });

  return (
    <group ref={group}>
      <group ref={modelScale}>
        <group ref={inner}>
          <primitive object={scene} />
        </group>
      </group>
      <pointLight
        position={[4, 8, 10]}
        intensity={115}
        color="#d8c2a2"
        distance={34}
        decay={2}
      />
    </group>
  );
}

useGLTF.preload(DRAGON_MODEL_PATH);
