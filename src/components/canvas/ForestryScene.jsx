import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, Text } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";

const ForestryMachine = ({ mulcherRef }) => {
  const headPivot = useRef();
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const teethRef = useRef();
  const toothTemp = useMemo(() => new THREE.Object3D(), []);
  const toothCount = 18;

  useEffect(() => {
    if (!teethRef.current) return;
    for (let i = 0; i < toothCount; i += 1) {
      const angle = (i / toothCount) * Math.PI * 2;
      const radius = 0.45;
      toothTemp.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
      toothTemp.rotation.set(Math.PI / 2, 0, angle);
      toothTemp.scale.set(0.07, 0.2, 0.22);
      toothTemp.updateMatrix();
      teethRef.current.setMatrixAt(i, toothTemp.matrix);
    }
    teethRef.current.instanceMatrix.needsUpdate = true;
  }, [toothCount, toothTemp]);

  useFrame((state, delta) => {
    if (headPivot.current) {
      headPivot.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.12;
    }

    if (mulcherRef.current) {
      mulcherRef.current.rotation.z += delta * 5.2;
      tempVec.set(1.6 + Math.sin(state.clock.elapsedTime * 0.4) * 0.4, 0, 0);
      mulcherRef.current.position.lerp(tempVec, 0.2);
    }
  });

  return (
    <group position={[0, -0.75, 0]}>
      {/* Tracks */}
      <mesh position={[0, 0, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.5, 0.6]} />
        <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.5, 0.6]} />
        <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[3.6, 1.2, 2]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Cab */}
      <mesh position={[-0.8, 1.7, 0]}> 
        <boxGeometry args={[1.6, 1.1, 1.6]} />
        <meshStandardMaterial color="#1a1e26" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Boom */}
      <group position={[1.4, 1.2, 0]} ref={headPivot}>
        <mesh position={[0.8, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.35, 0.35]} />
          <meshStandardMaterial color="#141414" metalness={0.7} roughness={0.25} />
        </mesh>
        <group ref={mulcherRef} position={[1.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.4, 1.4, 24, 1, true]} />
            <meshStandardMaterial color="#c26c1b" emissive="#4c1b00" emissiveIntensity={0.45} roughness={0.35} metalness={0.4} />
          </mesh>
          <instancedMesh ref={teethRef} args={[null, null, toothCount]} castShadow>
            <boxGeometry args={[0.25, 0.05, 0.08]} />
            <meshStandardMaterial color="#f4b15c" emissive="#612800" emissiveIntensity={0.3} />
          </instancedMesh>
        </group>
      </group>

      {/* Intake grill */}
      <mesh position={[0.6, 0.9, -1.05]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>

      {/* Branding */}
      <Text
        position={[0.1, 1.4, 1.01]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.32}
        color="#f8f6f2"
        maxWidth={2.5}
        anchorX="center"
        anchorY="middle"
      >
        BGG Land Management
      </Text>
    </group>
  );
};

const VegetationField = ({ mulcherRef }) => {
  const stemsRef = useRef();
  const leavesRef = useRef();
  const stemTemp = useMemo(() => new THREE.Object3D(), []);
  const leafTemp = useMemo(() => new THREE.Object3D(), []);
  const mulcherWorld = useMemo(() => new THREE.Vector3(), []);
  const bladeWorld = useMemo(() => new THREE.Vector3(), []);
  const stemPalette = useMemo(
    () => ["#4b7b45", "#56624a", "#3d4a3a", "#6c5a46", "#4f5d52"].map((hex) => new THREE.Color(hex)),
    []
  );
  const leafPalette = useMemo(
    () => ["#7ea866", "#8f9d72", "#6e7c63", "#9d9a7c"].map((hex) => new THREE.Color(hex)),
    []
  );
  const clusters = useMemo(() => {
    const clusterCount = 20;
    return Array.from({ length: clusterCount }).map(() => ({
      center: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(12),
        0,
        THREE.MathUtils.randFloat(0, 10)
      ),
      radius: 0.7 + Math.random() * 1.6,
    }));
  }, []);

  const vegetation = useMemo(() => {
    const stems = [];
    clusters.forEach((cluster) => {
      const stemCount = 7 + Math.floor(Math.random() * 9);
      for (let i = 0; i < stemCount; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * cluster.radius;
        const heightSelector = Math.random();
        let height = 0;
        if (heightSelector < 0.2) {
          height = 0.75 + Math.random() * 0.35;
        } else if (heightSelector < 0.6) {
          height = 1.2 + Math.random() * 0.6;
        } else {
          height = 1.9 + Math.random() * 0.7;
        }
        const thickness = THREE.MathUtils.lerp(0.035, 0.07, THREE.MathUtils.smoothstep(height, 0.7, 2.6));
        const stemColor = stemPalette[Math.floor(Math.random() * stemPalette.length)].clone();
        const leafColor = leafPalette[Math.floor(Math.random() * leafPalette.length)].clone();
        const colorScalar = 0.85 + Math.random() * 0.3;
        stemColor.multiplyScalar(colorScalar).clampScalar(0.08, 1);
        leafColor.multiplyScalar(0.9 + Math.random() * 0.25).clampScalar(0.1, 1);
        stems.push({
          position: new THREE.Vector3(
            cluster.center.x + Math.cos(angle) * distance,
            0,
            cluster.center.z + Math.sin(angle) * distance
          ),
          height,
          thickness,
          decay: 1,
          bend: 0,
          yaw: THREE.MathUtils.randFloatSpread(0.6),
          swayOffset: Math.random() * Math.PI * 2,
          lean: THREE.MathUtils.randFloatSpread(0.25),
          scar: 0,
          stemColor,
          leafColor,
        });
      }
    });

    const strayCount = 18;
    for (let i = 0; i < strayCount; i += 1) {
      const position = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(10),
        0,
        THREE.MathUtils.randFloat(0, 12)
      );
      const height = 0.9 + Math.random() * 0.9;
      const thickness = THREE.MathUtils.lerp(0.03, 0.06, Math.random());
      const stemColor = stemPalette[Math.floor(Math.random() * stemPalette.length)].clone().multiplyScalar(0.9 + Math.random() * 0.2);
      const leafColor = leafPalette[Math.floor(Math.random() * leafPalette.length)].clone().multiplyScalar(0.95 + Math.random() * 0.2);
      stems.push({
        position,
        height,
        thickness,
        decay: 1,
        bend: 0,
        yaw: THREE.MathUtils.randFloatSpread(0.8),
        swayOffset: Math.random() * Math.PI * 2,
        lean: THREE.MathUtils.randFloatSpread(0.3),
        scar: 0,
        stemColor,
        leafColor,
      });
    }

    const laneCenterX = 1.6;
    const laneHalfWidth = 1.6;
    const forwardLimit = 1.6;
    stems.forEach((stem) => {
      if (stem.position.z > forwardLimit) return;
      const lateral = Math.abs(stem.position.x - laneCenterX);
      if (lateral > laneHalfWidth) return;
      const forwardFactor = 1 - THREE.MathUtils.clamp(stem.position.z / forwardLimit, 0, 1);
      const lateralFactor = 1 - THREE.MathUtils.clamp(lateral / laneHalfWidth, 0, 1);
      const influence = THREE.MathUtils.clamp((forwardFactor * 0.7 + lateralFactor * 0.3), 0, 1);
      if (influence <= 0) return;
      stem.decay = THREE.MathUtils.lerp(stem.decay, 0.35, influence * 0.7);
      stem.scar = Math.max(stem.scar, 0.45 + 0.4 * influence);
      stem.bend = Math.max(stem.bend, 0.25 * influence);
    });

    return stems;
  }, [clusters, stemPalette, leafPalette]);

  const leafHints = useMemo(
    () =>
      vegetation.map((stem) => ({
        offset: new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(0.12),
          stem.height * (0.5 + Math.random() * 0.4),
          THREE.MathUtils.randFloatSpread(0.12)
        ),
        rotation: THREE.MathUtils.randFloatSpread(0.6),
        scale: 0.12 + Math.random() * 0.15,
      })),
    [vegetation]
  );

  useEffect(() => {
    if (!stemsRef.current || !leavesRef.current) return;
    vegetation.forEach((blade, i) => {
      const baseThickness = blade.thickness ?? 0.06;
      stemTemp.position.set(blade.position.x, -1 + blade.height, blade.position.z);
      stemTemp.scale.set(baseThickness, blade.height, baseThickness);
      stemTemp.rotation.set(blade.lean, blade.yaw, 0);
      stemTemp.updateMatrix();
      stemsRef.current.setMatrixAt(i, stemTemp.matrix);
      if (stemsRef.current.instanceColor) {
        stemsRef.current.setColorAt(i, blade.stemColor);
      }

      const hint = leafHints[i];
      leafTemp.position.set(
        blade.position.x + hint.offset.x,
        -1 + hint.offset.y,
        blade.position.z + hint.offset.z
      );
      leafTemp.scale.set(hint.scale, hint.scale * 1.6, hint.scale);
      leafTemp.rotation.set(0, hint.rotation, 0);
      leafTemp.updateMatrix();
      leavesRef.current.setMatrixAt(i, leafTemp.matrix);
      if (leavesRef.current.instanceColor) {
        leavesRef.current.setColorAt(i, blade.leafColor);
      }
    });
    stemsRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
    if (stemsRef.current.instanceColor) stemsRef.current.instanceColor.needsUpdate = true;
    if (leavesRef.current.instanceColor) leavesRef.current.instanceColor.needsUpdate = true;
  }, [vegetation, leafHints, stemTemp, leafTemp]);

  useFrame((state, delta) => {
    if (!stemsRef.current || !mulcherRef.current || !leavesRef.current) return;
    mulcherRef.current.getWorldPosition(mulcherWorld);

    vegetation.forEach((blade, i) => {
      const bladePos = blade.position;
      bladeWorld.set(bladePos.x + 0.5, 0, bladePos.z);
      const distance = mulcherWorld.distanceTo(bladeWorld);

      let targetDecay = 1;
      let targetBend = 0;

      if (distance < 1.2) {
        targetDecay = 0.05;
        targetBend = 0.75;
      } else if (distance < 2.4) {
        const falloff = 1 - (distance - 1.2) / 1.2;
        targetDecay = THREE.MathUtils.lerp(0.3, 0.9, 1 - falloff);
        targetBend = 0.2 + 0.4 * falloff;
      }

      if (distance < 1.6) {
        blade.scar = Math.min(1, blade.scar + delta * 1.2);
      } else {
        blade.scar = Math.max(0, blade.scar - delta * 0.05);
      }

      const residualHeight = THREE.MathUtils.lerp(0.2, 1, 1 - blade.scar);
      targetDecay = Math.min(targetDecay, residualHeight);

      const decayLerp = distance < 1.5 ? 0.35 : 0.08;
      const bendLerp = distance < 2.6 ? 0.25 : 0.05;
      blade.decay = THREE.MathUtils.lerp(blade.decay, targetDecay, decayLerp);
      blade.bend = THREE.MathUtils.lerp(blade.bend, targetBend, bendLerp);

      const baseThickness = blade.thickness ?? 0.06;
      const height = blade.height * blade.decay;
      const sway = Math.sin(blade.swayOffset + state.clock.elapsedTime * 0.65) * 0.035;
      const bendDirection = mulcherWorld.x > bladePos.x ? -1 : 1;

      stemTemp.position.set(bladePos.x, -1 + height, bladePos.z);
      stemTemp.scale.set(baseThickness, height, baseThickness);
      stemTemp.rotation.set(-bendDirection * (blade.bend + sway + blade.lean), blade.yaw, 0);
      stemTemp.updateMatrix();
      stemsRef.current.setMatrixAt(i, stemTemp.matrix);

      const hint = leafHints[i];
      leafTemp.position.set(
        bladePos.x + hint.offset.x * blade.decay,
        -1 + Math.max(0.2, height) + hint.offset.y * 0.1,
        bladePos.z + hint.offset.z * blade.decay
      );
      leafTemp.scale.set(hint.scale * blade.decay, hint.scale * 1.4 * blade.decay, hint.scale * blade.decay);
      leafTemp.rotation.set(0, hint.rotation + bendDirection * blade.bend * 0.4, 0);
      leafTemp.updateMatrix();
      leavesRef.current.setMatrixAt(i, leafTemp.matrix);
    });

    stemsRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={stemsRef} args={[null, null, vegetation.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.05, 1.9, 7]} />
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[null, null, leafHints.length]} castShadow receiveShadow>
        <planeGeometry args={[0.35, 0.8]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.7}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};

const ChipParticles = ({ sourceRef }) => {
  const count = 70;
  const pointsRef = useRef();
  const directions = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        direction: new THREE.Vector3(
          0.2 + Math.random() * 0.6,
          Math.random() * 0.7,
          (Math.random() - 0.5) * 0.9
        ).normalize(),
        life: Math.random() * 0.8,
        speed: 0.5 + Math.random() * 0.8,
      })),
    [count]
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const temp = useMemo(() => new THREE.Vector3(), []);
  const origin = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !sourceRef.current) return;
    sourceRef.current.getWorldPosition(origin);
    const arr = pointsRef.current.geometry.attributes.position.array;

    directions.forEach((particle, index) => {
      particle.life += delta * particle.speed;
      if (particle.life > 1.3) {
        particle.life = Math.random() * 0.15;
        particle.direction.set(
          0.2 + Math.random() * 0.6,
          Math.random() * 0.7,
          (Math.random() - 0.5) * 0.9
        ).normalize();
      }

      temp.copy(particle.direction).multiplyScalar(particle.life * 1.6).add(origin);
      temp.x += (Math.random() - 0.5) * 0.08;
      temp.y += (Math.random() - 0.5) * 0.04;
      temp.z += (Math.random() - 0.5) * 0.08;

      const i = index * 3;
      arr[i] = temp.x;
      arr[i + 1] = temp.y;
      arr[i + 2] = temp.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#f6d7a7" size={0.08} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};

const ClearedTrail = ({ mulcherRef }) => {
  const trailRef = useRef();
  const temp = useMemo(() => new THREE.Object3D(), []);
  const samples = useRef([]);
  const maxSamples = 18;
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!mulcherRef.current || !trailRef.current) return;
    mulcherRef.current.getWorldPosition(worldPos);
    samples.current.unshift({ position: worldPos.clone(), life: 1 });
    if (samples.current.length > maxSamples) {
      samples.current.pop();
    }

    samples.current.forEach((sample, index) => {
      sample.life = Math.max(0, sample.life - delta * 0.18);
      temp.position.set(sample.position.x - 1.2, -1.19, sample.position.z);
      temp.scale.set(1.4, 1, Math.max(0.4, 1.2 * sample.life));
      temp.rotation.set(-Math.PI / 2, 0, 0);
      temp.updateMatrix();
      trailRef.current.setMatrixAt(index, temp.matrix);
    });

    for (let i = samples.current.length; i < maxSamples; i += 1) {
      temp.scale.set(0, 0, 0);
      temp.updateMatrix();
      trailRef.current.setMatrixAt(i, temp.matrix);
    }

    trailRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={trailRef} args={[null, null, maxSamples]} receiveShadow>
      <planeGeometry args={[1.4, 2]} />
      <meshStandardMaterial color="#2f2416" roughness={0.9} metalness={0.1} transparent opacity={0.85} />
    </instancedMesh>
  );
};

const DustParticles = ({ sourceRef }) => {
  const count = 40;
  const pointsRef = useRef();
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const vectors = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        offset: Math.random() * 0.4,
        life: Math.random(),
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          0.2 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.4
        ),
      })),
    [count]
  );
  const origin = useMemo(() => new THREE.Vector3(), []);
  const temp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!sourceRef.current || !pointsRef.current) return;
    sourceRef.current.getWorldPosition(origin);
    const arr = pointsRef.current.geometry.attributes.position.array;

    vectors.forEach((particle, index) => {
      particle.life += delta * 0.4;
      if (particle.life > 1) {
        particle.life = Math.random() * 0.1;
        particle.direction.set(
          (Math.random() - 0.5) * 0.3,
          0.2 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.4
        );
      }

      temp.copy(particle.direction).multiplyScalar(2.2 * particle.life + particle.offset).add(origin);
      temp.y += particle.life * 0.6;

      const i = index * 3;
      arr[i] = temp.x;
      arr[i + 1] = temp.y;
      arr[i + 2] = temp.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#c2b7aa" size={0.12} sizeAttenuation transparent opacity={0.3} />
    </points>
  );
};

const ForestryScene = () => {
  const mulcherRef = useRef();

  return (
    <group dispose={null}>
      <fog attach="fog" args={["#020305", 10, 30]} />

      <hemisphereLight intensity={0.25} groundColor="#0b0b0b" />
      <spotLight
        position={[4, 6, 6]}
        angle={0.6}
        penumbra={0.9}
        intensity={2.2}
        color="#f7d7a7"
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={1.5}
        color="#94c2ff"
        castShadow
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050505" roughness={1} metalness={0} />
      </mesh>

      <ClearedTrail mulcherRef={mulcherRef} />
      <ForestryMachine mulcherRef={mulcherRef} />
      <VegetationField mulcherRef={mulcherRef} />
      <ChipParticles sourceRef={mulcherRef} />
      <DustParticles sourceRef={mulcherRef} />
    </group>
  );
};

const ForestrySceneCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={
        isMobile
          ? { position: [4, 2.2, 10], fov: 38 }
          : { position: [6, 1.8, 9], fov: 32 }
      }
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2.4}
          minPolarAngle={Math.PI / 2.6}
        />
        <ForestryScene />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ForestrySceneCanvas;
