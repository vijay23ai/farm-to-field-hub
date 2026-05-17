import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface RoboProps {
  speaking: boolean;
  listening: boolean;
}

/**
 * Farmer-Robo avatar — a friendly cybernetic farmer with a straw hat,
 * green tunic, and pronounced lip-sync mouth movement.
 */
function FarmerRobotMesh({ speaking, listening }: RoboProps) {
  const headRef = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const mouthCavityRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const blinkTimer = useRef(0);
  const lipPhase = useRef(0);

  const colors = useMemo(() => ({
    skin: "#e8c9a8",        // warm farmer skin tone
    skinShade: "#c79a78",
    hat: "#d9b56b",         // straw / wheat gold
    hatBand: "#3a6b3a",     // dark green ribbon
    tunic: "#1f7a4d",       // emerald tunic
    tunicTrim: "#c9a84c",   // gold trim
    leaf: "#34c77a",
    cream: "#f5f0e0",
  }), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Idle head & hat bob
    if (headRef.current) {
      headRef.current.position.y = Math.sin(t * 1.2) * 0.04;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.18;
      headRef.current.rotation.x = speaking
        ? Math.sin(t * 7) * 0.06
        : THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.08);
    }
    if (hatRef.current) {
      hatRef.current.position.y = Math.sin(t * 1.2) * 0.04 + 0.62;
      hatRef.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    }

    // Arms — gentle waving when speaking
    if (leftArmRef.current) {
      const target = speaking ? Math.PI / 6 + Math.sin(t * 5) * 0.25 : Math.PI / 8;
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, target, 0.1);
    }
    if (rightArmRef.current) {
      const target = speaking ? -Math.PI / 6 + Math.sin(t * 5 + 1) * 0.25 : -Math.PI / 8;
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, target, 0.1);
    }

    // Blinking
    blinkTimer.current += delta;
    const blink = blinkTimer.current % 4.2 < 0.12 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;

    // LIP-SYNC — pronounced two-lip animation
    if (upperLipRef.current && lowerLipRef.current && mouthCavityRef.current) {
      if (speaking) {
        lipPhase.current += delta * 14;
        // Multi-frequency mouth shape for natural speech feel
        const open = (Math.abs(Math.sin(lipPhase.current)) * 0.6 + Math.abs(Math.sin(lipPhase.current * 1.7)) * 0.4);
        const width = 0.55 + Math.sin(lipPhase.current * 0.8) * 0.08;
        const targetGap = 0.05 + open * 0.18;

        upperLipRef.current.position.y = THREE.MathUtils.lerp(upperLipRef.current.position.y, -0.16 + targetGap * 0.45, 0.5);
        lowerLipRef.current.position.y = THREE.MathUtils.lerp(lowerLipRef.current.position.y, -0.16 - targetGap * 0.55, 0.5);
        upperLipRef.current.scale.x = THREE.MathUtils.lerp(upperLipRef.current.scale.x, width, 0.4);
        lowerLipRef.current.scale.x = THREE.MathUtils.lerp(lowerLipRef.current.scale.x, width, 0.4);

        const cavityScale = 0.3 + open * 0.9;
        mouthCavityRef.current.scale.y = THREE.MathUtils.lerp(mouthCavityRef.current.scale.y, cavityScale, 0.5);
        mouthCavityRef.current.scale.x = THREE.MathUtils.lerp(mouthCavityRef.current.scale.x, width * 0.95, 0.4);
      } else {
        // Closed / smile rest pose
        upperLipRef.current.position.y = THREE.MathUtils.lerp(upperLipRef.current.position.y, -0.155, 0.2);
        lowerLipRef.current.position.y = THREE.MathUtils.lerp(lowerLipRef.current.position.y, -0.18, 0.2);
        upperLipRef.current.scale.x = THREE.MathUtils.lerp(upperLipRef.current.scale.x, 0.55, 0.15);
        lowerLipRef.current.scale.x = THREE.MathUtils.lerp(lowerLipRef.current.scale.x, 0.55, 0.15);
        mouthCavityRef.current.scale.y = THREE.MathUtils.lerp(mouthCavityRef.current.scale.y, 0.05, 0.2);
      }
    }

    // Glow ring
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = speaking ? 0.55 : listening ? 0.4 : 0.18;
    }
  });

  const eyeColor = listening ? "#ef4444" : "#1c2a1f";

  return (
    <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.35}>
      <group position={[0, -0.35, 0]}>
        {/* Glow ring behind */}
        <mesh ref={ringRef} position={[0, 0.5, -0.6]}>
          <torusGeometry args={[1.25, 0.035, 16, 64]} />
          <meshStandardMaterial
            color={colors.tunicTrim}
            emissive={colors.tunicTrim}
            emissiveIntensity={1.8}
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* Tunic body */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.6, 0.55, 8, 16]} />
          <meshStandardMaterial color={colors.tunic} metalness={0.15} roughness={0.7} />
        </mesh>

        {/* Gold trim collar */}
        <mesh position={[0, -0.05, 0]}>
          <torusGeometry args={[0.42, 0.045, 12, 32]} />
          <meshStandardMaterial color={colors.tunicTrim} metalness={0.6} roughness={0.3} emissive={colors.tunicTrim} emissiveIntensity={0.25} />
        </mesh>

        {/* Leaf badge on chest */}
        <mesh position={[0, -0.4, 0.55]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.1, 0.22, 12]} />
          <meshStandardMaterial color={colors.leaf} emissive={colors.leaf} emissiveIntensity={0.4} />
        </mesh>

        {/* Arms (farmer in skin tone) */}
        <mesh ref={leftArmRef} position={[-0.72, -0.3, 0]} rotation={[0, 0, Math.PI / 8]}>
          <capsuleGeometry args={[0.11, 0.55, 8, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.7} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.72, -0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <capsuleGeometry args={[0.11, 0.55, 8, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.7} />
        </mesh>

        {/* Head group */}
        <group ref={headRef} position={[0, 0.5, 0]}>
          {/* Head — rounded human-ish */}
          <mesh castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={colors.skin} roughness={0.6} metalness={0.05} />
          </mesh>

          {/* Cheeks (subtle blush) */}
          <mesh position={[-0.28, -0.05, 0.36]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#e89a8a" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0.28, -0.05, 0.36]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#e89a8a" transparent opacity={0.45} />
          </mesh>

          {/* Eyes — white sclera */}
          <mesh position={[-0.18, 0.08, 0.42]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#fdfaf2" />
          </mesh>
          <mesh position={[0.18, 0.08, 0.42]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#fdfaf2" />
          </mesh>

          {/* Pupils */}
          <mesh ref={leftEyeRef} position={[-0.18, 0.08, 0.49]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={eyeColor} emissive={listening ? eyeColor : "#000"} emissiveIntensity={listening ? 1.3 : 0} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.18, 0.08, 0.49]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={eyeColor} emissive={listening ? eyeColor : "#000"} emissiveIntensity={listening ? 1.3 : 0} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.03, 0.48]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={colors.skinShade} />
          </mesh>

          {/* Moustache — farmer touch */}
          <mesh position={[0, -0.11, 0.45]}>
            <boxGeometry args={[0.22, 0.04, 0.04]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>

          {/* Mouth cavity (dark inside) */}
          <mesh ref={mouthCavityRef} position={[0, -0.17, 0.43]}>
            <boxGeometry args={[0.22, 0.12, 0.02]} />
            <meshStandardMaterial color="#2a0d0d" />
          </mesh>

          {/* Upper lip */}
          <mesh ref={upperLipRef} position={[0, -0.155, 0.46]}>
            <boxGeometry args={[0.25, 0.03, 0.03]} />
            <meshStandardMaterial color="#a64b3a" roughness={0.5} />
          </mesh>
          {/* Lower lip */}
          <mesh ref={lowerLipRef} position={[0, -0.18, 0.46]}>
            <boxGeometry args={[0.25, 0.04, 0.035]} />
            <meshStandardMaterial color="#b85847" roughness={0.5} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.5, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
        </group>

        {/* STRAW HAT — sits above and floats with head */}
        <group ref={hatRef} position={[0, 0.62, 0]}>
          {/* Hat brim */}
          <mesh castShadow>
            <cylinderGeometry args={[0.72, 0.78, 0.04, 32]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          {/* Hat crown */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.34, 0.42, 0.36, 32]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          {/* Hat top dome */}
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          {/* Green ribbon band */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.425, 0.425, 0.06, 32]} />
            <meshStandardMaterial color={colors.hatBand} roughness={0.6} />
          </mesh>
          {/* Tiny leaf tucked in band */}
          <mesh position={[0.28, 0.06, 0.3]} rotation={[0, 0.3, Math.PI / 4]}>
            <coneGeometry args={[0.07, 0.18, 12]} />
            <meshStandardMaterial color={colors.leaf} emissive={colors.leaf} emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

const RoboAvatar = ({ speaking, listening }: RoboProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0.45, 3.4], fov: 40 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#a7f3d0" />
      <pointLight position={[0, 1, 2]} intensity={0.7} color="#fde68a" />
      <FarmerRobotMesh speaking={speaking} listening={listening} />
    </Canvas>
  );
};

export default RoboAvatar;
