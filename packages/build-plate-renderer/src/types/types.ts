import { BufferGeometry } from 'three';

export interface ModelProps {
  id: string;
  geometry: BufferGeometry;
  format: 'stl' | 'obj' | '3mf';
}

export interface IModel {
  id: string;
  geometry: BufferGeometry;
  format: 'stl' | 'obj' | '3mf';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}