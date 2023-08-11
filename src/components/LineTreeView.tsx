import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import * as THREE from 'three';
import { useState } from 'react';

interface Props {
  object: THREE.Object3D
}

const LineTreeView = ({ object }: Props) => {
  const [isLineOpened, setIsLineOpened] = useState<boolean>(false);
  return (
    <li style={{listStyle: 'none'}}>
      <div
        className="d-flex flex-row"
        style={{cursor: 'pointer'}}
        onClick={() => setIsLineOpened(!isLineOpened)}
      >
        {
          object.children.length > 0 &&
          <div className='me-2'>
            {
              isLineOpened &&
              <FontAwesomeIcon
                icon={faMinus}
                color='black'
              />
            }
            {
              !isLineOpened &&
              <FontAwesomeIcon
                icon={faPlus}
                color='black'
              />
            }
          </div>
        }
        <p>{ object.name }</p>
      </div>
      {
        (object.children.length > 0 && isLineOpened) &&
        <ul>
          {
            object.children.map(elmt => (
              <LineTreeView object={elmt} key={elmt.uuid} />
            ))
          }
        </ul>
      }
    </li>
  );
}
 
export default LineTreeView;