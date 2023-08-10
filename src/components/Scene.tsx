import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Spinner } from 'react-bootstrap';

interface Props {
  filePath: string,
  scene: THREE.Scene | null,
  gltf: THREE.Object3D | null,
  setScene: React.Dispatch<React.SetStateAction<THREE.Scene | null>>
  setGltf: React.Dispatch<React.SetStateAction<THREE.Object3D | null>>
}

const Scene = ({
  filePath,
  scene,
  gltf,
  setScene,
  setGltf
}: Props) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createScene: Function = (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;

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

    new OrbitControls(
      tCamera,
      tRenderer.domElement
    );

    const light: THREE.AmbientLight = new THREE.AmbientLight(0xffffff);
    tScene.add(light);
  }

  const animate = (): void => {
    requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }

  const importGltf: Function = (path: string) => {
    setIsLoading(true);

    const loader: GLTFLoader = new GLTFLoader();

    loader.load(path, (gltf) => {
      if (!scene) return;
      const box: THREE.Box3 = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x += (gltf.scene.position.x - center.x);
      gltf.scene.position.y += (gltf.scene.position.y - center.y);
      gltf.scene.position.z += (gltf.scene.position.z - center.z);
      scene.add(gltf.scene);
      setGltf(gltf.scene);
      URL.revokeObjectURL(path);

      setIsLoading(false);
    });
  }

  useEffect(() => {
    const abortCont: AbortController = new AbortController();
    if (filePath !== '') {
      importGltf(filePath);
    }
    return () => abortCont.abort();
  }, [filePath]);

  useEffect(() => {
    createScene();
  }, []);

  useEffect(() => {
    if (scene && renderer && camera) {
      window.addEventListener('resize', () => {
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;
        if (renderer && camera) {
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      });
      animate();
    }
  }, [scene, camera, renderer]);

  return (
    <div className="scene">
      <div>
        {isLoading && <Spinner className="position-absolute start-50 top-50"></Spinner>}
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
 
export default Scene;