"use client"

import { useEffect, useRef, useCallback } from "react"
import { Renderer, Triangle, Program, Mesh, Color } from "ogl"

// Move shader strings outside component to prevent recreation on each render
const vertexShader = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`

const fragmentShader = `
    precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  
  // Calculate distance from mouse (normalized coordinates)
  vec2 mouseUv = (uMouse * 2.0 - 1.0) * uResolution.xy / mr;
  float distToMouse = length(uv - mouseUv);
  
  // Use mouse influence instead of just time
  float mouseInfluence = 1.0 / (1.0 + distToMouse * 2.0);
  float d = -uTime * 0.3 + distToMouse * 0.5;
  float a = 0.0;
  
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x) * (0.5 + mouseInfluence * 0.5);
    d += sin(uv.y * i + a) * (0.5 + mouseInfluence * 0.5);
  }
  
  d += uTime * 0.2;
  
  // SPACE COLORS - Alien Nebula Palette
  vec3 infiniteBlack = vec3(0.03, 0.01, 0.06);    // Deep void
  vec3 alienMist = vec3(0.12, 0.35, 0.55);        // Cyan-blue nebula
  vec3 energyCore = vec3(0.85, 0.25, 0.65);       // Hot pink plasma
  
  // Enhanced waves for more cosmic turbulence
  float wave1 = cos(uv.x * 1.5 + d * 0.4 + mouseInfluence * 3.0) * 0.5 + 0.5;
  float wave2 = sin(length(uv) * 2.2 + d * 0.3 + mouseInfluence * 2.0) * 0.5 + 0.5;
  
  float blendFactor1 = mix(wave1, wave2, 0.4 + mouseInfluence * 0.15);
  float blendFactor2 = sin(d * 0.6 + length(uv) * 1.2) * 0.5 + 0.5;
  
  // Sharper transitions for more dramatic space effect
  blendFactor1 = smoothstep(0.15, 0.85, blendFactor1);
  blendFactor2 = smoothstep(0.25, 0.75, blendFactor2);
  
  // Three-way cosmic mixing
  vec3 finalCol;
  if (blendFactor1 < 0.5) {
    finalCol = mix(infiniteBlack, alienMist, blendFactor1 * 2.0);
  } else {
    finalCol = mix(alienMist, energyCore, (blendFactor1 - 0.5) * 2.0);
  }
  
  vec3 secondaryMix = mix(alienMist, mix(infiniteBlack, energyCore, 0.4), blendFactor2);
  finalCol = mix(finalCol, secondaryMix, 0.35);
  
  // Enhanced cosmic variation
  finalCol += sin(vec3(d * 1.2, a * 0.8, d + a * 1.5)) * (0.03 + mouseInfluence * 0.05);
  
  // ✨ SPACE ENHANCEMENT: Add twinkling stars that respond to mouse
  vec2 starUv = uv * 8.0; // Scale for star density
  float stars = 0.0;
  
  // Create multiple layers of stars
  for(float layer = 1.0; layer <= 3.0; layer++) {
    vec2 layerUv = starUv * layer;
    vec2 starId = floor(layerUv);
    vec2 starPos = fract(layerUv) - 0.5;
    
    // Pseudo-random star brightness based on position
    float starSeed = sin(starId.x * 12.9898 + starId.y * 78.233) * 43758.5453;
    float starBrightness = fract(starSeed);
    
    // Only show bright stars (threshold)
    if(starBrightness > 0.85) {
      float starDist = length(starPos);
      float twinkle = sin(uTime + starSeed * 10.0) * 0.5 + 0.5;
      
      // Mouse influence on stars - they brighten near cursor
      float mouseStarInfluence = 1.0 / (1.0 + length(uv - mouseUv) * 5.0);
      
      // Create star with twinkling and mouse interaction
      stars += (1.0 - smoothstep(0.0, 0.02 / layer, starDist)) * 
               twinkle * 
               (0.3 + mouseStarInfluence * 0.7) * 
               (1.0 / layer); // Dimmer for distant layers
    }
  }
  
  // Add stars to the final color
  finalCol += vec3(stars * 0.8, stars * 0.9, stars * 1.0); // Slight blue tint to stars
  
  gl_FragColor = vec4(finalCol, 1.0);
}
`

export default function LiquidBackground({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animateId = useRef<number | null>(null)
  const meshRef = useRef<Mesh | null>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 }) // Normalized mouse position (0-1)
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Normalize mouse position to 0-1 range
    targetMouseRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: 1.0 - (event.clientY - rect.top) / rect.height // Flip Y to match WebGL coordinates
    }
  }, [])

  const resize = () => {
    const container = containerRef.current
    const renderer = rendererRef.current
    const mesh = meshRef.current

    if (!container || !renderer || !mesh) return
    
    const width = container.offsetWidth
    const height = container.offsetHeight
    
    renderer.setSize(width, height)
    
    const canvas = renderer.gl.canvas
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    
    mesh.program.uniforms.uResolution.value = [
      width,
      height,
      width / height,
    ]
  }

  const update = useCallback((t: number) => {
    animateId.current = requestAnimationFrame(update)
    const mesh = meshRef.current
    const renderer = rendererRef.current
    
    if (mesh && renderer) {
      // Smoothly interpolate mouse position for fluid movement
      const lerpFactor = 0.05 // Adjust this for responsiveness (0.01 = slow, 0.1 = fast)
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * lerpFactor
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * lerpFactor
      
      mesh.program.uniforms.uTime.value = t * 0.001
      mesh.program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y]
      renderer.render({ scene: mesh })
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, 2)
    })
    rendererRef.current = renderer
    const gl = renderer.gl
    gl.clearColor(0.176, 0.353, 0.627, 1)

    const canvas = gl.canvas
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '-10'

    container.appendChild(canvas)
    
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove) // Add mouse tracking

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0.3, 0.2, 0.5) },
        uMouse: { value: [0.5, 0.5] }, // Add mouse uniform
        uResolution: {
          value: [window.innerWidth, window.innerHeight, window.innerWidth / window.innerHeight],
        },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    meshRef.current = mesh

    animateId.current = requestAnimationFrame(update)

    return () => {
      if (animateId.current) {
        cancelAnimationFrame(animateId.current)
      }
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove) // Clean up mouse listener
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [handleMouseMove, update])

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 w-screen h-screen -z-10 ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10
      }}
    />
  )
}