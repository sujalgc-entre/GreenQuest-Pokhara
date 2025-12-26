'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={globeRef} args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            color="#14b8a6"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      {/* Glow effect */}
      <Sphere args={[1.6, 64, 64]}>
        <meshBasicMaterial color="#0f766e" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

function Particles({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial color="#14b8a6" roughness={0.5} />
    </instancedMesh>
  );
}

function GrowingTree({ growth = 0 }) {
  const group = useRef<THREE.Group>(null);
  const targetScale = 0.5 + Math.min(growth / 100, 2); // Grow up to 2.5x
  
  useFrame((state) => {
    if (group.current) {
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={group} position={[2, -1, 0]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#3f2a14" />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
    </group>
  );
}

export function ThreeScene({ userImpact = 0 }: { userImpact?: number }) {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#14b8a6" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Earth />
        <GrowingTree growth={userImpact} />
        <Particles count={50} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
