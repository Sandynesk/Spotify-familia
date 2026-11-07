'use client'

import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from '../screens/size'

export interface PhoneModelProps {
  screen: React.ReactNode
}

/** Cria uma Shape de retângulo com cantos arredondados no plano XY, centralizada em (0, 0). */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  const halfW = width / 2
  const halfH = height / 2
  const r = Math.min(radius, halfW, halfH)

  // Arcos circulares exatos nos 4 cantos
  shape.absarc(-halfW + r, -halfH + r, r, -Math.PI / 2, -Math.PI, true)
  shape.absarc(-halfW + r, halfH - r, r, Math.PI, Math.PI / 2, true)
  shape.absarc(halfW - r, halfH - r, r, Math.PI / 2, 0, true)
  shape.absarc(halfW - r, -halfH + r, r, 0, -Math.PI / 2, true)

  return shape
}

/**
 * Flagship premium genérico em titânio grafite, modelado 100% em código (sem GLB).
 * Proporções reais: 71,5 × 149,6 × 8,25 mm (1 unidade = 100 mm).
 */
export const PhoneModel = memo(function PhoneModel({ screen }: PhoneModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<HTMLDivElement>(null)

  // Dimensões do aparelho (1 unid = 100 mm)
  const PHONE_W = 0.715
  const PHONE_H = 1.496
  const PHONE_D = 0.0825
  const PHONE_RADIUS = 0.105

  // Display: proporção exata SCREEN_W / SCREEN_H com raio proporcional a SCREEN_RADIUS
  const DISPLAY_W = 0.676
  const DISPLAY_H = DISPLAY_W * (SCREEN_H / SCREEN_W) // ≈ 1.463
  const DISPLAY_RADIUS = DISPLAY_W * (SCREEN_RADIUS / SCREEN_W) // ≈ 0.0936
  const DISPLAY_SCALE = DISPLAY_W / SCREEN_W // 0.676 / 390

  // 1. Geometria do corpo (chassi) em titânio com chanfro suave
  const bodyGeometry = useMemo(() => {
    const bevelThickness = 0.0025
    const bevelSize = 0.0025
    const shapeW = PHONE_W - bevelSize * 2
    const shapeH = PHONE_H - bevelSize * 2
    const shape = createRoundedRectShape(shapeW, shapeH, PHONE_RADIUS - bevelSize)
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: PHONE_D - bevelThickness * 2,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 4,
      curveSegments: 24,
    })
    geom.center()
    return geom
  }, [PHONE_W, PHONE_H, PHONE_D, PHONE_RADIUS])

  // 2. Geometria do vidro frontal (borda preta fina de ~1,5 mm)
  const frontGlassGeometry = useMemo(() => {
    const shape = createRoundedRectShape(PHONE_W - 0.005, PHONE_H - 0.005, PHONE_RADIUS - 0.002)
    const geom = new THREE.ShapeGeometry(shape, 24)
    geom.center()
    return geom
  }, [PHONE_W, PHONE_H, PHONE_RADIUS])

  // 3. Geometria da base do display
  const displayBackingGeometry = useMemo(() => {
    const shape = createRoundedRectShape(DISPLAY_W, DISPLAY_H, DISPLAY_RADIUS)
    const geom = new THREE.ShapeGeometry(shape, 24)
    geom.center()
    return geom
  }, [DISPLAY_W, DISPLAY_H, DISPLAY_RADIUS])

  // 4. Geometria da traseira em vidro fosco
  const backGlassGeometry = useMemo(() => {
    const shape = createRoundedRectShape(PHONE_W - 0.006, PHONE_H - 0.006, PHONE_RADIUS - 0.003)
    const geom = new THREE.ShapeGeometry(shape, 24)
    geom.center()
    return geom
  }, [PHONE_W, PHONE_H, PHONE_RADIUS])

  // 5. Módulo de câmera (plataforma / bump)
  const cameraBumpGeometry = useMemo(() => {
    const shape = createRoundedRectShape(0.32, 0.34, 0.065)
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 3,
      curveSegments: 16,
    })
    geom.center()
    return geom
  }, [])

  // Geometrias dos anéis e lentes das 3 câmeras
  const cameraRingGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.052, 0.052, 0.014, 32)
  }, [])

  const cameraRingBezelGeometry = useMemo(() => {
    return new THREE.RingGeometry(0.043, 0.052, 32)
  }, [])

  const cameraLensGeometry = useMemo(() => {
    return new THREE.CircleGeometry(0.043, 32)
  }, [])

  const cameraReflectionGeometry = useMemo(() => {
    return new THREE.CircleGeometry(0.022, 24)
  }, [])

  // Ilha frontal (pílula preta)
  const islandGeometry = useMemo(() => {
    const shape = createRoundedRectShape(0.12, 0.034, 0.017)
    const geom = new THREE.ShapeGeometry(shape, 16)
    geom.center()
    return geom
  }, [])

  // Botões laterais
  const powerButtonGeometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(0.006, 0.16, 0.032)
    return geom
  }, [])

  const volumeButtonGeometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(0.006, 0.10, 0.032)
    return geom
  }, [])

  // Materiais memorizados
  const titaniumMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#5a5a60',
      metalness: 1.0,
      roughness: 0.32,
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
      anisotropy: 0.4,
    })
  }, [])

  const frontGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#070709',
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    })
  }, [])

  const displayBackingMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#000000' })
  }, [])

  const backGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#2a2a2e',
      roughness: 0.55,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    })
  }, [])

  const cameraBumpMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#242428',
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.5,
    })
  }, [])

  const cameraLensMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#030305',
      roughness: 0.05,
      clearcoat: 1.0,
      metalness: 0.1,
    })
  }, [])

  const cameraReflectionMaterial = useMemo(() => {
    // Disco menor com reflexo interno sutil azulado/esverdeado
    return new THREE.MeshPhysicalMaterial({
      color: '#082522',
      emissive: '#041c16',
      roughness: 0.1,
      clearcoat: 1.0,
      metalness: 0.3,
    })
  }, [])

  const flashMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f5eee0',
      roughness: 0.3,
      metalness: 0.1,
    })
  }, [])

  const micMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#0c0c0e' })
  }, [])

  const islandMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#020202' })
  }, [])

  // Variáveis para teste de vetor normal (zero alocação por frame)
  const forwardVec = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const worldForward = useMemo(() => new THREE.Vector3(), [])
  const camDir = useMemo(() => new THREE.Vector3(), [])
  const tempQuat = useMemo(() => new THREE.Quaternion(), [])

  // useFrame para garantir que a tela HTML não aparece quando de costas
  useFrame(({ camera }) => {
    if (!groupRef.current || !screenRef.current) return
    groupRef.current.getWorldQuaternion(tempQuat)
    worldForward.copy(forwardVec).applyQuaternion(tempQuat)
    camera.getWorldDirection(camDir)
    // Se o ângulo entre o vetor normal da tela e a direção da câmera for agudo (aparelho de costas), esconde a tela
    const dot = worldForward.dot(camDir)
    const isFacing = dot < 0.15
    const targetDisplay = isFacing ? 'block' : 'none'
    if (screenRef.current.style.display !== targetDisplay) {
      screenRef.current.style.display = targetDisplay
    }
  })

  // Posições das 3 câmeras em triângulo no módulo traseiro
  const CAM_POSITIONS = useMemo(
    () => [
      { x: 0.105, y: 0.565 }, // Superior
      { x: 0.105, y: 0.415 }, // Inferior
      { x: 0.235, y: 0.49 }, // Direita (centro)
    ],
    [],
  )

  const halfDepth = PHONE_D / 2

  return (
    <group ref={groupRef}>
      {/* 1. Corpo principal (chassi) em titânio */}
      <mesh geometry={bodyGeometry} material={titaniumMaterial} />

      {/* 2. Frente: vidro preto com borda fina */}
      <mesh
        geometry={frontGlassGeometry}
        material={frontGlassMaterial}
        position={[0, 0, halfDepth + 0.0003]}
      />

      {/* 3. Base preta do display sob o HTML */}
      <mesh
        geometry={displayBackingGeometry}
        material={displayBackingMaterial}
        position={[0, 0, halfDepth + 0.0006]}
      />

      {/* 4. Tela HTML escalada exatamente para cobrir o display */}
      <group position={[0, 0, halfDepth + 0.001]}>
        <Html
          transform
          distanceFactor={400}
          scale={DISPLAY_SCALE}
          pointerEvents="none"
          style={{
            pointerEvents: 'none',
          }}
        >
          <div
            ref={screenRef}
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: SCREEN_RADIUS,
              overflow: 'hidden',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: 'none',
              userSelect: 'none',
              position: 'relative',
            }}
          >
            {/* Ilha dinâmica sobre o topo da tela HTML */}
            <div
              style={{
                position: 'absolute',
                top: 13,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 122,
                height: 35,
                borderRadius: 9999,
                backgroundColor: '#000000',
                pointerEvents: 'none',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 13px',
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: '#071626',
                  boxShadow: 'inset 0 0 2px #000',
                }}
              />
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: '#0a0a0e',
                }}
              />
            </div>
            {screen}
          </div>
        </Html>
      </group>

      {/* 5. Ilha frontal em mesh 3D sobre a tela */}
      <mesh
        geometry={islandGeometry}
        material={islandMaterial}
        position={[0, 0.665, halfDepth + 0.0015]}
      />

      {/* 6. Traseira: vidro fosco cinza escuro */}
      <mesh
        geometry={backGlassGeometry}
        material={backGlassMaterial}
        position={[0, 0, -halfDepth - 0.0003]}
        rotation={[0, Math.PI, 0]}
      />

      {/* 7. Módulo de 3 câmeras em triângulo */}
      <group position={[0.17, 0.49, -halfDepth - 0.007]}>
        {/* Plataforma / plateau do módulo com chanfro */}
        <mesh geometry={cameraBumpGeometry} material={cameraBumpMaterial} />

        {/* As 3 câmeras */}
        {CAM_POSITIONS.map((cam, idx) => (
          <group key={idx} position={[cam.x - 0.17, cam.y - 0.49, -0.007]}>
            {/* Anel de titânio */}
            <mesh
              geometry={cameraRingGeometry}
              material={titaniumMaterial}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, -0.006]}
            />
            {/* Bezel frontal do anel em titânio escovado */}
            <mesh
              geometry={cameraRingBezelGeometry}
              material={titaniumMaterial}
              position={[0, 0, -0.0131]}
              rotation={[0, Math.PI, 0]}
            />
            {/* Lente de vidro escuro brilhante */}
            <mesh
              geometry={cameraLensGeometry}
              material={cameraLensMaterial}
              position={[0, 0, -0.012]}
              rotation={[0, Math.PI, 0]}
            />
            {/* Reflexo interno sutil azulado/esverdeado */}
            <mesh
              geometry={cameraReflectionGeometry}
              material={cameraReflectionMaterial}
              position={[0.004, 0.004, -0.011]}
              rotation={[0, Math.PI, 0]}
            />
          </group>
        ))}

        {/* Flash (disco pequeno) */}
        <mesh
          position={[0.05, 0.075, -0.0075]}
          rotation={[0, Math.PI, 0]}
          material={flashMaterial}
        >
          <circleGeometry args={[0.02, 24]} />
        </mesh>

        {/* Microfone traseiro (ponto) */}
        <mesh
          position={[0.065, -0.075, -0.0075]}
          rotation={[0, Math.PI, 0]}
          material={micMaterial}
        >
          <circleGeometry args={[0.006, 16]} />
        </mesh>
      </group>

      {/* 8. Botões laterais em titânio */}
      {/* Botão Power à direita (+X) */}
      <mesh
        geometry={powerButtonGeometry}
        material={titaniumMaterial}
        position={[PHONE_W / 2 + 0.0025, 0.22, 0]}
      />

      {/* Botões de volume e ação à esquerda (-X) */}
      <mesh
        geometry={volumeButtonGeometry}
        material={titaniumMaterial}
        position={[-PHONE_W / 2 - 0.0025, 0.32, 0]}
      />
      <mesh
        geometry={volumeButtonGeometry}
        material={titaniumMaterial}
        position={[-PHONE_W / 2 - 0.0025, 0.19, 0]}
      />
    </group>
  )
})
