import Form from 'react-bootstrap/Form';

interface Props {
  file: string,
  setFile: React.Dispatch<React.SetStateAction<string>>
}

const SideBar = ({ setFile }: Props) => {
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
    </div>
  );
}
 
export default SideBar;