import * as THREE from "three";
import { cellJourney } from "./material-transition";

/** Original, generalized fungal-cell cutaway. Illustrative anatomy, not to scale. */
export class FungalCell {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
  body = new THREE.Group();
  target = new THREE.WebGLRenderTarget(800, 600, { depthBuffer: true, samples: 4 });
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private batches: THREE.InstancedMesh[] = [];
  private lastView = "";
  private key = new THREE.DirectionalLight(0xffeed0, 3.1);
  private randomState = 2718;
  private front: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;

  private random() {
    this.randomState = (Math.imul(1664525, this.randomState) + 1013904223) >>> 0;
    return this.randomState / 4294967296;
  }
  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = this.body) {
    this.geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private ellipsoid(material: THREE.Material, position: THREE.Vector3, scale: THREE.Vector3, parent = this.body) {
    const mesh = this.mesh(new THREE.SphereGeometry(1, 80, 56), material, parent);
    mesh.position.copy(position); mesh.scale.copy(scale); return mesh;
  }
  private tube(points: THREE.Vector3[], radius: number, material: THREE.Material, parent: THREE.Object3D = this.body, closed = false) {
    return this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), Math.max(32, points.length * 3), radius, 8, closed), material, parent);
  }
  private instances(points: { position: THREE.Vector3; scale: THREE.Vector3; rotation?: THREE.Quaternion }[], material: THREE.Material, detail = 1, parent: THREE.Object3D = this.body) {
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    this.geometries.add(geometry);
    const mesh = new THREE.InstancedMesh(geometry, material, points.length);
    const dummy = new THREE.Object3D();
    points.forEach((point, i) => {
      dummy.position.copy(point.position); dummy.scale.copy(point.scale);
      dummy.quaternion.copy(point.rotation ?? new THREE.Quaternion());
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.receiveShadow = true;
    parent.add(mesh); this.batches.push(mesh);
  }
  static async create(cancelled: () => boolean) {
    const size = 1024, data = new Uint8Array(size * size);
    let seed = 2718;
    const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
    // Tileable multi-scale relief. A fixed field avoids texture downloads and random flicker.
    for (let y = 0; y < size; y++) {
      if (y % 64 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (cancelled()) return null;
      }
      for (let x = 0; x < size; x++) {
      const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;
      const folds = Math.sin(u * 23 + Math.sin(v * 13) * 2) * Math.sin(v * 29 + Math.sin(u * 11));
      const grains = Math.sin(u * 117 + Math.cos(v * 83)) * Math.cos(v * 97 + Math.sin(u * 109));
      data[y * size + x] = Math.round(128 + folds * 35 + grains * 24 + (random() - .5) * 22);
    }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true; texture.needsUpdate = true;
    return new FungalCell(texture);
  }
  private constructor(relief: THREE.DataTexture) {
    this.textures.add(relief);
    this.scene.background = null;
    this.scene.add(this.body, new THREE.HemisphereLight(0xf4f1e8, 0x162313, 1.3));
    this.key.position.set(-3, 4, 6); this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.left = this.key.shadow.camera.bottom = -2.5;
    this.key.shadow.camera.right = this.key.shadow.camera.top = 2.5;
    this.key.shadow.camera.near = .1; this.key.shadow.camera.far = 15;
    this.key.shadow.normalBias = .008; this.key.shadow.bias = -.0001;
    this.scene.add(this.key);
    const rim = new THREE.DirectionalLight(0xb4c895, 2);
    rim.position.set(3, -.5, -2); this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0x71845c, .7);
    fill.position.set(2, -3, 4); this.scene.add(fill);
    const material = (color: number, roughness = .58, bumpScale = .01, clearcoat = .08) => {
      const result = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, bumpMap: relief, bumpScale, clearcoat, clearcoatRoughness: .36, side: THREE.DoubleSide });
      this.materials.add(result); return result;
    };
    const wall = material(0x6c8056, .72, .025);
    const wallEdge = material(0xb8bc8b, .65, .016);
    const membrane = material(0x607548, .5, .009, .18);
    const cytoplasm = material(0x354c2b, .78, .015);
    const ribosome = material(0xb0b68d, .65, .006);
    const nucleus = material(0xa87b48, .62, .015, .15);
    const nuclearEdge = material(0xd2b481, .53, .009);
    const chromatin = material(0x74502d, .56, .005);
    const vacuole = material(0xb7c59d, .29, .008, .5);
    const mitoOuter = material(0x9eae76, .58, .012);
    const mitoInner = material(0x57693d, .68, .013);
    const cristae = material(0xc0c893, .5, .008, .15);

    // Sculpt the open wall into a subtly irregular, thick elliptical cup.
    const shell = new THREE.SphereGeometry(1, 160, 112, Math.PI, Math.PI);
    const position = shell.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
      const ripple = 1 + .012 * Math.sin(x * 19 + y * 13) * Math.sin(y * 17 + z * 9);
      position.setXYZ(i, x * ripple, y * ripple, z * ripple);
    }
    shell.computeVertexNormals();
    this.mesh(shell, wall).scale.set(1.62, 1.08, .76);
    const frontMaterial = wall.clone(); frontMaterial.transparent = true; frontMaterial.depthWrite = false; this.materials.add(frontMaterial);
    const frontGeometry = new THREE.SphereGeometry(1, 128, 96, 0, Math.PI); this.geometries.add(frontGeometry);
    this.front = new THREE.Mesh(frontGeometry, frontMaterial); this.front.scale.set(1.62,1.08,.76); this.front.receiveShadow = true; this.body.add(this.front);
    this.mesh(new THREE.SphereGeometry(1, 128, 96, Math.PI, Math.PI), cytoplasm).scale.set(1.49, .97, .65);
    // Fibrous laminations across the cut wall, with a distinct membrane beneath it.
    for (let layer = 0; layer < 9; layer++) {
      const points = Array.from({ length: 160 }, (_, i) => {
        const a = i / 160 * Math.PI * 2, wrinkle = Math.sin(a * 31 + layer * .5) * .003;
        return new THREE.Vector3(Math.cos(a) * (1.50 + layer * .014 + wrinkle), Math.sin(a) * (.972 + layer * .012 + wrinkle), .018 + Math.sin(layer / 8 * Math.PI) * .024);
      });
      this.tube(points, .008, layer % 3 ? wall : wallEdge, this.body, true);
    }
    for (const depth of [-.002, .023]) {
      const points = Array.from({ length: 128 }, (_, i) => { const a = i / 128 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 1.482, Math.sin(a) * .958, depth); });
      this.tube(points, .008, membrane, this.body, true);
    }
    const lipids = Array.from({ length: 1200 }, (_, i) => {
      const a = i / 600 * Math.PI * 2, row = i < 600 ? 0 : 1;
      return { position: new THREE.Vector3(Math.cos(a) * (1.472 - row * .016), Math.sin(a) * (.947 - row * .011), .03), scale: new THREE.Vector3(.005, .005, .007) };
    });
    this.instances(lipids, wallEdge, 0);

    // A second cutaway exposes chromatin inside the nucleus.
    const nuclear = new THREE.Group(); nuclear.position.set(-.55, .21, .06); this.body.add(nuclear);
    const opening = .85, openingAxis = new THREE.Vector3(.45, -.08, 1).normalize();
    const nuclearShell = new THREE.SphereGeometry(.365, 128, 96, 0, Math.PI * 2, opening, Math.PI - opening);
    this.mesh(nuclearShell, nucleus, nuclear).quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), openingAxis);
    const cutEdge = this.mesh(new THREE.TorusGeometry(.365 * Math.sin(opening), .0045, 10, 128), nuclearEdge, nuclear);
    cutEdge.position.copy(openingAxis).multiplyScalar(.365 * Math.cos(opening));
    cutEdge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), openingAxis);
    this.mesh(new THREE.SphereGeometry(.333, 96, 64), chromatin, nuclear);
    this.ellipsoid(nuclearEdge, new THREE.Vector3(.065, -.05, .29), new THREE.Vector3(.09, .085, .07), nuclear);
    for (let j = 0; j < 18; j++) {
      const points = Array.from({ length: 70 }, (_, i) => {
        const t = i / 69, a = t * Math.PI * 2;
        const x = .05 + Math.sin(a * 2 + j * 2.1) * .19, y = -.025 + Math.cos(a * 3 + j * .91) * .19;
        return new THREE.Vector3(x, y, Math.sqrt(Math.max(.008, .32 ** 2 - x * x - y * y)) + .006 + j * .0004);
      });
      this.tube(points, .0035, j % 3 ? nucleus : nuclearEdge, nuclear);
    }
    const poreGeometry = new THREE.TorusGeometry(.012, .003, 6, 14);
    for (let i = 0; i < 100; i++) {
      const y = 1 - (i + .5) / 100 * 2, a = i * 2.39996, radius = Math.sqrt(1 - y * y);
      const n = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
      if (n.dot(openingAxis) > Math.cos(opening)) continue;
      const pore = this.mesh(poreGeometry, nuclearEdge, nuclear);
      pore.position.copy(n).multiplyScalar(.367); pore.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    }

    // Corrugated endoplasmic-reticulum sheets, dotted with ribosomes.
    const erGranules: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    for (let layer = 0; layer < 6; layer++) {
      const vertices: number[] = [], uv: number[] = [], indices: number[] = [];
      for (let i = 0; i <= 120; i++) for (let j = 0; j <= 8; j++) {
        const a = -.2 + i / 120 * Math.PI * 1.45;
        const r = .415 + layer * .041 + j / 8 * .028;
        const x = -.55 + Math.cos(a) * r, y = .21 + Math.sin(a) * r * .9;
        const z = -.045 + Math.sin(a * 9 + layer * .65) * .024 + Math.sin(j / 8 * Math.PI) * .016;
        vertices.push(x, y, z); uv.push(i / 120, j / 8);
        if (i < 120 && j < 8) { const n = i * 9 + j; indices.push(n, n + 9, n + 1, n + 1, n + 9, n + 10); }
        if (i % 3 === 0 && j % 3 === 0) erGranules.push({ position: new THREE.Vector3(x, y, z + .008), scale: new THREE.Vector3(.005, .005, .006) });
      }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); this.mesh(geometry, membrane);
    }
    this.instances(erGranules, ribosome);

    // Vacuole surface has small membrane-associated vesicles and fine relief.
    this.ellipsoid(vacuole, new THREE.Vector3(.55, -.1, -.07), new THREE.Vector3(.48, .53, .30));
    const vesicles = [];
    for (let i = 0; i < 85; i++) {
      const a = i * 2.39996, y = 1 - (i + .5) / 85 * 2, r = Math.sqrt(1 - y * y), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (z < .2) continue;
      const radius = .006 + this.random() * .009;
      vesicles.push({ position: new THREE.Vector3(.55 + x * .482, -.1 + y * .532, -.07 + z * .304), scale: new THREE.Vector3(radius, radius, radius * .35) });
    }
    this.instances(vesicles, membrane, 1);

    // Mitochondrial cutaways: outer envelope, matrix, and folded inner membranes.
    for (const [x, y, rotation, size] of [[-1, -.38, -.45, 1], [.15, .66, .35, .9], [-.03, -.68, -.3, 1.05], [1.08, .35, .8, .85]]) {
      const group = new THREE.Group(); group.position.set(x, y, .10); group.rotation.z = rotation; group.scale.setScalar(size); this.body.add(group);
      const shell = this.mesh(new THREE.SphereGeometry(1, 72, 48, Math.PI, Math.PI), mitoOuter, group); shell.scale.set(.235, .115, .1);
      const matrix = this.mesh(new THREE.SphereGeometry(1, 64, 40, Math.PI, Math.PI), mitoInner, group); matrix.scale.set(.216, .094, .075); matrix.position.z = .008;
      this.tube(Array.from({ length: 80 }, (_, i) => { const a = i / 80 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * .225, Math.sin(a) * .105, .008); }), .008, mitoOuter, group, true);
      for (let j = -3; j <= 3; j++) {
        const length = Math.sqrt(1 - (j / 4.3) ** 2) * .08;
        const points = Array.from({ length: 24 }, (_, i) => {
          const t = i / 23; return new THREE.Vector3(j * .049 + Math.sin(t * Math.PI * 2) * .018, -length + t * length * 2, .005 + Math.sin(t * Math.PI) * .023);
        });
        this.tube(points, .007, cristae, group);
      }
    }
    // Stacked Golgi cisternae, separate from the rough ER.
    for (let j = 0; j < 6; j++) {
      const points = Array.from({ length: 48 }, (_, i) => {
        const t = i / 47, a = .22 + t * Math.PI * .83;
        return new THREE.Vector3(.25 + Math.cos(a) * (.19 - j * .011), -.55 + Math.sin(a) * (.12 - j * .008) - j * .027, .02 + Math.sin(t * Math.PI) * .012);
      });
      const cisterna = this.tube(points, .014, j % 2 ? membrane : mitoOuter); cisterna.scale.z = .5;
    }
    // Dense but instanced cytoplasmic particles preserve a small draw-call count.
    const granules = [];
    for (let i = 0; i < 2300; i++) {
      const x = (this.random() - .5) * 2.8, y = (this.random() - .5) * 1.75;
      if ((x / 1.40) ** 2 + (y / .88) ** 2 > 1 || ((x + .55) / .40) ** 2 + ((y - .21) / .4) ** 2 < 1 || ((x - .55) / .51) ** 2 + ((y + .1) / .57) ** 2 < 1) continue;
      const r = .003 + this.random() ** 3 * .009;
      granules.push({ position: new THREE.Vector3(x, y, -.03 + this.random() * .04), scale: new THREE.Vector3(r, r, r) });
    }
    this.instances(granules, ribosome, 1);
    this.body.rotation.z = -.18;
  }
  render(renderer: THREE.WebGLRenderer, progress: number, width: number, height: number, origin = { x: .7, y: .61 }) {
    const signature = `${width}:${height}:${progress.toFixed(5)}:${origin.x.toFixed(4)}:${origin.y.toFixed(4)}`;
    if (this.lastView === signature) return;
    this.lastView = signature;
    const started = performance.now();
    if (this.target.width !== width || this.target.height !== height) this.target.setSize(width, height);
    const aspect = width / height;
    this.camera.aspect = aspect;
    const journey = cellJourney(progress);
    // The closed cell approaches on the same focal path as the living field.
    const fit = Math.max(5.1, 5.3 / aspect);
    const distance = fit * Math.pow(6.2, 1 - journey.approach) * (1 - journey.inspect * .035);
    this.camera.far = Math.max(100, distance + 15);
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0); this.camera.updateProjectionMatrix();
    const x = origin.x + (.5 - origin.x) * journey.center;
    const endY = aspect < .7 ? .55 : .52, y = origin.y + (endY - origin.y) * journey.center;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(17.5)) * distance;
    this.body.position.set((x - .5) * halfHeight * 2 * aspect, (y - .5) * halfHeight * 2, 0);
    this.body.rotation.y = -.32 + journey.opening * .42 + journey.inspect * .08;
    this.body.rotation.x = .18 - journey.opening * .08;
    this.body.scale.setScalar(1);
    this.front.material.opacity = 1 - journey.opening;
    this.front.visible = journey.opening < .999;
    const shadows = renderer.shadowMap.enabled;
    renderer.shadowMap.enabled = true;
    renderer.setRenderTarget(this.target); renderer.render(this.scene, this.camera);
    renderer.domElement.dataset.cellResolution = `${width} × ${height}`;
    renderer.domElement.dataset.cellTriangles = String(renderer.info.render.triangles);
    renderer.shadowMap.enabled = shadows;
    return performance.now() - started;
  }
  dispose() {
    this.target.dispose(); this.key.shadow.map?.dispose();
    this.batches.forEach(mesh => mesh.dispose());
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose());
  }
}
