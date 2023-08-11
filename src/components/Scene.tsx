import { MouseEventHandler, PointerEventHandler, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Spinner } from 'react-bootstrap';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

interface Props {
  filePath: string,
  scene: THREE.Scene | null,
  gltf: THREE.Object3D | null,
  setScene: React.Dispatch<React.SetStateAction<THREE.Scene | null>>,
  setGltf: React.Dispatch<React.SetStateAction<THREE.Object3D | null>>,
  setSelectedMesh: React.Dispatch<React.SetStateAction<THREE.Mesh | null>>,
  setIsMergeObject: React.Dispatch<React.SetStateAction<boolean>>,
  isMergeObject: boolean
}

const Scene = ({
  filePath,
  scene,
  gltf,
  setScene,
  setGltf,
  setSelectedMesh,
  setIsMergeObject,
  isMergeObject
}: Props) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [raycaster, setRayCaster] = useState<THREE.Raycaster | null>(null);
  const [pointer, setPointer] = useState<THREE.Vector2 | null>(null);
  const [idRaycasterRender, setIdRaycasterRender] =
    useState<number | null>(null);
  const [overedMesh, setOveredMesh] = useState<THREE.Mesh | null>(null);

  const createScene: Function = (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;

    const tRaycaster: THREE.Raycaster = new THREE.Raycaster();
    setRayCaster(tRaycaster);

    const tPointer: THREE.Vector2 = new THREE.Vector2();
    setPointer(tPointer);

    const tScene: THREE.Scene = new THREE.Scene();
    setScene(tScene);

    const tCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
    setCamera(tCamera);
    tCamera.position.z = 1;

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

    const light: THREE.AmbientLight = new THREE.AmbientLight(0xbdbdbd);
    tScene.add(light);
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(1, 1, 1);
    tScene.add(pointLight);
  }

  const animate = (): void => {
    requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }

  const handleRaycasterRender = (): void => {
    if (raycaster && pointer && camera && gltf && renderer && scene) {
      raycaster.setFromCamera(pointer, camera);
      const intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[] =
        raycaster.intersectObjects(gltf.children, true);
      gltf.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const mesh: any = node as THREE.Mesh;
          if (mesh.material) {
            mesh.material.emissive = new THREE.Color(0x000000);
          }
        }
      })
      for (let elmt of intersects) {
        if (elmt.object instanceof THREE.Mesh) {
          const mesh: any = elmt.object as THREE.Mesh;
          if (mesh.material) {
            mesh.material.emissive = new THREE.Color(0x0080ff);
          }
          setOveredMesh(mesh);
          break;
        }
      }
      renderer.render(scene, camera);
      setIdRaycasterRender(requestAnimationFrame(handleRaycasterRender));
    }
  }

  const importGltf: Function = (path: string) => {
    setIsLoading(true);

    const loader: GLTFLoader = new GLTFLoader();

    loader.load(path, (gltf) => {
      if (!scene) return;
      normalizeObject(gltf.scene); 
      scene.add(gltf.scene);
      setGltf(gltf.scene);
      URL.revokeObjectURL(path);
      setIsLoading(false);
    });
  }

  const mergeGltf: Function = () => {
    if (!gltf || !scene) return;

    for (let test of gltf.children) {
      flattenHierarchy(test, null);
    }

    const allGeo: Array<THREE.BufferGeometry> = [];
    const transforms: Array<THREE.Matrix4> = [];
    gltf.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const transform: THREE.Matrix4 = new THREE.Matrix4().compose(
          node.position.clone(),
          node.quaternion.clone(),
          node.scale.clone()
        );
        transforms.push(transform);
        allGeo.push(node.geometry);
      }
    });
    const singleGeo: THREE.BufferGeometry = BufferGeometryUtils.mergeGeometries(allGeo, false);
    const singleAttribute = BufferGeometryUtils.mergeAttributes(allGeo.map((geom, index) => {
      const transform = transforms[index];
      const positions = geom.attributes.position.clone();
      positions.applyMatrix4(transform);
      return positions;
    }));
    singleGeo.computeVertexNormals();
    singleGeo.setAttribute('position', singleAttribute);
    const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: 0xbdbdbd,
      flatShading: true
    });
    const singleObject = new THREE.Mesh(singleGeo, material);
    normalizeObject(singleObject);

    scene.remove(gltf);
    scene.add(singleObject);
    setGltf(singleObject);
  }

  const normalizeObject: Function = (object: THREE.Object3D) => {
      //update scale
      const targetSize: number = 1.5;
      const modelBoundingBox: THREE.Box3 =
        new THREE.Box3().setFromObject(object);
      const modelSize: THREE.Vector3 = new THREE.Vector3();
      modelBoundingBox.getSize(modelSize);
      const scaleFactor: number = targetSize / modelSize.length();
      object.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // center the object
      const box: THREE.Box3 = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.x += (object.position.x - center.x);
      object.position.y += (object.position.y - center.y);
      object.position.z += (object.position.z - center.z);
  }

  const flattenHierarchy: Function = (
    object: THREE.Object3D,
    parentMatrix: THREE.Matrix4
  ) => {
    const matrix: THREE.Matrix4 = new THREE.Matrix4().compose(
      object.position.clone(),
      object.quaternion.clone(),
      object.scale.clone()
    );
    if (parentMatrix) {
      matrix.multiplyMatrices(parentMatrix, matrix);
    }

    for (let child of object.children) {
      flattenHierarchy(child, matrix);
    }

    if (object instanceof THREE.Mesh) {
      // reapplique la nouvelle matrice sur l'objet
      object.geometry.applyMatrix4(matrix);
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
      object.updateMatrix();
    }
  }

  const handleOnClick: MouseEventHandler<HTMLCanvasElement> = (
    e: React.MouseEvent
  ) => {
    if (overedMesh) {
      setSelectedMesh(overedMesh);
    }
  }

  const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (
    e: React.PointerEvent
  ) => {
    if (!pointer) return;
    pointer.setX((e.clientX / window.innerWidth) * 2 - 1);
    pointer.setY(-((e.clientY / window.innerHeight) * 2 - 1));
  }

  useEffect(() => {
    if (gltf && !isMergeObject) {
      handleRaycasterRender();
    } else if (idRaycasterRender) {
      cancelAnimationFrame(idRaycasterRender);
      setIdRaycasterRender(null);
    }
  }, [gltf]);

  useEffect(() => {
    const abortCont: AbortController = new AbortController();
    if (filePath !== '') {
      importGltf(filePath);
    }
    return () => abortCont.abort();
  }, [filePath]);

  useEffect(() => {
    if (isMergeObject) {
      mergeGltf();
    }
  }, [isMergeObject]);

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
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onClick={handleOnClick}
      ></canvas>
    </div>
  );
}
 
export default Scene;