"use client";

import { Float, Icosahedron, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

export function NovaCore({ mobile = false }: { mobile?: boolean }) {
  const core = useRef<Mesh>(null); const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (core.current) { core.current.rotation.y += delta * .24; core.current.rotation.z = Math.sin(state.clock.elapsedTime * .5) * .08; }
    if (group.current && !mobile) { group.current.rotation.y += (state.pointer.x * .16 - group.current.rotation.y) * .035; group.current.rotation.x += (-state.pointer.y * .08 - group.current.rotation.x) * .035; }
  });
  return <group ref={group}><Float speed={1.25} rotationIntensity={.18} floatIntensity={.6}><group><Icosahedron ref={core} args={[1.15, 1]}><meshPhysicalMaterial color="#a8fffa" emissive="#4DE8E0" emissiveIntensity={1.4} roughness={.18} metalness={.15} transmission={.2}/></Icosahedron><mesh rotation-x={Math.PI / 2}><torusGeometry args={[1.65, .012, 8, 96]}/><meshBasicMaterial color="#4DE8E0" transparent opacity={.45}/></mesh><mesh rotation={[Math.PI / 2.3, .3, .8]}><torusGeometry args={[1.9, .008, 8, 96]}/><meshBasicMaterial color="#3B82F6" transparent opacity={.34}/></mesh><Sparkles count={mobile ? 18 : 42} scale={5} size={2.2} speed={.22} color="#4DE8E0"/></group></Float><group position={[0, -2.05, 0]}><mesh><cylinderGeometry args={[1.65, 1.15, .32, 8]}/><meshStandardMaterial color="#131B2E" roughness={.8}/></mesh><mesh position={[0, -.32, 0]}><cylinderGeometry args={[1.12, .3, .55, 8]}/><meshStandardMaterial color="#0D1321" roughness={.9}/></mesh></group></group>;
}
