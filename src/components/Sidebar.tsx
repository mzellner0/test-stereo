import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { MouseEventHandler } from 'react';

interface Props {
  setFile: React.Dispatch<React.SetStateAction<string>>,
  handleDeleteGltf: MouseEventHandler<HTMLElement>
}

const SideBar = ({ setFile, handleDeleteGltf }: Props) => {
  const handleLoadFile: Function = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let fileFromInput: File;
    if (e.target.files && e.target.files.length) {
      fileFromInput = e.target.files[0];
      const url: string = URL.createObjectURL(fileFromInput);
      setFile(url);
    }
  }

  return (
    <div className="position-absolute h-100 bg-dark p-4">
      <Form.Control
        type="file"
        onChange={(e) => handleLoadFile(e)} 
      />
      <Button
        onClick={handleDeleteGltf}
      >
        Supprimer le modèle
      </Button>
    </div>
  );
}
 
export default SideBar;