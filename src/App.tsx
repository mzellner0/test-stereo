import { useState } from "react";
import Scene from "./components/Scene";
import SideBar from "./components/Sidebar";

function App() {
  const [file, setFile] = useState<string>('');

  return (
    <div className="App">
      <SideBar file={file} setFile={setFile} />
      <Scene file={file} />
    </div>
  );
}

export default App;
