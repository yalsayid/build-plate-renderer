import { BufferGeometry, Group, Matrix4, Mesh, Vector3 } from 'three';
import { OBJLoader, STLLoader, ThreeMFLoader, mergeBufferGeometries } from 'three-stdlib';

async function loadGeometry(
  url: string,
  format: 'stl' | 'obj' | '3mf',
  combineGeometries: boolean = true
): Promise<{ geometry: BufferGeometry | BufferGeometry[] }> {
  let loadedGeometry: BufferGeometry | Group = await loadFile(url, format);
  return { geometry: processGeometry(loadedGeometry, combineGeometries) };
}

async function loadFile(url: string, format: string): Promise<BufferGeometry | Group> {
  switch (format) {
    case 'stl':
      return await new STLLoader().loadAsync(url);
    case 'obj':
      return await new OBJLoader().loadAsync(url);
    case '3mf':
      return await new ThreeMFLoader().loadAsync(url);
    default:
      throw new Error('Unsupported file format');
  }
}

function processGeometry(loadedGeometry: BufferGeometry | Group, combine: boolean): BufferGeometry | BufferGeometry[] {
  if (loadedGeometry instanceof Group) {
    if (combine) {
      // Convert the group to a single BufferGeometry
      const combinedGeometry = convertGroupToBufferGeometry(loadedGeometry);
      return applyTransformationsAndCenter(combinedGeometry);
    } else {
      // Extract individual geometries from the group
      const geometries = extractIndividualGeometries(loadedGeometry);
      return geometries.map(applyTransformationsAndCenter);
    }
  } else {
    return applyTransformationsAndCenter(loadedGeometry as BufferGeometry);
  }
}

function convertGroupToBufferGeometry(group: Group): BufferGeometry {
  const geometries: BufferGeometry[] = [];
  group.traverse((child) => {
    if (child instanceof Mesh && child.geometry instanceof BufferGeometry) {
      geometries.push(child.geometry);
    }
  });

  const mergedGeometry = mergeBufferGeometries(geometries, true);
  if (!mergedGeometry) {
    throw new Error('Failed to merge geometries');
  }

  return mergedGeometry;
}

function extractIndividualGeometries(group: Group): BufferGeometry[] {
  const geometries: BufferGeometry[] = [];
  group.traverse((child) => {
    if (child instanceof Mesh && child.geometry instanceof BufferGeometry) {
      geometries.push(child.geometry);
    }
  });
  return geometries;
}

function applyTransformationsAndCenter(geometry: BufferGeometry): BufferGeometry {
  // Apply rotation transformation
  const rotationMatrixX = new Matrix4().makeRotationX(-Math.PI / 2);
  geometry.applyMatrix4(rotationMatrixX);

  // Center the geometry and compute normals
  geometry.computeBoundingBox();
  const center = new Vector3();
  geometry.boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.computeVertexNormals();

  return geometry;
}

export default loadGeometry;
