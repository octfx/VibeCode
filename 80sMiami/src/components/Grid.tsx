import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface GridProps {
  lineWidth?: number
}

const Grid = ({ lineWidth = 1.5 }: GridProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create shader material for infinite grid
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }, // Initialize time uniform
      color: { value: new THREE.Color(0x00ffff) }, // Neon blue
      gridSize: { value: 150 },
      lineWidth: { value: lineWidth },
      glowIntensity: { value: 2.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vDepth = position.z + 45.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float gridSize;
      uniform float lineWidth;
      uniform float glowIntensity;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        // Grid UV mapping
        vec2 uv = vUv * gridSize;
        
        // Create wave patterns
        float waveSpeed1 = 0.3;
        float waveSpeed2 = 0.5;
        float waveSpeed3 = 0.7;
        
        // Create multiple wave patterns with different frequencies and phases
        float wave1 = sin(uv.x * 0.5 + time * waveSpeed1) * 2.0;
        float wave2 = sin(uv.y * 0.3 + time * waveSpeed2) * 0.3;
        float wave3 = sin((uv.x + uv.y) * 0.2 + time * waveSpeed3) * 1.5;
        
        // Combine waves with weighted sum
        float waveOffset = wave1 * 0.5 + wave2 * 0.2 + wave3 * 0.3;
        
        // Combine flowing animation with waves
        float flowSpeed = 0.5;
        vec2 animatedUv = uv + vec2(0.0, time * flowSpeed + waveOffset);
        vec2 grid = abs(fract(animatedUv - 0.5) - 0.5) / fwidth(uv) / lineWidth;
        
        // Grid pattern
        float line = min(grid.x, grid.y);
        
        // Depth-based intensity fade
        float depthFade = smoothstep(0.0, 1.0, abs(vDepth) / 50.0);
        float intensity = mix(1.0, 0.2, depthFade);
        
        // Glow effect with depth-based intensity
        float glow = smoothstep(0.0, 1.0, 1.0 - line) * glowIntensity * intensity;
        
        gl_FragColor = vec4(color * glow, 1.0);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  // Animate the grid
  useFrame((state) => {
    material.uniforms.time.value = state.clock.getElapsedTime(); // Dynamically update time uniform
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Increased subdivisions for better detail */}
        <planeGeometry args={[1000, 1000, 100, 100]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
};

export default Grid;
