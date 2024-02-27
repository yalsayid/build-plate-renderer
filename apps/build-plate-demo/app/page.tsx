"use client";

import {
  BuildPlateRenderer,
  useBuildPlateRenderer,
} from "@repo/build-plate-renderer";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Page(): JSX.Element {
  const { addNewObject } = useBuildPlateRenderer();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const modelUrl = URL.createObjectURL(file); // Directly create a blob URL from the file.
      const format = file.name.split(".").pop() as "stl" | "obj" | "3mf"; // Extract the file extension as format.

      addNewObject({
        modelId: 2,
        modelUrl,
        format,
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/3mf": [".3mf"],
      "model/stl": [".stl"],
      "model/obj": [".obj"],
    },
  });

  return (
    <main className="h-screen w-screen relative ">
      <BuildPlateRenderer className="w-full h-full bg-slate-50" />
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={
          "absolute left-4 top-4 bottom-4 z-50 w-[260px] bg-white rounded-xl overflow-y-auto no-scrollbar"
        }
      >
        <div className="px-2 py-4 flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Build Plate Renderer</h1>
          <p className="text-sm text-slate-500">
            This is a 3D representation of a 3D printer's build plate. You can
            use the controls to move, rotate, and zoom in on the build plate.
          </p>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
