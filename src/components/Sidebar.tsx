import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faXmark, faBars } from '@fortawesome/free-solid-svg-icons';
import * as THREE from 'three';

interface Props {
  setFilePath: React.Dispatch<React.SetStateAction<string>>,
  handleDeleteGltf: MouseEventHandler<HTMLElement>,
  gltf: THREE.Object3D | null
}

const SideBar = ({
  setFilePath,
  handleDeleteGltf,
  gltf
}: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);

  const handleLoadFile: Function = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let fileFromInput: File;
    if (e.target.files && e.target.files.length) {
      console.log(e.target.files);
      fileFromInput = e.target.files[0];
      const url: string = URL.createObjectURL(fileFromInput);
      setFilePath(url);
    }
  }

  useEffect(() => {
    if (!gltf) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setIsMenuOpen(false);
    }

  }, [gltf]);

  return (
    <div className='position-absolute h-100 d-flex flex-row'>
      <div
        className='position-relative bg-dark p-4 h-100 d-flex flex-column'
        style={{left: isMenuOpen ? '0px' : '-100%', transition: '200ms'}}
        ref={menuRef}
      >
        {
          isMenuOpen &&
          <FontAwesomeIcon
            style={{cursor: 'pointer'}}
            icon={faXmark}
            color='white'
            onClick={() => setIsMenuOpen(false)}
          />
        }
        {
          !isMenuOpen &&
          <div style={{height: '16px'}}></div>
        }
        <Form.Control
          ref={fileInputRef}
          className={`my-3 ${gltf ? 'pe-none' : ''}`}
          style={{opacity: gltf ? '0.6' : '1'}}
          type="file"
          onChange={(e) => handleLoadFile(e)} 
          accept='.gltf,.glb'
        />
        <Button
          onClick={handleDeleteGltf}
          disabled={!gltf}
        >
          <FontAwesomeIcon icon={faTrash} color='white' />
        </Button>
      </div>
      <div
        className="position-relative bg-dark px-3 py-2 cursor-pointer"
        style={{
          height: 'fit-content',
          cursor: 'pointer',
          left: isMenuOpen ? '0px' : `-${menuRef.current?.clientWidth}px`,
          opacity: isMenuOpen ? '0' : '1',
          transition: '200ms'
        }}
        onClick={() => setIsMenuOpen(true)}
      >
      <FontAwesomeIcon icon={faBars} color='white' />
      </div>
    </div>
  );
}
 
export default SideBar;