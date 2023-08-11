import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faXmark, faBars } from '@fortawesome/free-solid-svg-icons';
import * as THREE from 'three';
import TreeView from './TreeView';

interface Props {
  setFilePath: React.Dispatch<React.SetStateAction<string>>,
  setIsMergeObject: React.Dispatch<React.SetStateAction<boolean>>,
  isMergeObject: boolean,
  handleDeleteGltf: MouseEventHandler<HTMLElement>,
  gltf: THREE.Object3D | null,
  selectedMesh: THREE.Mesh | null
}

const SideBar = ({
  setFilePath,
  setIsMergeObject,
  isMergeObject,
  handleDeleteGltf,
  selectedMesh,
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
      fileFromInput = e.target.files[0];
      const url: string = URL.createObjectURL(fileFromInput);
      setFilePath(url);
    }
  }

  const handleChangeColor: Function = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedMesh) {
      const node: any = selectedMesh;
      node.material.color = new THREE.Color(e.target.value);
    }
  }

  useEffect(() => {
    if (!gltf && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [gltf]);

  return (
    <div
      className='position-absolute h-100 d-flex flex-row'
      style={{pointerEvents: isMenuOpen ? 'auto' : 'none'}}
    >
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
        {
          selectedMesh &&
          <div className='d-flex flex-row justify-content-between'>
            <p className="text-white me-2 w-75">
              Modifier la couleur de l'objet sélectionné :
            </p>
            <Form.Control
              className='mb-3'
              type="color"
              onChange={(e) => handleChangeColor(e)}
            />
          </div>
        }
        <Button
          className='mb-3'
          onClick={() => setIsMergeObject(true)}
          disabled={!gltf || isMergeObject}
        >
          Merger l'objet
        </Button>
        <Button
          className='mb-3'
          onClick={handleDeleteGltf}
          disabled={!gltf}
        >
          <FontAwesomeIcon icon={faTrash} color='white' />
        </Button>
        {
          gltf &&
          <TreeView gltf={gltf} />
        }
      </div>
      <div
        className="position-relative bg-dark px-3 py-2 cursor-pointer"
        style={{
          height: 'fit-content',
          cursor: 'pointer',
          left: isMenuOpen ? '0px' : `-${menuRef.current?.clientWidth}px`,
          opacity: isMenuOpen ? '0' : '1',
          transition: '200ms',
          pointerEvents: 'auto'
        }}
        onClick={() => setIsMenuOpen(true)}
      >
      <FontAwesomeIcon icon={faBars} color='white' />
      </div>
    </div>
  );
}
 
export default SideBar;