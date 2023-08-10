import { MouseEventHandler, useState } from "react";
import Scene from "./components/Scene";
import SideBar from "./components/Sidebar";
import * as THREE from 'three';

function App() {
  const [file, setFile] = useState<string>('');
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [gltf, setGltf] = useState<THREE.Object3D | null>(null);

  const handleDeleteGltf: MouseEventHandler<HTMLElement> = (): void => {
    if (!scene || !gltf) return;
    scene.remove(gltf);
  }

  return (
    <div className="App">
      <SideBar
        setFile={setFile}
        handleDeleteGltf={handleDeleteGltf}
      />
      <Scene
        file={file}
        scene={scene}
        gltf={gltf}
        setScene={setScene}
        setGltf={setGltf}
      />
    </div>
  );
}

export default App;
