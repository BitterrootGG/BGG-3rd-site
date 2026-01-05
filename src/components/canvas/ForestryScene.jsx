import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, Text } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import CanvasLoader from "../Loader";

const ForestryMachine = ({ mulcherRef, engagementRef }) => {
  const machineRef = useRef();
  const liftRef = useRef();
  const boomRef = useRef();
  const headPivot = useRef();
  const teethRef = useRef();
  const toothTemp = useMemo(() => new THREE.Object3D(), []);
  const toothCount = 18;
  const leftTrackRef = useRef();
  const rightTrackRef = useRef();
  const trackDummy = useMemo(() => new THREE.Object3D(), []);
  const padOffsets = useMemo(() => Array.from({ length: 28 }, (_, i) => i / 28), []);
  const trackScroll = useRef(0);
  const machineX = useRef(-3.2);
  const previousX = useRef(-3.2);
  const trackVelocity = useRef(0);
  const spinState = useRef(0);
  const bodyColor = "#1b1d22";
  const cabColor = "#0b0c0f";
  const accentColor = "#c38b22";
  const guardColor = "#1d1d1d";
  const steelColor = "#141414";

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

  const updateTrack = (meshRef, lateral) => {
    if (!meshRef.current) return;
    padOffsets.forEach((offset, index) => {
      const progress = (offset + trackScroll.current + 1) % 1;
      const angle = progress * Math.PI * 2;
      const x = Math.sin(angle) * 1.85;
      const y = Math.cos(angle) * 0.55 - 0.55;
      const tangentX = Math.cos(angle) * 1.85;
      const tangentY = -Math.sin(angle) * 0.55;
      trackDummy.position.set(x, y, lateral);
      trackDummy.rotation.set(0, 0, Math.atan2(tangentY, tangentX));
      trackDummy.updateMatrix();
      meshRef.current.setMatrixAt(index, trackDummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  };

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime * 0.25;
    const targetX = -3.2 + Math.sin(time) * 0.8;
    machineX.current = THREE.MathUtils.lerp(machineX.current, targetX, 0.08);
    if (machineRef.current) {
      machineRef.current.position.x = machineX.current;
      machineRef.current.position.z = THREE.MathUtils.lerp(
        machineRef.current.position.z,
        Math.cos(time * 0.6) * 0.18,
        0.05
      );
      machineRef.current.rotation.y = THREE.MathUtils.lerp(
        machineRef.current.rotation.y,
        Math.PI + Math.sin(time * 0.4) * 0.04,
        0.08
      );
    }

    const velocity = THREE.MathUtils.clamp(
      (machineX.current - previousX.current) / Math.max(delta, 1e-4),
      -1.4,
      1.4
    );
    const travelDirection = Math.sign(velocity) || 1;
    previousX.current = machineX.current;
    trackVelocity.current = THREE.MathUtils.lerp(trackVelocity.current, Math.abs(velocity), 0.1);
    trackScroll.current = (trackScroll.current + trackVelocity.current * delta * 0.65) % 1;
    updateTrack(leftTrackRef, 0.96);
    updateTrack(rightTrackRef, -0.96);

    const liftTarget = 1.05 + (engagementRef?.current ?? 0) * 0.25;
    if (liftRef.current) {
      liftRef.current.position.y = THREE.MathUtils.lerp(liftRef.current.position.y, liftTarget, 0.12);
    }

    const boomTarget = 0.1 + (engagementRef?.current ?? 0) * 0.4;
    if (boomRef.current) {
      boomRef.current.rotation.z = THREE.MathUtils.lerp(boomRef.current.rotation.z, boomTarget, 0.15);
    }

    const headSweep = Math.sin(time * 0.6) * 0.15;
    if (headPivot.current) {
      headPivot.current.rotation.y = THREE.MathUtils.lerp(headPivot.current.rotation.y, headSweep, 0.2);
    }

    const spinTarget = (engagementRef?.current ?? 0) > 0.08 ? 9 : 0;
    spinState.current = THREE.MathUtils.lerp(spinState.current, spinTarget, 0.12);
    if (mulcherRef.current) {
      mulcherRef.current.rotation.z -= spinState.current * delta * travelDirection;
    }
  });

  return (
    <group ref={machineRef} position={[0, -0.75, 0]}>
      <instancedMesh ref={leftTrackRef} args={[null, null, padOffsets.length]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.14, 0.5]} />
        <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={rightTrackRef} args={[null, null, padOffsets.length]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.14, 0.5]} />
        <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.5} />
      </instancedMesh>

      <mesh position={[0, -0.05, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.4, 0.5]} />
        <meshStandardMaterial color={steelColor} roughness={0.8} metalness={0.35} />
      </mesh>
      <mesh position={[0, -0.05, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.4, 0.5]} />
        <meshStandardMaterial color={steelColor} roughness={0.8} metalness={0.35} />
      </mesh>

      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[3.4, 1.2, 2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.7} />
      </mesh>

      <mesh position={[-0.7, 1.7, 0]} castShadow>
        <boxGeometry args={[1.4, 1.1, 1.6]} />
        <meshStandardMaterial color={cabColor} roughness={0.3} metalness={0.6} />
      </mesh>

      <mesh position={[0, 0.35, 1.08]} castShadow>
        <boxGeometry args={[3.8, 0.7, 0.22]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.35, -1.08]} castShadow>
        <boxGeometry args={[3.8, 0.7, 0.22]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} metalness={0.25} />
      </mesh>

      <mesh position={[1.95, 1.05, 0]} castShadow>
        <boxGeometry args={[0.4, 1.4, 2.3]} />
        <meshStandardMaterial color={guardColor} roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh position={[2.15, 1.58, 0]} castShadow>
        <boxGeometry args={[0.3, 0.24, 2.4]} />
        <meshStandardMaterial color={steelColor} roughness={0.4} metalness={0.65} />
      </mesh>
      <mesh position={[1.65, 1.35, 0.95]} castShadow rotation={[0, 0, -Math.PI / 12]}>
        <boxGeometry args={[1.2, 0.15, 0.2]} />
        <meshStandardMaterial color={steelColor} roughness={0.45} metalness={0.55} />
      </mesh>
      <mesh position={[1.65, 1.35, -0.95]} castShadow rotation={[0, 0, Math.PI / 12]}>
        <boxGeometry args={[1.2, 0.15, 0.2]} />
        <meshStandardMaterial color={steelColor} roughness={0.45} metalness={0.55} />
      </mesh>

      <mesh position={[-0.35, 2, 0.8]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.22]} />
        <meshStandardMaterial color={guardColor} roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position={[-0.35, 2, 0.8]}>
        <boxGeometry args={[0.28, 0.12, 0.12]} />
        <meshStandardMaterial color="#f6dba1" emissive="#f6c66a" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.35, 2, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.22]} />
        <meshStandardMaterial color={guardColor} roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position={[-0.35, 2, -0.8]}>
        <boxGeometry args={[0.28, 0.12, 0.12]} />
        <meshStandardMaterial color="#f6dba1" emissive="#f6c66a" emissiveIntensity={1.5} />
      </mesh>

      <group ref={liftRef} position={[0, 1.05, 0]}>
        <mesh position={[1.2, 0.1, 0]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.4]} />
          <meshStandardMaterial color={steelColor} roughness={0.35} metalness={0.55} />
        </mesh>
        <group ref={boomRef} position={[1.4, 0.9, 0]}>
          <mesh position={[0.8, 0.1, 0]} castShadow>
            <boxGeometry args={[1.6, 0.35, 0.35]} />
            <meshStandardMaterial color={steelColor} metalness={0.7} roughness={0.25} />
          </mesh>
          <group ref={headPivot} position={[1.6, 0, 0]}>
            <mesh position={[0.4, -0.05, 0]} castShadow>
              <boxGeometry args={[1.7, 0.5, 2.1]} />
              <meshStandardMaterial color={guardColor} roughness={0.55} metalness={0.35} />
            </mesh>
            <mesh position={[0.95, 0.25, 0]} castShadow>
              <boxGeometry args={[0.35, 0.9, 2.25]} />
              <meshStandardMaterial color={steelColor} roughness={0.5} metalness={0.45} />
            </mesh>
            <mesh position={[0.2, 0.3, 0]} castShadow>
              <boxGeometry args={[1.1, 0.2, 2.4]} />
              <meshStandardMaterial color={guardColor} roughness={0.5} metalness={0.3} />
            </mesh>
            <group ref={mulcherRef} position={[0.5, 0, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.4, 1.4, 24, 1, true]} />
                <meshStandardMaterial color={accentColor} emissive="#5a3107" emissiveIntensity={0.45} roughness={0.35} metalness={0.4} />
              </mesh>
              <instancedMesh ref={teethRef} args={[null, null, toothCount]} castShadow>
                <boxGeometry args={[0.25, 0.05, 0.08]} />
                <meshStandardMaterial color="#f4b15c" emissive="#612800" emissiveIntensity={0.3} />
              </instancedMesh>
            </group>
          </group>
        </group>
      </group>

      <mesh position={[0.6, 0.9, -1.05]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color={guardColor} roughness={0.5} />
      </mesh>

      <Text
        position={[0.1, 1.35, 1.01]}
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

const VegetationField = ({ mulcherRef, engagementRef }) => {
  const clusterRef = useRef();
  const leafRef = useRef();
  const clusterDummy = useMemo(() => new THREE.Object3D(), []);
  const leafDummy = useMemo(() => new THREE.Object3D(), []);
  const mulcherWorld = useMemo(() => new THREE.Vector3(), []);
  const tempDir = useMemo(() => new THREE.Vector3(), []);

  const clusterGeometry = useMemo(() => {
    const stems = [];
    const stemCount = 6;
    const baseColor = new THREE.Color("#1d1a15");
    const tipColor = new THREE.Color("#5f6c48");
    for (let i = 0; i < stemCount; i += 1) {
      const height = 2.4;
      const radius = 0.02 + Math.random() * 0.015;
      const stem = new THREE.CylinderGeometry(radius * 0.4, radius, height, 6, 4, true);
      const spread = 0.08 + Math.random() * 0.08;
      const angle = Math.random() * Math.PI * 2;
      stem.translate(Math.cos(angle) * spread, height / 2, Math.sin(angle) * spread);

      const positionAttr = stem.attributes.position;
      const colors = [];
      for (let v = 0; v < positionAttr.count; v += 1) {
        const y = THREE.MathUtils.clamp(positionAttr.getY(v) / height, 0, 1);
        const gradient = baseColor.clone().lerp(tipColor, Math.pow(y, 0.85));
        const shadowBoost = THREE.MathUtils.lerp(0.65, 1, y);
        colors.push(gradient.r * shadowBoost, gradient.g * shadowBoost, gradient.b * shadowBoost);
      }
      stem.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      stems.push(stem);
    }
    const merged = mergeGeometries(stems, false);
    merged.computeVertexNormals();
    return merged;
  }, []);

  const leafGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.2, 0.6, 1, 1);
    geometry.translate(0, 0.3, 0);
    return geometry;
  }, []);

  const { clusters, leaves } = useMemo(() => {
    const seeds = Array.from({ length: 14 }).map(() => ({
      center: new THREE.Vector3(
        -3.4 + THREE.MathUtils.randFloatSpread(1.4),
        -1,
        -0.4 + Math.random() * 11
      ),
      weight: 0.5 + Math.random() * 0.8,
    }));

    const items = [];
    const leafHints = [];
    seeds.forEach((seed) => {
      const sproutCount = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < sproutCount; i += 1) {
        if (Math.random() < 0.18) continue;
        const offsetRadius = Math.random() * 0.55 * seed.weight;
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetX = Math.cos(offsetAngle) * offsetRadius;
        const offsetZ = Math.sin(offsetAngle) * offsetRadius;
        const clusterIndex = items.length;
        items.push({
          position: new THREE.Vector3(seed.center.x + offsetX, -1, seed.center.z + offsetZ * 0.65),
          yaw: THREE.MathUtils.randFloatSpread(0.4),
          height: 1.6 + Math.random() * 1.2,
          width: 0.45 + Math.random() * 0.35,
          bend: 0,
          decay: 1,
          vanish: 0,
          swayOffset: Math.random() * Math.PI * 2,
        });

        const leafCount = 2 + Math.floor(Math.random() * 3);
        for (let l = 0; l < leafCount; l += 1) {
          const offset = new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(0.25),
            0.6 + Math.random() * 0.4,
            THREE.MathUtils.randFloatSpread(0.25)
          );
          const baseColor = new THREE.Color("#384a32");
          const tipColor = new THREE.Color("#6c7d4f");
          const color = baseColor.clone().lerp(tipColor, Math.random() * 0.6 + 0.2);
          leafHints.push({
            clusterIndex,
            offset,
            tilt: THREE.MathUtils.randFloatSpread(0.25),
            twist: THREE.MathUtils.randFloatSpread(0.3),
            scale: 0.12 + Math.random() * 0.08,
            color,
          });
        }
      }
    });

    return { clusters: items, leaves: leafHints };
  }, []);

  useEffect(() => {
    if (!clusterRef.current || !clusterGeometry) return;
    clusters.forEach((cluster, index) => {
      clusterDummy.position.set(cluster.position.x, -1 + cluster.height * 0.5, cluster.position.z);
      clusterDummy.scale.set(cluster.width, cluster.height, cluster.width * 0.8);
      clusterDummy.rotation.set(0, cluster.yaw, 0);
      clusterDummy.updateMatrix();
      clusterRef.current.setMatrixAt(index, clusterDummy.matrix);
    });
    clusterRef.current.instanceMatrix.needsUpdate = true;
  }, [clusters, clusterGeometry, clusterDummy]);

  useEffect(() => {
    if (!leafRef.current || !leafGeometry) return;
    leaves.forEach((leaf, index) => {
      leafDummy.position.copy(leaf.offset);
      leafDummy.updateMatrix();
      leafRef.current.setMatrixAt(index, leafDummy.matrix);
      if (leafRef.current.instanceColor) {
        leafRef.current.setColorAt(index, leaf.color);
      }
    });
    leafRef.current.instanceMatrix.needsUpdate = true;
    if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
  }, [leaves, leafGeometry, leafDummy]);

  useFrame((state) => {
    if (!clusterRef.current || !mulcherRef.current) return;
    mulcherRef.current.getWorldPosition(mulcherWorld);
    let closestDistance = Infinity;

    clusters.forEach((cluster, index) => {
      tempDir.set(mulcherWorld.x - cluster.position.x, 0, mulcherWorld.z - cluster.position.z);
      const planarDistance = tempDir.length();
      closestDistance = Math.min(closestDistance, planarDistance);

      const bendInfluence = THREE.MathUtils.clamp(1 - (planarDistance - 0.8) / 1.5, 0, 1);
      const bendTarget = bendInfluence * 0.4;
      cluster.bend = THREE.MathUtils.lerp(cluster.bend, bendTarget, 0.12);

      const contact = planarDistance < 0.85 ? 1 : 0;
      const vanishRate = contact ? 0.45 : 0.06;
      cluster.decay = THREE.MathUtils.lerp(cluster.decay, contact ? 0 : 1, vanishRate);
      cluster.vanish = THREE.MathUtils.lerp(cluster.vanish, contact, vanishRate);

      const living = Math.max(0, 1 - cluster.vanish);
      const netHeight = Math.max(0.05, cluster.height * cluster.decay);
      const netWidth = Math.max(0.02, cluster.width * (0.7 + 0.3 * living));
      const sway = Math.sin(cluster.swayOffset + state.clock.elapsedTime * 0.4) * 0.04 * living;

      if (planarDistance > 0.001) tempDir.normalize();
      const leanX = tempDir.x * (cluster.bend + sway);
      const leanZ = tempDir.z * (cluster.bend + sway);

      clusterDummy.position.set(cluster.position.x, -1 + netHeight * 0.5, cluster.position.z);
      clusterDummy.scale.set(netWidth, netHeight, netWidth * 0.78);
      clusterDummy.rotation.set(-leanZ, cluster.yaw, leanX);
      clusterDummy.updateMatrix();
      clusterRef.current.setMatrixAt(index, clusterDummy.matrix);

      cluster.currentHeight = netHeight;
      cluster.currentWidth = netWidth;
      cluster.currentLeanX = leanX;
      cluster.currentLeanZ = leanZ;
      cluster.living = living;
    });

    clusterRef.current.instanceMatrix.needsUpdate = true;

    if (leafRef.current) {
      leaves.forEach((leaf, index) => {
        const host = clusters[leaf.clusterIndex];
        if (!host) return;
        const living = host.living ?? 0;
        const height = host.currentHeight ?? host.height;
        const width = host.currentWidth ?? host.width;
        const leanAdjustment = host.currentLeanZ ?? 0;
        const lateral = width * 0.6;
        leafDummy.position.set(
          host.position.x + leaf.offset.x * lateral,
          -1 + height * leaf.offset.y,
          host.position.z + leaf.offset.z * lateral
        );
        const scale = leaf.scale * THREE.MathUtils.clamp(living, 0, 1);
        leafDummy.scale.set(scale, scale, scale);
        leafDummy.rotation.set(-leanAdjustment + leaf.tilt, (host.yaw ?? 0) + leaf.twist, 0);
        leafDummy.updateMatrix();
        leafRef.current.setMatrixAt(index, leafDummy.matrix);
      });
      leafRef.current.instanceMatrix.needsUpdate = true;
    }

    const engagement = THREE.MathUtils.clamp(
      closestDistance < 0.9 ? 1 : closestDistance < 2.2 ? 0.45 : 0,
      0,
      1
    );
    if (engagementRef) {
      engagementRef.current = THREE.MathUtils.lerp(engagementRef.current ?? 0, engagement, 0.15);
    }
  });

  if (!clusters.length || !clusterGeometry) return null;

  return (
    <group>
      <instancedMesh ref={clusterRef} args={[clusterGeometry, null, clusters.length]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0.08} />
      </instancedMesh>
      {leaves.length > 0 && (
        <instancedMesh ref={leafRef} args={[leafGeometry, null, leaves.length]} castShadow>
          <meshStandardMaterial
            vertexColors
            transparent
            opacity={0.55}
            roughness={0.8}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      )}
    </group>
  );
};

const ChipParticles = ({ sourceRef, engagementRef }) => {
  const count = 70;
  const pointsRef = useRef();
  const materialRef = useRef();
  const directions = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        direction: new THREE.Vector3(
          0.7 + Math.random() * 0.6,
          -(0.15 + Math.random() * 0.35),
          THREE.MathUtils.randFloatSpread(0.35)
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
    const activity = THREE.MathUtils.clamp(engagementRef?.current ?? 0, 0, 1);
    const arr = pointsRef.current.geometry.attributes.position.array;

    directions.forEach((particle, index) => {
      const lifeScale = THREE.MathUtils.lerp(0.15, 1, activity);
      particle.life += delta * particle.speed * lifeScale;
      if (particle.life > 1.3) {
        particle.life = Math.random() * 0.15;
        particle.direction.set(
          0.7 + Math.random() * 0.6,
          -(0.15 + Math.random() * 0.35),
          THREE.MathUtils.randFloatSpread(0.35)
        ).normalize();
      }

      temp.copy(particle.direction).multiplyScalar(particle.life * 1.8).add(origin);
      temp.x += 0.25;
      temp.y -= particle.life * 0.15;
      temp.z += THREE.MathUtils.randFloatSpread(0.05);

      const i = index * 3;
      arr[i] = temp.x;
      arr[i + 1] = temp.y;
      arr[i + 2] = temp.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        0.85 * activity,
        0.2
      );
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} color="#f6d7a7" size={0.08} sizeAttenuation transparent opacity={0.05} />
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
      temp.position.set(sample.position.x + 1.25, -1.22, sample.position.z);
      temp.scale.set(1.2 + sample.life * 1.6, 1, 2.2);
      temp.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
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
      <meshStandardMaterial color="#1a140c" roughness={1} metalness={0} transparent opacity={0.92} />
    </instancedMesh>
  );
};

const DustParticles = ({ sourceRef, engagementRef }) => {
  const count = 40;
  const pointsRef = useRef();
  const materialRef = useRef();
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const vectors = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        offset: Math.random() * 0.4,
        life: Math.random(),
        direction: new THREE.Vector3(
          0.45 + Math.random() * 0.4,
          -(0.05 + Math.random() * 0.18),
          THREE.MathUtils.randFloatSpread(0.4)
        ),
      })),
    [count]
  );
  const origin = useMemo(() => new THREE.Vector3(), []);
  const temp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!sourceRef.current || !pointsRef.current) return;
    sourceRef.current.getWorldPosition(origin);
    const activity = THREE.MathUtils.clamp(engagementRef?.current ?? 0, 0, 1);
    const arr = pointsRef.current.geometry.attributes.position.array;

    vectors.forEach((particle, index) => {
      particle.life += delta * THREE.MathUtils.lerp(0.1, 0.5, activity);
      if (particle.life > 1) {
        particle.life = Math.random() * 0.1;
        particle.direction.set(
          0.45 + Math.random() * 0.4,
          -(0.05 + Math.random() * 0.18),
          THREE.MathUtils.randFloatSpread(0.4)
        );
      }

      temp
        .copy(particle.direction)
        .multiplyScalar(1.8 * particle.life + particle.offset)
        .add(origin);
      temp.x += 0.2;
      temp.y -= particle.life * 0.1;
      temp.z += THREE.MathUtils.randFloatSpread(0.04);

      const i = index * 3;
      arr[i] = temp.x;
      arr[i + 1] = temp.y;
      arr[i + 2] = temp.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        0.28 * activity,
        0.15
      );
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} color="#c2b7aa" size={0.12} sizeAttenuation transparent opacity={0.04} />
    </points>
  );
};

const ForestryScene = () => {
  const mulcherRef = useRef();
  const engagementRef = useRef(0);

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
      <ForestryMachine mulcherRef={mulcherRef} engagementRef={engagementRef} />
      <VegetationField mulcherRef={mulcherRef} engagementRef={engagementRef} />
      <ChipParticles sourceRef={mulcherRef} engagementRef={engagementRef} />
      <DustParticles sourceRef={mulcherRef} engagementRef={engagementRef} />
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
