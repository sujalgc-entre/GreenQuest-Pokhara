'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function Bar({ position, height, label, color }: { position: [number, number, number], height: number, label: string, color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, height, 0.1);
      mesh.current.position.y = mesh.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      <Text
        position={[0, -0.5, 0.5]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}

export function ThreeBarChart({ data }: { data: { ward: string, total: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const colors = ['#14b8a6', '#0f766e', '#0d9488', '#2dd4bf', '#5eead4'];

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <group position={[-data.length / 2, 0, 0]}>
          {data.map((item, i) => (
            <Bar
              key={item.ward}
              position={[i * 1.2, 0, 0]}
              height={(item.total / maxVal) * 4}
              label={item.ward}
              color={colors[i % colors.length]}
            />
          ))}
        </group>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
