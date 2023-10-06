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
  isMergeObject: boolean,
  isDeletingGltf: boolean
}

const Scene = ({
  filePath,
  scene,
  gltf,
  setScene,
  setGltf,
  setSelectedMesh,
  isMergeObject,
  isDeletingGltf
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
  const [bufferSavedColorArray, setBufferSavedColorArray] = useState<Array<number> | null>(null);

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
    const pointLight: THREE.PointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(1, 1, 1);
    tScene.add(pointLight);
  }

  const animate = (): void => {
    requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }

  const updateColorOfOnePoint = (mesh: THREE.Mesh, index: number) => {
    mesh.geometry.attributes.color.array[
      index * 3
    ] = 0;
    mesh.geometry.attributes.color.array[
      index * 3 + 1
    ] = 1;
    mesh.geometry.attributes.color.array[
      index * 3 + 2
    ] = 0;
  }

  const getQuadFace = (mesh: THREE.Mesh , pointsToUpdate: Array<number>): void => {
    if (mesh.geometry.index == null) return;
    for (let x = 0; x < mesh.geometry.index.array.length; x += 3) {
      const array = mesh.geometry.index.array;
      if (
        pointsToUpdate.includes(array[x]) ||
        pointsToUpdate.includes(array[x + 1]) ||
        pointsToUpdate.includes(array[x + 2])
      ) {
        if (!pointsToUpdate.includes(array[x])) pointsToUpdate.push(array[x]);
        if (!pointsToUpdate.includes(array[x + 1])) pointsToUpdate.push(array[x + 1]);
        if (!pointsToUpdate.includes(array[x + 2])) pointsToUpdate.push(array[x + 2]);
      }
    }
  }

  const handleRaycasterRender = (): void => {
    if (raycaster && pointer && camera && gltf && renderer && scene) {
      raycaster.setFromCamera(pointer, camera);
      const intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[] =
        raycaster.intersectObjects(scene.children, true);
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const mesh: any = node as THREE.Mesh;
          if (mesh.material  && !mesh.geometry.attributes.color) {
            mesh.material.emissive = new THREE.Color(0x000000);
          } else if (mesh.geometry.attributes.color && bufferSavedColorArray) {
            mesh.geometry.attributes.color.array = Float32Array.from(bufferSavedColorArray);
            mesh.geometry.attributes.color.needsUpdate = true;
          }
        }
      })
      if (intersects.length) {
        for (let elmt of intersects) {
          if (elmt.object instanceof THREE.Mesh) {
            const mesh: any = elmt.object as THREE.Mesh;
            if (mesh.material) {
              if (mesh.geometry.attributes.color) {
                const colorFromMesh = mesh.geometry.getAttribute('color');
                const pointsToUpdate: Array<number> = [];
                if (intersects[0] && intersects[0].face) {
                  pointsToUpdate.push(intersects[0].face.a);
                  pointsToUpdate.push(intersects[0].face.b);
                  pointsToUpdate.push(intersects[0].face.c);
                  // let newLength;
                  // let oldLength;
                  // do {
                  //   oldLength = pointsToUpdate.length;
                    getQuadFace(mesh, pointsToUpdate);
                  //   newLength = pointsToUpdate.length;
                  // } while (newLength != oldLength);
                  for (let point of pointsToUpdate) {
                    updateColorOfOnePoint(mesh, point);
                  }
                }
                colorFromMesh.needsUpdate = true;
              } else {
                mesh.material.emissive = new THREE.Color(0x0080ff);
              }
            }
            setOveredMesh(mesh);
            break;
          }
        }
      }
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

    const allGeo: Array<THREE.BufferGeometry> = [];
    const transforms: Array<THREE.Matrix4> = [];
    const colors: Array<THREE.Color> = [];
    gltf.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        transforms.push(node.matrixWorld);
        colors.push(node.material.color);
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
    const colorAttribute = BufferGeometryUtils.mergeAttributes(allGeo.map((geom, index) => {
      return createColorAttributeFromGeo(geom, colors[index]);
    })); 
    setBufferSavedColorArray(Array.from(colorAttribute.clone().array));
    singleGeo.computeVertexNormals();
    singleGeo.setAttribute('position', singleAttribute);
    singleGeo.setAttribute('color', colorAttribute);
    const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      flatShading: true,
      vertexColors: true
    });
    const singleObject = new THREE.Mesh(singleGeo, material);
    normalizeObject(singleObject);

    scene.remove(gltf);
    clean(gltf);
    scene.add(singleObject);
    setGltf(singleObject);
  }

  const createColorAttributeFromGeo: Function = (geo: THREE.BufferGeometry, color: THREE.Color) => {
    const colorsArray: Array<number> = [];
    for (let i = 0; i < geo.attributes.position.array.length - 2; i+=3) {
      colorsArray[i] = color.r;
      colorsArray[i+1] = color.g;
      colorsArray[i+2] = color.b;
    }
    const colorsTypedArray: Float32Array = new Float32Array(colorsArray);
    const colorsToAttribute: THREE.BufferAttribute = new THREE.BufferAttribute(
      colorsTypedArray,
      3,
      true
    );
    return colorsToAttribute;
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

  const clean: Function = (object: THREE.Object3D) => {
    object.traverse(node => {
      if (node instanceof THREE.Mesh) {
        node.geometry.dispose();
        node.material.dispose();
      }
    });
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
    if (gltf) {
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
    if (isDeletingGltf && gltf) {
      clean(gltf);
      setGltf(null);
      setOveredMesh(null);
    }
  }, [isDeletingGltf]);

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