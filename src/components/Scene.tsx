import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Props {
  file: string
}

const Scene = ({ file }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width: number = window.innerWidth;
  const height: number = window.innerHeight;

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);

  const createScene: Function = (): void => {
    const tScene: THREE.Scene = new THREE.Scene();
    setScene(tScene);

    const tCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    setCamera(tCamera);
    tCamera.position.z = 10;

    const tRenderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      alpha: true
    });
    setRenderer(tRenderer);
    tRenderer.setClearColor(0x000000, 0);
    tRenderer.setSize(width, height);
    document.body.appendChild(tRenderer.domElement);

    new OrbitControls(
      tCamera,
      canvasRef.current!
    );

    const light: THREE.AmbientLight = new THREE.AmbientLight(0x404040);
    tScene.add(light);
  }

  const animate = (): void => {
    requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }

  const importGltf: Function = (filePath: string) => {
    const loader: GLTFLoader = new GLTFLoader();

    loader.load(filePath, (gltf) => {
      if (!scene) return;
      const box: THREE.Box3 = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x += (gltf.scene.position.x - center.x);
      gltf.scene.position.y += (gltf.scene.position.y - center.y);
      gltf.scene.position.z += (gltf.scene.position.z - center.z);
      scene.add(gltf.scene);
      URL.revokeObjectURL(filePath);
    });
  }

  useEffect(() => {
    const abortCont: AbortController = new AbortController();
    if (file !== '') {
      importGltf(file);
    }
    return () => abortCont.abort();
  }, [file]);

  useEffect(() => {
    createScene();
  }, []);

  useEffect(() => {
    if (scene && renderer && camera) {
      animate();
    }
  }, [scene, camera, renderer]);

  return (
    <div className="scene">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
 
export default Scene;