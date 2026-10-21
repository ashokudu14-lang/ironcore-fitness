import * as THREE from "three";

// An original IronCore sculpture, built from geometry rather than downloaded assets.
export function createCoreScene(host) {
  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    }) ||
    canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  if (!context) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
      alpha: true,
    });
  } catch {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0.25, 9.6);
  camera.lookAt(0, 0, 0);
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const dark = new THREE.MeshStandardMaterial({
    color: 0x272b34,
    metalness: 0.83,
    roughness: 0.26,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: 0xb6bbc5,
    metalness: 0.8,
    roughness: 0.23,
  });
  const red = new THREE.MeshStandardMaterial({
    color: 0xd43240,
    metalness: 0.1,
    roughness: 0.5,
  });
  const core = new THREE.MeshStandardMaterial({
    color: 0x080a0f,
    metalness: 0.8,
    roughness: 0.35,
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xf14450,
    toneMapped: false,
  });
  [dark, edge, red, core, ringMaterial].forEach((material) =>
    material.color.convertSRGBToLinear(),
  );
  const resources = new Set([dark, edge, red, core, ringMaterial]);
  function mesh(geometry, material, parent = sculpture) {
    resources.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    parent.add(object);
    return object;
  }
  // An extruded I-beam: a strong brand mark viewed as a machined piece of equipment.
  const outline = new THREE.Shape();
  [
    [-1.05, 1.55],
    [1.05, 1.55],
    [1.05, 0.94],
    [0.39, 0.94],
    [0.39, -0.94],
    [1.05, -0.94],
    [1.05, -1.55],
    [-1.05, -1.55],
    [-1.05, -0.94],
    [-0.39, -0.94],
    [-0.39, 0.94],
    [-1.05, 0.94],
  ].forEach(([x, y], i) => (i ? outline.lineTo(x, y) : outline.moveTo(x, y)));
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth: 0.48,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.08,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 12,
  });
  geometry.center();
  const emblem = mesh(geometry, [dark, edge]);
  emblem.rotation.set(0.04, -0.24, -0.12);
  // Red inset lines emphasize the edges without covering the brushed metal faces.
  const top = mesh(new THREE.BoxGeometry(1.78, 0.065, 0.055), red, emblem);
  top.position.set(0, 1.35, 0.35);
  const bottom = mesh(new THREE.BoxGeometry(1.78, 0.065, 0.055), red, emblem);
  bottom.position.set(0, -1.35, 0.35);
  for (const x of [-0.75, 0.75])
    for (const y of [-1.15, 1.15]) {
      const bolt = mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.055, 12),
        core,
        emblem,
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(x, y, 0.36);
    }
  const orbit = mesh(new THREE.TorusGeometry(2.02, 0.028, 8, 96), ringMaterial);
  orbit.rotation.set(0.55, 0.55, -0.4);
  const track = mesh(new THREE.TorusGeometry(2.28, 0.011, 6, 96), edge);
  track.rotation.set(0.55, 0.55, -0.4);
  const marker = mesh(new THREE.SphereGeometry(0.08, 12, 8), red);
  marker.position.set(-1.45, 1.4, 0.25);
  const deck = mesh(
    new THREE.CylinderGeometry(1.72, 1.82, 0.14, 64),
    dark,
    scene,
  );
  deck.position.y = -2.16;
  const deckTrim = mesh(
    new THREE.TorusGeometry(1.75, 0.022, 8, 80),
    red,
    scene,
  );
  deckTrim.rotation.x = Math.PI / 2;
  deckTrim.position.y = -2.1;
  scene.add(new THREE.HemisphereLight(0xdce6ff, 0x161824, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf83b53, 3);
  rim.position.set(4, -1, 2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8298bb, 1.6);
  fill.position.set(-3, -1, -3);
  scene.add(fill);
  let disposed = false,
    frame = 0,
    active = true,
    last = 0;
  const pointer = { x: 0, y: 0 };
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  function render(time = 0) {
    frame = 0;
    if (disposed || !active) return;
    if (time - last >= 1000 / 30) {
      last = time;
      sculpture.rotation.y += (pointer.x * 0.24 - sculpture.rotation.y) * 0.075;
      sculpture.rotation.x += (pointer.y * 0.1 - sculpture.rotation.x) * 0.075;
      sculpture.position.y = Math.sin(time * 0.00055) * 0.065;
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
  }
  function setActive(value) {
    active = value;
    cancelAnimationFrame(frame);
    frame = 0;
    if (active && !disposed) frame = requestAnimationFrame(render);
  }
  function move(event) {
    const rect = host.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
  }
  const reset = () => {
    pointer.x = 0;
    pointer.y = 0;
  };
  host.appendChild(canvas);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  render();
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", reset);
  return {
    setActive,
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
