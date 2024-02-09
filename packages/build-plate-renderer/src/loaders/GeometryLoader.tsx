import { BufferGeometry, Group, Matrix4, Mesh, Vector3 } from 'three';
import { OBJLoader, STLLoader, ThreeMFLoader } from 'three-stdlib';

async function loadGeometry(url: string, format: 'stl' | 'obj' | '3mf'): Promise<{ geometry: BufferGeometry }> {
  const convertToBufferGeometry = (group: Group) => {
    const geometries: BufferGeometry[] = [];

    group.traverse((child) => {
      if (child instanceof Mesh) {
        const { geometry: childGeometry } = child;
        childGeometry.applyMatrix4(child.matrixWorld);
        geometries.push(childGeometry);
      }
    });

    // return BufferGeometryUtils.mergeBufferGeometries(geometries);
    return geometries[0];
  };

  let loadedGeometry: BufferGeometry | Group;

  switch (format) {
    case 'stl':
      loadedGeometry = await new STLLoader().loadAsync(url);
      break;
    case 'obj':
      loadedGeometry = await new OBJLoader().loadAsync(url);
      break;
    case '3mf':
      loadedGeometry = await new ThreeMFLoader().loadAsync(url);
      break;
    default:
      throw new Error('Unsupported file format');
  }

  let geometryToReturn: BufferGeometry;
  if (loadedGeometry instanceof Group) {
    const convertedGeometry = convertToBufferGeometry(loadedGeometry);
    if (!convertedGeometry) {
      throw new Error('Failed to convert Group to BufferGeometry');
    }
    geometryToReturn = convertedGeometry;
  } else {
    geometryToReturn = loadedGeometry as BufferGeometry;
  }
  const rotationMatrixX = new Matrix4().makeRotationX(-Math.PI / 2);
  geometryToReturn.applyMatrix4(rotationMatrixX);

  geometryToReturn.computeBoundingBox();
  const { boundingBox } = geometryToReturn;
  const center = new Vector3();
  boundingBox?.getCenter(center);
  geometryToReturn.translate(-center.x, -center.y, -center.z);

  geometryToReturn.computeVertexNormals();

  return {
    geometry: geometryToReturn,
  };
}

export default loadGeometry;
