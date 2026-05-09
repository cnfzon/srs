"use client";

import React, { Suspense, useRef } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, AsciiRenderer, Center, Stage } from "@react-three/drei";
import * as THREE from "three";

function GripperModel() {
  const { scene } = useGLTF("/models/gripper.glb");
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={1.6} // 稍微加大基礎尺寸，強化震撼感
    />
  );
}

export default function GripperScene() {
  return (
    <Canvas 
      shadows={false}
      // 1. 將 FOV 調整回較自然的數值（例如 35），放大時會更有立體透視感
      camera={{ position: [4, 4, 4], fov: 35 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: false }}
    >
      <color attach="background" args={["black"]} />
      
      <Suspense fallback={null}>
        <Stage 
          environment="city" 
          intensity={0.5} 
          shadows={false} 
          adjustCamera={0.5} // 讓初始視角就靠得非常近
        >
          {/* 2. 保持偏移補償以應對側邊欄影響，確保視窗中央視覺置中 */}
          <Center top position={[-0.5, 0, 0]}>
            <GripperModel />
          </Center>
        </Stage>
      </Suspense>

      {/* 3. 關鍵修正：將 minDistance 設得非常小，解除縮放限制 */}
      <OrbitControls 
        enablePan={false} 
        makeDefault 
        minDistance={0.1} // 解除限制，讓你可以「貼」在模型上看細節
        maxDistance={20} 
      />

      <AsciiRenderer 
        fgColor="white" 
        bgColor="transparent" 
        // 增加字元密度，讓近看時細節更豐富
        characters=" .:-+*=%@#$MW" 
        invert={false}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/gripper.glb");