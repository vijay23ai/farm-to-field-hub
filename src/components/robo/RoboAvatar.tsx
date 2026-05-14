import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface RoboProps {
  speaking: boolean;
  listening: boolean;
}

function RobotMesh({ speaking, listening }: RoboProps) {
  const headRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const blinkTimer = useRef(0);

  // Read CSS variables for theme colors
  const colors = useMemo(() => {
    if (typeof window === "undefined") {
      return { primary: "#22c55e", accent: "#eab308", body: "#f1f5f9" };
    }
    const styles = getComputedStyle(document.documentElement);
    const hsl = (name: string, fallback: string) => {
      const raw = styles.getPropertyValue(name).trim();
      return raw ? `hsl(${raw})` : fallback;
    };
    return {
      primary: hsl("--primary", "#22c55e"),
      accent: hsl("--accent", "#eab308"),
      body: "#f5f5f0",
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (headRef.current) {
      // Idle bob
      headRef.current.position.y = Math.sin(t * 1.2) * 0.05;
      // Slight head turn
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.15;

      // Speaking: nod a bit
      if (speaking) {
        headRef.current.rotation.x = Math.sin(t * 8) * 0.05;
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.1);
      }
    }

    // Antenna pulse
    if (antennaRef.current) {
      const mat = antennaRef.current.material as THREE.MeshStandardMaterial;
      const intensity = speaking ? 1.5 + Math.sin(t * 10) * 0.8 : listening ? 1 + Math.sin(t * 4) * 0.5 : 0.3;
      mat.emissiveIntensity = intensity;
    }

    // Blink
    blinkTimer.current += delta;
    const blink = blinkTimer.current % 4 < 0.15 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;

    // Mouth animation when speaking
    if (mouthRef.current) {
      const target = speaking ? 0.2 + Math.abs(Math.sin(t * 14)) * 0.5 : 0.15;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, target, 0.4);
    }

    // Glow ring
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = speaking ? 0.6 : listening ? 0.4 : 0.15;
    }
  });

  const eyeColor = listening ? "#ef4444" : speaking ? colors.accent : "#10b981";

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={[0, -0.3, 0]}>
        {/* Glow ring behind the robot */}
        <mesh ref={ringRef} position={[0, 0.5, -0.5]}>
          <torusGeometry args={[1.2, 0.04, 16, 64]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={2}
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* Body */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.55, 0.6, 8, 16]} />
          <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Chest panel */}
        <mesh position={[0, -0.4, 0.5]}>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={speaking ? 0.8 : 0.3}
          />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.7, -0.3, 0]} rotation={[0, 0, Math.PI / 8]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.7, -0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.5} />
        </mesh>

        {/* Head group (animates) */}
        <group ref={headRef} position={[0, 0.55, 0]}>
          {/* Head */}
          <mesh castShadow>
            <boxGeometry args={[0.95, 0.85, 0.85]} />
            <meshStandardMaterial color={colors.body} metalness={0.2} roughness={0.3} />
          </mesh>

          {/* Visor / face plate */}
          <mesh position={[0, 0.05, 0.43]}>
            <boxGeometry args={[0.75, 0.5, 0.02]} />
            <meshStandardMaterial
              color="#0f172a"
              metalness={0.9}
              roughness={0.1}
              emissive="#0f172a"
            />
          </mesh>

          {/* Eyes */}
          <mesh ref={leftEyeRef} position={[-0.18, 0.1, 0.45]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1.5} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.18, 0.1, 0.45]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1.5} />
          </mesh>

          {/* Mouth bar */}
          <mesh ref={mouthRef} position={[0, -0.15, 0.45]}>
            <boxGeometry args={[0.3, 0.06, 0.02]} />
            <meshStandardMaterial
              color={colors.accent}
              emissive={colors.accent}
              emissiveIntensity={1}
            />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial color={colors.primary} metalness={0.5} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial color={colors.primary} metalness={0.5} />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh ref={antennaRef} position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={colors.accent}
              emissive={colors.accent}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

const RoboAvatar = ({ speaking, listening }: RoboProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 3.4], fov: 40 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#a7f3d0" />
      <pointLight position={[0, 1, 2]} intensity={0.6} color="#fde68a" />
      <RobotMesh speaking={speaking} listening={listening} />
    </Canvas>
  );
};

export default RoboAvatar;