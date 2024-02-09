interface LightProps {
  color: string | number;
  intensity: number;
}

function KeyLight({ color, intensity }: LightProps) {
  return (
    <directionalLight
      color={color}
      intensity={intensity}
      position={[10, 25, 10]}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-near={0.1}
      shadow-camera-far={100}
    />
  );
}

function FillLight({ color, intensity }: LightProps) {
  return (
    <directionalLight
      color={color}
      intensity={intensity}
      position={[-10, 15, 10]}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-near={0.1}
      shadow-camera-far={100}
    />
  );
}

function BackLight({ color, intensity }: LightProps) {
  return (
    <directionalLight
      color={color}
      intensity={intensity}
      position={[-10, 25, -15]}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-near={0.1}
      shadow-camera-far={100}
    />
  );
}

function AmbientLight({ color, intensity }: LightProps) {
  return <ambientLight color={color} intensity={intensity} />;
}

function Lights() {
  const groundColor = 0xffffff;
  const lightColor = 0xffffff;

  return (
    <>
      <AmbientLight color={lightColor} intensity={0.4} />
      <hemisphereLight groundColor={groundColor} color={lightColor} intensity={0.8} />
      <KeyLight color={lightColor} intensity={0.8} />
      <FillLight color={lightColor} intensity={0.8} />
      <BackLight color={lightColor} intensity={0.8} />
    </>
  );
}

export default Lights;
