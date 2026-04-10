import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function FloatingShape({ position, scale, speed, color }: { position: [number, number, number]; scale: number; speed: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
      meshRef.current.rotation.y += speed * 0.003;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial color={color} transparent opacity={0.15} distort={0.3} speed={1.5} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
}

function FloatingCard({ position, scale }: { position: [number, number, number]; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1.6, 1, 0.02]} />
        <meshStandardMaterial color="#C4A35A" transparent opacity={0.12} metalness={0.9} roughness={0.1} />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#C4A35A" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#C4A35A" />
        <pointLight position={[-5, -5, 5]} intensity={0.2} color="#8B7340" />

        <FloatingShape position={[-3.5, 2, -2]} scale={1.2} speed={0.8} color="#C4A35A" />
        <FloatingShape position={[4, -1.5, -3]} scale={0.9} speed={1.2} color="#A08540" />
        <FloatingShape position={[-1, -3, -1]} scale={0.6} speed={1} color="#D4B36A" />
        <FloatingShape position={[2.5, 3, -2]} scale={0.7} speed={0.6} color="#B49550" />

        <FloatingCard position={[3, 1, -1]} scale={0.8} />
        <FloatingCard position={[-2.5, -1, -2]} scale={0.6} />

        <Particles />
      </Canvas>
    </div>
  );
}
