import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Grid from './Grid'
import Sun from './Sun'
import { useRef } from 'react'
import * as THREE from 'three'

const CameraAnimation = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  
  useFrame((state) => {
    if (cameraRef.current) {
      // Slow rotation around the scene
      const time = state.clock.getElapsedTime()
      const radius = 50
      const speed = 10
      cameraRef.current.position.x = Math.sin(time * speed) * radius
      cameraRef.current.position.z = Math.cos(time * speed) * radius
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return null
}

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 1.0, 5] }}>
      <CameraAnimation />
      <color attach="background" args={['#111111']} />
      <ambientLight intensity={0.1} />
      <Grid lineWidth={1.5} />
      <Sun />
      <OrbitControls 
        minDistance={3}
        maxDistance={8}
        minPolarAngle={1}
        maxPolarAngle={1.4}
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
        enablePan={false}
      />
    </Canvas>
  )
}

export default Scene 