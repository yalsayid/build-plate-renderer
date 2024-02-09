import { BufferGeometry } from 'three';

export interface ModelProps {
  id: string;
  name: string;
  geometry: BufferGeometry;
  format: 'stl' | 'obj' | '3mf';
  size: [number, number, number];
}

export interface IModel {
  id: string;
  name: string;
  geometry: BufferGeometry;
  format: 'stl' | 'obj' | '3mf';
  transformMode: TransformMode;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  size: [number, number, number];
}

export enum TransformMode {
  Translate = 'translate',
  Rotate = 'rotate',
  Scale = 'scale',
}
