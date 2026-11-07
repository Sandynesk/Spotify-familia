'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'

interface Auth3DCanvasProps {
  onReady?: () => void
}

const CAPSULE_COUNT = 6
const RADIUS = 1.65

const CAPSULE_COLORS = [
  '#48e5b2',
  '#34d399',
  '#64a8ff',
  '#48e5b2',
  '#10b981',
  '#2dd4bf',
]

function CapsuleRing({ onReady }: { onReady?: () => void }) {
  const rootRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const readySent = useRef(false)
  const { viewport } = useThree()

  // Scale down slightly on smaller viewports
  const isMobile = viewport.width < 5.5
  const baseScale = isMobile ? 0.78 : 1.05

  const capsules = useMemo(() => {
    return Array.from({ length: CAPSULE_COUNT }, (_, index) => {
      const angle = (index / CAPSULE_COUNT) * Math.PI * 2
      const x = Math.cos(angle) * RADIUS
      const z = Math.sin(angle) * RADIUS
      return {
        x,
        z,
        angle,
        color: CAPSULE_COLORS[index % CAPSULE_COLORS.length],
        rotationZ: Math.PI / 2 + angle,
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (!readySent.current) {
      readySent.current = true
      onReady?.()
    }

    const t = state.clock.getElapsedTime()

    // Smooth mouse parallax with gentle inertia
    if (rootRef.current) {
      const targetRotX = 0.42 - state.pointer.y * 0.22
      const targetRotY = state.pointer.x * 0.32
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetRotX, 0.06)
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotY, 0.06)
    }

    // Continuous celestial orbit rotation
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.35
    }

    // Central pulsing core
    if (coreRef.current) {
      coreRef.current.rotation.z = -t * 0.15
      const s = 1 + Math.sin(t * 1.8) * 0.035
      coreRef.current.scale.set(s, s, s)
    }
  })

  return (
    <group ref={rootRef} scale={baseScale}>
      {/* Central stylized vinyl / glowing core disc */}
      <mesh ref={coreRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.04, 32]} />
        <meshStandardMaterial
          color="#121216"
          roughness={0.35}
          metalness={0.7}
          emissive="#0d261e"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Orbiting sound wave ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[RADIUS - 0.08, RADIUS + 0.08, 64]} />
        <meshBasicMaterial color="#48e5b2" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>

      {/* Secondary accent orbit ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <ringGeometry args={[RADIUS * 0.65, RADIUS * 0.67, 48]} />
        <meshBasicMaterial color="#64a8ff" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* The 6 Spotify Family capsules */}
      <group ref={ringRef}>
        {capsules.map((cap, i) => (
          <group
            key={i}
            position={[cap.x, 0, cap.z]}
            rotation={[0, -cap.angle, Math.PI / 2]}
          >
            <mesh>
              <capsuleGeometry args={[0.13, 0.38, 8, 16]} />
              <meshPhysicalMaterial
                color={cap.color}
                emissive={cap.color}
                emissiveIntensity={0.28}
                roughness={0.18}
                metalness={0.12}
                transmission={0.45}
                thickness={0.5}
                transparent
                opacity={0.92}
                clearcoat={0.9}
                clearcoatRoughness={0.1}
              />
            </mesh>

            {/* Subtle glow highlight on top of each capsule */}
            <pointLight color={cap.color} intensity={0.45} distance={1.2} />
          </group>
        ))}
      </group>
    </group>
  )
}

export function Auth3DCanvas({ onReady }: Auth3DCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 4.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      className="pointer-events-auto h-full w-full"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-2.5, 1.5, 2]} intensity={2.2} color="#48e5b2" distance={7} />
      <pointLight position={[2.5, -1, 1.5]} intensity={1.8} color="#64a8ff" distance={7} />

      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <CapsuleRing onReady={onReady} />
      </Float>

      <Sparkles
        count={38}
        scale={[4.5, 3.5, 3]}
        size={1.6}
        speed={0.4}
        opacity={0.45}
        color="#48e5b2"
      />
    </Canvas>
  )
}
