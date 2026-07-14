"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { BASE_MODEL, type ModelVariant } from "@/lib/sneaker-models";

useGLTF.preload(BASE_MODEL);

/**
 * Applies a KHR_materials_variants selection to a cloned scene. The base model
 * ships three artist-made PBR variants (midnight/beach/street); switching gives
 * each colorway a genuinely different, professionally-designed look.
 */
function useVariant(
  scene: THREE.Object3D,
  gltf: any,
  variant: ModelVariant
) {
  useEffect(() => {
    const parser = gltf?.parser;
    const variantsExt = gltf?.userData?.gltfExtensions?.["KHR_materials_variants"];
    if (!parser || !variantsExt) return;

    const variantIndex = variantsExt.variants.findIndex(
      (v: any) => v.name === variant
    );
    if (variantIndex < 0) return;

    let cancelled = false;
    scene.traverse((object: any) => {
      if (!object.isMesh || !object.userData?.gltfExtensions) return;
      const meshVariantDef =
        object.userData.gltfExtensions["KHR_materials_variants"];
      if (!meshVariantDef) return;

      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
      }

      const mapping = meshVariantDef.mappings.find((m: any) =>
        m.variants.includes(variantIndex)
      );

      if (mapping) {
        parser
          .getDependency("material", mapping.material)
          .then((material: THREE.Material) => {
            if (cancelled) return;
            object.material = material;
            parser.assignFinalMaterial(object);
          })
          .catch(() => {});
      } else {
        object.material = object.userData.originalMaterial;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [scene, gltf, variant]);
}

function Shoe({ variant }: { variant: ModelVariant }) {
  const gltf = useGLTF(BASE_MODEL) as any;
  // Clone so multiple viewers / variants never fight over the cached scene.
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  useVariant(scene, gltf, variant);

  // Center + scale the ~0.3m shoe to fill the frame.
  const group = useRef<THREE.Group>(null);
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  return (
    <group ref={group} scale={2.6} rotation={[0, -Math.PI / 4, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 10,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        Loading 3D…
      </div>
    </Html>
  );
}

function Rig({ autoRotate }: { autoRotate: boolean }) {
  // Nudge the camera to a hero three-quarter angle on mount.
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.3, 0.18, 0.42);
  }, [camera]);
  return null;
}

export interface SneakerViewerProps {
  variant?: ModelVariant;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
}

export default function SneakerViewer({
  variant = "midnight",
  autoRotate = true,
  interactive = true,
  className,
}: SneakerViewerProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: [0.3, 0.18, 0.42], fov: 35 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
    >
      <Rig autoRotate={autoRotate} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={2.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#7c3aed" />
      <pointLight position={[0, -2, 3]} intensity={1.1} color="#2563eb" />

      <Suspense fallback={<Loader />}>
        <Shoe variant={variant} />
        <ContactShadows
          position={[0, -0.28, 0]}
          opacity={0.5}
          scale={3}
          blur={2.4}
          far={1.2}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={interactive}
        enableRotate={interactive}
        autoRotate={autoRotate && !reduced}
        autoRotateSpeed={1.1}
        minDistance={0.32}
        maxDistance={0.9}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
