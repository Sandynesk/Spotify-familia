'use client'

import { forwardRef, memo, useMemo } from 'react'
import * as THREE from 'three'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from '../screens/size'

export const PHONE_W = 0.715
export const PHONE_H = 1.496
export const PHONE_D = 0.0825
export const PHONE_RADIUS = 0.105

/** Dimensões exatas do display no modelo 3D (1 unid = 100 mm) */
export const DISPLAY_W = 0.676
export const DISPLAY_H = DISPLAY_W * (SCREEN_H / SCREEN_W) // ≈ 1.46293
export const DISPLAY_RADIUS = DISPLAY_W * (SCREEN_RADIUS / SCREEN_W) // ≈ 0.0936
export const DISPLAY_Z = PHONE_D / 2 + 0.0006 // ≈ 0.04185 (plano frontal do display)

export interface PhoneModelProps {
  /** Aceito para compatibilidade de assinatura */
  screen?: React.ReactNode
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
export const PhoneModel = memo(
  forwardRef<THREE.Group, PhoneModelProps>(function PhoneModel(_props, ref) {
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
    }, [])

    // 2. Geometria do vidro frontal (borda preta fina de ~1,5 mm)
    const frontGlassGeometry = useMemo(() => {
      const shape = createRoundedRectShape(PHONE_W - 0.005, PHONE_H - 0.005, PHONE_RADIUS - 0.002)
      const geom = new THREE.ShapeGeometry(shape, 24)
      geom.center()
      return geom
    }, [])

    // 3. Geometria da base do display
    const displayBackingGeometry = useMemo(() => {
      const shape = createRoundedRectShape(DISPLAY_W, DISPLAY_H, DISPLAY_RADIUS)
      const geom = new THREE.ShapeGeometry(shape, 24)
      geom.center()
      return geom
    }, [])

    // 4. Geometria da traseira em vidro fosco
    const backGlassGeometry = useMemo(() => {
      const shape = createRoundedRectShape(PHONE_W - 0.006, PHONE_H - 0.006, PHONE_RADIUS - 0.003)
      const geom = new THREE.ShapeGeometry(shape, 24)
      geom.center()
      return geom
    }, [])

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

    // Botões laterais
    const powerButtonGeometry = useMemo(() => {
      return new THREE.BoxGeometry(0.006, 0.16, 0.032)
    }, [])

    const volumeButtonGeometry = useMemo(() => {
      return new THREE.BoxGeometry(0.006, 0.10, 0.032)
    }, [])

    // Materiais memorizados com leitura otimizada e envMapIntensity ajustado
    const titaniumMaterial = useMemo(() => {
      return new THREE.MeshPhysicalMaterial({
        color: '#6e6e76',
        metalness: 1.0,
        roughness: 0.25,
        clearcoat: 0.15,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.6,
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
        color: '#323238',
        roughness: 0.38,
        metalness: 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        envMapIntensity: 1.4,
      })
    }, [])

    const cameraBumpMaterial = useMemo(() => {
      return new THREE.MeshPhysicalMaterial({
        color: '#2a2a30',
        roughness: 0.25,
        metalness: 0.2,
        clearcoat: 0.8,
        envMapIntensity: 1.5,
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
      <group ref={ref}>
        {/* 1. Corpo principal (chassi) em titânio */}
        <mesh geometry={bodyGeometry} material={titaniumMaterial} />

        {/* 2. Frente: vidro preto com borda fina */}
        <mesh
          geometry={frontGlassGeometry}
          material={frontGlassMaterial}
          position={[0, 0, halfDepth + 0.0003]}
        />

        {/* 3. Base preta do display */}
        <mesh
          geometry={displayBackingGeometry}
          material={displayBackingMaterial}
          position={[0, 0, DISPLAY_Z]}
        />

        {/* 4. Traseira: vidro fosco cinza escuro com reflexo visível */}
        <mesh
          geometry={backGlassGeometry}
          material={backGlassMaterial}
          position={[0, 0, -halfDepth - 0.0003]}
          rotation={[0, Math.PI, 0]}
        />

        {/* 5. Módulo de 3 câmeras em triângulo */}
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

        {/* 6. Botões laterais em titânio */}
        {/* Botão Power à direita (+X) */}
        <mesh
          geometry={powerButtonGeometry}
          material={titaniumMaterial}
          position={[PHONE_W / 2 + 0.0025, 0.22, 0]}
        />

        {/* Botões de volume à esquerda (-X) */}
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
  }),
)
