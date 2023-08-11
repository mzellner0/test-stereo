import { MouseEventHandler, useState } from "react";
import Scene from "./components/Scene";
import SideBar from "./components/Sidebar";
import * as THREE from 'three';

function App() {
  const [filePath, setFilePath] = useState<string>('');
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [gltf, setGltf] = useState<THREE.Object3D | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [isMergeObject, setIsMergeObject] = useState<boolean>(false);

  const handleDeleteGltf: MouseEventHandler<HTMLElement> = (): void => {
    if (!scene || !gltf) return;
    scene.remove(gltf);
    setGltf(null);
    setFilePath('');
    setSelectedMesh(null);
    setIsMergeObject(false);
  }

  return (
    <div className="App">
      <div className="p-2 bg-dark position-absolute top-0 end-0 d-flex flex-row">
        <p className="me-2 text-white mb-0">Objet sélectionné :</p>
        {
          !selectedMesh &&
          <p className="text-white mb-0">Aucun</p>
        }
        {
          selectedMesh &&
          <p className="text-white mb-0">{ selectedMesh.name }</p>
        }
      </div>
      <SideBar
        setFilePath={setFilePath}
        handleDeleteGltf={handleDeleteGltf}
        gltf={gltf}
        selectedMesh={selectedMesh}
        setIsMergeObject={setIsMergeObject}
        isMergeObject={isMergeObject}
      />
      <Scene
        filePath={filePath}
        scene={scene}
        gltf={gltf}
        setScene={setScene}
        setGltf={setGltf}
        setSelectedMesh={setSelectedMesh}
        isMergeObject={isMergeObject}
        setIsMergeObject={setIsMergeObject}
      />
    </div>
  );
}

export default App;
