import LineTreeView from "./LineTreeView";

interface Props {
  gltf: THREE.Object3D
}

const TreeView = ({gltf}: Props) => {
  return (
    <div className="bg-white h-50 overflow-y-scroll p-2">
      <LineTreeView object={gltf}/>
    </div>
  );
}
 
export default TreeView;