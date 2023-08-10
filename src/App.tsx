import { MouseEventHandler, useState } from "react";
import Scene from "./components/Scene";
import SideBar from "./components/Sidebar";
import * as THREE from 'three';

function App() {
  const [filePath, setFilePath] = useState<string>('');
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [gltf, setGltf] = useState<THREE.Object3D | null>(null);

  const handleDeleteGltf: MouseEventHandler<HTMLElement> = (): void => {
    if (!scene || !gltf) return;
    scene.remove(gltf);
    setGltf(null);
    setFilePath('');
  }

  return (
    <div className="App">
      <SideBar
        setFilePath={setFilePath}
        handleDeleteGltf={handleDeleteGltf}
        gltf={gltf}
      />
      <Scene
        filePath={filePath}
        scene={scene}
        gltf={gltf}
        setScene={setScene}
        setGltf={setGltf}
      />
    </div>
  );
}

export default App;
