import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface RoboProps {
  speaking: boolean;
  listening: boolean;
  /** 0..1 live mouth open amplitude from TTS boundary events */
  mouthOpen?: number;
}

/**
 * AgriRobo — a friendly cyber-farmer with a straw hat, chrome jaw and
 * live lip-sync. The lower jaw + lips drop based on `mouthOpen` so movement
 * is clearly visible while the assistant is speaking.
 */
function FarmerRobotMesh({ speaking, listening, mouthOpen = 0 }: RoboProps) {
  const headRef = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const jawRef = useRef<THREE.Group>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const mouthCavityRef = useRef<THREE.Mesh>(null);
  const tongueRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const antennaTipRef = useRef<THREE.Mesh>(null);
  const blinkTimer = useRef(0);
  const filler = useRef(0); // procedural fill between TTS boundary pulses

  const colors = useMemo(() => ({
    skin: "#e8c9a8",
    skinShade: "#b88665",
    chrome: "#cfd6dc",
    chromeDark: "#5a6671",
    hat: "#d9b56b",
    hatBand: "#1f7a4d",
    tunic: "#0d3a26",
    tunicAccent: "#1f7a4d",
    gold: "#c9a84c",
    leaf: "#34c77a",
    visor: "#0c1f17",
  }), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Idle head & hat bob
    if (headRef.current) {
      headRef.current.position.y = Math.sin(t * 1.2) * 0.04;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      headRef.current.rotation.x = speaking
        ? Math.sin(t * 6) * 0.05
        : THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.08);
    }
    if (hatRef.current) {
      hatRef.current.position.y = Math.sin(t * 1.2) * 0.04 + 0.7;
      hatRef.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    }

    // Arms wave when speaking
    if (leftArmRef.current) {
      const target = speaking ? Math.PI / 6 + Math.sin(t * 5) * 0.3 : Math.PI / 8;
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, target, 0.1);
    }
    if (rightArmRef.current) {
      const target = speaking ? -Math.PI / 6 + Math.sin(t * 5 + 1) * 0.3 : -Math.PI / 8;
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, target, 0.1);
    }

    // Blink
    blinkTimer.current += delta;
    const blink = blinkTimer.current % 4.2 < 0.12 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;

    // ===== LIP SYNC =====
    // Combine the live mouthOpen amplitude (from TTS onboundary) with a fast
    // procedural wobble so syllables read as real mouth motion.
    let open = 0;
    if (speaking) {
      filler.current += delta * 18;
      const wobble = (Math.abs(Math.sin(filler.current)) * 0.45 + Math.abs(Math.sin(filler.current * 1.7)) * 0.25);
      open = THREE.MathUtils.clamp(mouthOpen * 1.1 + wobble * (0.35 + mouthOpen * 0.4), 0, 1);
    }

    // Jaw drops — most visible motion
    if (jawRef.current) {
      const targetJaw = speaking ? -open * 0.18 : 0;
      jawRef.current.rotation.x = THREE.MathUtils.lerp(jawRef.current.rotation.x, targetJaw, 0.45);
      jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, speaking ? -open * 0.06 : 0, 0.4);
    }

    if (upperLipRef.current && lowerLipRef.current && mouthCavityRef.current && tongueRef.current) {
      const upperY = -0.16 + open * 0.04;
      const lowerY = -0.22 - open * 0.14;
      upperLipRef.current.position.y = THREE.MathUtils.lerp(upperLipRef.current.position.y, upperY, 0.45);
      lowerLipRef.current.position.y = THREE.MathUtils.lerp(lowerLipRef.current.position.y, lowerY, 0.45);
      const width = 0.58 + Math.sin(filler.current * 0.7) * 0.05 * (speaking ? 1 : 0);
      upperLipRef.current.scale.x = THREE.MathUtils.lerp(upperLipRef.current.scale.x, width, 0.3);
      lowerLipRef.current.scale.x = THREE.MathUtils.lerp(lowerLipRef.current.scale.x, width, 0.3);

      const cavityY = THREE.MathUtils.lerp(mouthCavityRef.current.scale.y, 0.15 + open * 1.4, 0.45);
      mouthCavityRef.current.scale.y = cavityY;
      mouthCavityRef.current.scale.x = THREE.MathUtils.lerp(mouthCavityRef.current.scale.x, width * 0.95, 0.3);

      tongueRef.current.scale.y = THREE.MathUtils.lerp(tongueRef.current.scale.y, 0.4 + open * 0.6, 0.4);
      const tMat = tongueRef.current.material as THREE.MeshStandardMaterial;
      tMat.opacity = 0.4 + open * 0.5;
    }

    // Antenna glow + ring
    if (antennaTipRef.current) {
      const mat = antennaTipRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = speaking ? 1.4 + open * 1.5 : listening ? 1.6 : 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = speaking ? 0.55 + open * 0.25 : listening ? 0.45 : 0.18;
    }
  });

  const eyeColor = listening ? "#ef4444" : speaking ? "#34c77a" : "#1c2a1f";

  return (
    <Float speed={1.3} rotationIntensity={0.16} floatIntensity={0.3}>
      <group position={[0, -0.4, 0]}>
        {/* Glow ring behind */}
        <mesh ref={ringRef} position={[0, 0.5, -0.7]}>
          <torusGeometry args={[1.35, 0.04, 16, 64]} />
          <meshStandardMaterial color={colors.gold} emissive={colors.gold} emissiveIntensity={2} transparent opacity={0.3} />
        </mesh>

        {/* Tunic body */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.62, 0.6, 8, 16]} />
          <meshStandardMaterial color={colors.tunic} metalness={0.25} roughness={0.55} />
        </mesh>
        {/* Tunic accent stripe */}
        <mesh position={[0, -0.5, 0.55]}>
          <boxGeometry args={[0.08, 0.7, 0.02]} />
          <meshStandardMaterial color={colors.gold} emissive={colors.gold} emissiveIntensity={0.5} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, -0.05, 0]}>
          <torusGeometry args={[0.45, 0.05, 12, 32]} />
          <meshStandardMaterial color={colors.gold} metalness={0.7} roughness={0.25} emissive={colors.gold} emissiveIntensity={0.3} />
        </mesh>
        {/* Chest leaf badge */}
        <mesh position={[0.22, -0.35, 0.58]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.09, 0.2, 12]} />
          <meshStandardMaterial color={colors.leaf} emissive={colors.leaf} emissiveIntensity={0.5} />
        </mesh>

        {/* Arms */}
        <mesh ref={leftArmRef} position={[-0.74, -0.3, 0]} rotation={[0, 0, Math.PI / 8]}>
          <capsuleGeometry args={[0.11, 0.55, 8, 16]} />
          <meshStandardMaterial color={colors.chrome} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.74, -0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <capsuleGeometry args={[0.11, 0.55, 8, 16]} />
          <meshStandardMaterial color={colors.chrome} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Head group */}
        <group ref={headRef} position={[0, 0.55, 0]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.52, 32, 32]} />
            <meshStandardMaterial color={colors.skin} roughness={0.55} metalness={0.08} />
          </mesh>

          {/* Cyber visor band across the eyes */}
          <mesh position={[0, 0.1, 0.36]}>
            <boxGeometry args={[0.95, 0.22, 0.18]} />
            <meshStandardMaterial color={colors.visor} metalness={0.7} roughness={0.2} emissive={colors.tunicAccent} emissiveIntensity={0.35} />
          </mesh>

          {/* Eyes (pupils on visor) */}
          <mesh ref={leftEyeRef} position={[-0.18, 0.1, 0.47]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={listening || speaking ? 1.6 : 0.8} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.18, 0.1, 0.47]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={listening || speaking ? 1.6 : 0.8} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.04, 0.5]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={colors.skinShade} />
          </mesh>

          {/* Moustache */}
          <mesh position={[0, -0.12, 0.47]}>
            <boxGeometry args={[0.26, 0.04, 0.04]} />
            <meshStandardMaterial color="#3a2418" roughness={0.9} />
          </mesh>

          {/* JAW group — drops while speaking */}
          <group ref={jawRef} position={[0, -0.12, 0]}>
            {/* Chrome chin plate */}
            <mesh position={[0, -0.22, 0.32]}>
              <boxGeometry args={[0.5, 0.28, 0.3]} />
              <meshStandardMaterial color={colors.chrome} metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Mouth cavity */}
            <mesh ref={mouthCavityRef} position={[0, -0.1, 0.46]}>
              <boxGeometry args={[0.28, 0.14, 0.04]} />
              <meshStandardMaterial color="#1a0707" />
            </mesh>
            {/* Tongue hint */}
            <mesh ref={tongueRef} position={[0, -0.16, 0.47]}>
              <boxGeometry args={[0.18, 0.05, 0.02]} />
              <meshStandardMaterial color="#c14a55" transparent opacity={0.4} />
            </mesh>
            {/* Upper lip */}
            <mesh ref={upperLipRef} position={[0, -0.04, 0.49]}>
              <boxGeometry args={[0.3, 0.035, 0.04]} />
              <meshStandardMaterial color="#a44535" roughness={0.5} />
            </mesh>
            {/* Lower lip */}
            <mesh ref={lowerLipRef} position={[0, -0.1, 0.49]}>
              <boxGeometry args={[0.3, 0.05, 0.045]} />
              <meshStandardMaterial color="#b85847" roughness={0.5} />
            </mesh>
          </group>

          {/* Chrome ears with bolts */}
          <mesh position={[-0.52, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.chrome} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.52, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
            <meshStandardMaterial color={colors.chrome} metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color={colors.chromeDark} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh ref={antennaTipRef} position={[0, 0.74, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={colors.leaf} emissive={colors.leaf} emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* STRAW HAT */}
        <group ref={hatRef} position={[0, 0.7, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.75, 0.82, 0.05, 32]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.36, 0.44, 0.4, 32]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.hat} roughness={0.85} />
          </mesh>
          {/* Green ribbon */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.445, 0.445, 0.07, 32]} />
            <meshStandardMaterial color={colors.hatBand} roughness={0.6} emissive={colors.hatBand} emissiveIntensity={0.2} />
          </mesh>
          {/* Leaf */}
          <mesh position={[0.3, 0.08, 0.3]} rotation={[0, 0.3, Math.PI / 4]}>
            <coneGeometry args={[0.07, 0.2, 12]} />
            <meshStandardMaterial color={colors.leaf} emissive={colors.leaf} emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

const RoboAvatar = ({ speaking, listening, mouthOpen = 0 }: RoboProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 3.3], fov: 40 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#a7f3d0" />
      <pointLight position={[0, 1, 2]} intensity={0.8} color="#fde68a" />
      <FarmerRobotMesh speaking={speaking} listening={listening} mouthOpen={mouthOpen} />
    </Canvas>
  );
};

export default RoboAvatar;
