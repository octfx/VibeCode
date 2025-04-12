import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

const glowRadius = 32;

const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // Create gradient material with synthwave lines
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(0xff1493) },
      color2: { value: new THREE.Color(0xffff00) },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        // Base gradient
        vec3 baseColor = mix(color1, color2, vUv.y);
        
        // Create three horizontal black lines in lower half using view-space position
        float line4 = step(-11.0, vPosition.y) * (1.0 - step(-10.0, vPosition.y));
        float line1 = step(-8.0, vPosition.y) * (1.0 - step(-7.0, vPosition.y));
        float line2 = step(-5.0, vPosition.y) * (1.0 - step(-4.0, vPosition.y));
        float line3 = step(-2.0, vPosition.y) * (1.0 - step(-1.0, vPosition.y));
        
        // Combine lines
        float lines = line1 + line2 + line3 + line4;
        
        // Mix base color with black lines
        vec3 finalColor = mix(baseColor, vec3(0.0), lines);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  // Create glow shader material
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0xff0000) },
      glowIntensity: { value: 0.85 },
      sphereCenter: { value: new THREE.Vector3(0, 8, -50) },
      glowRadius: { value: glowRadius },
      fadeDistance: { value: 20.0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float glowIntensity;
      uniform vec3 sphereCenter;
      uniform float glowRadius;
      uniform float fadeDistance;
      varying vec3 vPosition;

      void main() {
        // Calculate distance from center
        float distanceFromCenter = length(vPosition - sphereCenter);
        
        // Calculate fade based on distance
        // Alpha is 1 at the center and 0 at the edge
        float alpha = smoothstep(glowRadius + fadeDistance, glowRadius, distanceFromCenter);
        
        // Apply glow intensity
        alpha *= glowIntensity;

        gl_FragColor = vec4(glowColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  // Rotate the sun slowly and animate size
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.getElapsedTime()
      
      // Create pulsing animation
      const pulseSpeed = 0.5
      const pulseAmount = 0.2
      const scale = 1.0 + Math.sin(state.clock.getElapsedTime() * pulseSpeed) * pulseAmount
      sunRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={[0, 11.5, -50]}>
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[glowRadius, 64, 64]}>
        <primitive object={glowMaterial} attach="material" />
      </Sphere>

      {/* Sun sphere with animated scale */}
      <Sphere ref={sunRef} args={[15, 128, 128]}>
        <primitive object={material} attach="material" />
      </Sphere>
      
      {/* Multiple glow effects for more intensity */}
      <pointLight
        color={0xff0000}
        intensity={200}
        distance={200}
        decay={1.5}
      />
      <pointLight
        color={0xff3333}
        intensity={1.5}
        distance={150}
        decay={1.2}
      />
    </group>
  )
}

export default Sun 