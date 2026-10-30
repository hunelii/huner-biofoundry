import * as THREE from "three";
import { cellJourney, cellFinale } from "./material-transition";

/** Fungal cell (Pleurotus ostreatus / Basidiomycota) cutaway anatomy with scientific fungal hallmarks. */
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
  private glowLight: THREE.PointLight;
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
    this.glowLight = new THREE.PointLight(0xd4c26b, 0, 12, 1.5);
    this.glowLight.position.set(0, 0, 0.5);
    this.scene.add(this.glowLight);
    const material = (color: number, roughness = .58, bumpScale = .01, clearcoat = .08) => {
      const result = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, bumpMap: relief, bumpScale, clearcoat, clearcoatRoughness: .36, side: THREE.DoubleSide });
      this.materials.add(result); return result;
    };

    // Fungal-specific biochemical layers & organelle materials:
    // Outer protective layer: Mannoproteins & melanin pigmentation
    const wallMelanin = material(0x657850, .74, .025);
    // Middle structural scaffold: Branched beta-(1,3) and beta-(1,6)-glucan network
    const betaGlucan = material(0x8ea06a, .65, .016);
    // Inner tensile core: Crystalline chitin microfibril bundles
    const chitinFibrils = material(0xc2c99a, .52, .012, .18);
    // Plasma membrane: Ergosterol-rich lipid bilayer
    const ergosterolMembrane = material(0x4a6540, .48, .009, .20);
    // Viscous cytosol
    const cytoplasm = material(0x2d4023, .80, .015);
    // Nuclear envelope (double membrane)
    const nucleus = material(0xa27542, .60, .014, .16);
    // Nuclear pore complexes (NPC) & envelope margin
    const nuclearEdge = material(0xd4b47c, .52, .009);
    // Fungal chromatin & dense nucleolus (rRNA assembly)
    const chromatin = material(0x6f4b28, .58, .006);
    // Spindle Pole Body (SPB): The fungal centrosome equivalent embedded in the nuclear envelope
    const spbMaterial = material(0x38552c, .42, .008, .25);
    // Dynamic tubular-vesicular vacuolar membrane
    const vacuole = material(0xb0c296, .28, .008, .52);
    // Dense polyphosphate (volutin) storage granules inside vacuolar lumen
    const polyphosphate = material(0x72a562, .22, .005, .82);
    // Fungal tubular mitochondria: Outer envelope, respiratory matrix, folded inner cristae
    const mitoOuter = material(0x94a66e, .56, .012);
    const mitoInner = material(0x526639, .68, .013);
    const cristae = material(0xb8c48a, .48, .008, .18);
    // Spitzenkörper: Apical vesicle cluster & Chitosomes (chitin synthase carriers)
    const chitosome = material(0xe0dd75, .32, .005, .55);
    const secretoryVesicle = material(0xa6c672, .42, .007, .38);
    // Cytoplasmic energy reserves: Neutral lipid droplets (ergosterol esters / TAGs)
    const lipidDroplet = material(0xdca038, .22, .006, .78);
    // 80S fungal ribosomes and glycogen rosettes
    const ribosome = material(0xb2b88e, .65, .006);

    // Sculpt the open wall into a subtly irregular, thick elliptical cup.
    const shell = new THREE.SphereGeometry(1, 160, 112, Math.PI, Math.PI);
    const position = shell.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
      const ripple = 1 + .012 * Math.sin(x * 19 + y * 13) * Math.sin(y * 17 + z * 9);
      position.setXYZ(i, x * ripple, y * ripple, z * ripple);
    }
    shell.computeVertexNormals();
    this.mesh(shell, wallMelanin).scale.set(1.62, 1.08, .76);
    const frontMaterial = wallMelanin.clone(); frontMaterial.transparent = true; frontMaterial.depthWrite = false; this.materials.add(frontMaterial);
    const frontGeometry = new THREE.SphereGeometry(1, 128, 96, 0, Math.PI); this.geometries.add(frontGeometry);
    this.front = new THREE.Mesh(frontGeometry, frontMaterial); this.front.scale.set(1.62, 1.08, .76); this.front.receiveShadow = true; this.body.add(this.front);
    this.mesh(new THREE.SphereGeometry(1, 128, 96, Math.PI, Math.PI), cytoplasm).scale.set(1.49, .97, .65);

    // Stratified fungal cell wall: outer mannoprotein/melanin -> middle beta-glucan -> inner chitin
    for (let layer = 0; layer < 9; layer++) {
      const points = Array.from({ length: 160 }, (_, i) => {
        const a = i / 160 * Math.PI * 2, wrinkle = Math.sin(a * 31 + layer * .5) * .003;
        return new THREE.Vector3(Math.cos(a) * (1.50 + layer * .014 + wrinkle), Math.sin(a) * (.972 + layer * .012 + wrinkle), .018 + Math.sin(layer / 8 * Math.PI) * .024);
      });
      // Outer 3 layers: Melanin & mannoprotein armor
      // Middle 3 layers: beta-(1,3)-glucan structural fibers
      // Inner 3 layers: Crystalline chitin microfibril bundles
      const mat = layer >= 6 ? wallMelanin : layer >= 3 ? betaGlucan : chitinFibrils;
      this.tube(points, .008, mat, this.body, true);
    }
    for (const depth of [-.002, .023]) {
      const points = Array.from({ length: 128 }, (_, i) => { const a = i / 128 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 1.482, Math.sin(a) * .958, depth); });
      this.tube(points, .008, ergosterolMembrane, this.body, true);
    }
    const lipids = Array.from({ length: 1200 }, (_, i) => {
      const a = i / 600 * Math.PI * 2, row = i < 600 ? 0 : 1;
      return { position: new THREE.Vector3(Math.cos(a) * (1.472 - row * .016), Math.sin(a) * (.947 - row * .011), .03), scale: new THREE.Vector3(.005, .005, .007) };
    });
    this.instances(lipids, chitinFibrils, 0);

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

    // Spindle Pole Body (SPB): The fungal centrosome equivalent embedded in the nuclear envelope
    const spbGroup = new THREE.Group();
    spbGroup.position.set(-.18, .26, .18);
    nuclear.add(spbGroup);
    const spbPlaque = this.mesh(new THREE.CylinderGeometry(.026, .026, .012, 16), spbMaterial, spbGroup);
    spbPlaque.rotation.x = Math.PI / 2;
    for (let m = 0; m < 5; m++) {
      const a = m / 5 * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * .06, Math.sin(a) * .06, .03),
        new THREE.Vector3(Math.cos(a) * .12, Math.sin(a) * .12, .07)
      ];
      this.tube(pts, .0022, betaGlucan, spbGroup);
    }

    // Spitzenkörper: Apical vesicle cluster & Chitosomes (chitin synthase carriers)
    // Directing polarized hyphal growth and cell wall remodeling
    for (let k = 0; k < 3; k++) {
      const trackPoints = [
        new THREE.Vector3(.45 + k * .08, .12 - k * .05, -.02),
        new THREE.Vector3(.78 + k * .06, .28 + k * .02, .02),
        new THREE.Vector3(1.05 + k * .03, .45 + k * .02, .06),
        new THREE.Vector3(1.15, .52, .08)
      ];
      this.tube(trackPoints, .003, ergosterolMembrane, this.body, false);
    }
    const chitosomeVesicles: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    for (let i = 0; i < 70; i++) {
      const r = Math.pow(this.random(), 0.6) * 0.045;
      const theta = this.random() * Math.PI * 2, phi = (this.random() - .5) * Math.PI;
      chitosomeVesicles.push({
        position: new THREE.Vector3(
          1.15 + r * Math.cos(theta) * Math.cos(phi),
          .52 + r * Math.sin(theta) * Math.cos(phi) * 0.9,
          .08 + r * Math.sin(phi) * 0.7
        ),
        scale: new THREE.Vector3(.0045, .0045, .0045)
      });
    }
    this.instances(chitosomeVesicles, chitosome, 1);

    const secretoryMantle: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    for (let i = 0; i < 90; i++) {
      const r = 0.04 + Math.pow(this.random(), 0.7) * 0.065;
      const theta = this.random() * Math.PI * 2, phi = (this.random() - .5) * Math.PI;
      secretoryMantle.push({
        position: new THREE.Vector3(
          1.15 + r * Math.cos(theta) * Math.cos(phi),
          .52 + r * Math.sin(theta) * Math.cos(phi) * 0.9,
          .08 + r * Math.sin(phi) * 0.7
        ),
        scale: new THREE.Vector3(.0075, .0075, .0075)
      });
    }
    this.instances(secretoryMantle, secretoryVesicle, 1);

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
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); this.mesh(geometry, ergosterolMembrane);
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
    this.instances(vesicles, ergosterolMembrane, 1);

    // Polyphosphate (volutin) granules inside the fungal vacuolar lumen:
    // Essential fungal energy/phosphate storage hallmark
    const polyphosphateGranules: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    for (let i = 0; i < 28; i++) {
      const u = this.random() * Math.PI * 2, v = (this.random() - .5) * Math.PI;
      const r = Math.pow(this.random(), 0.5) * 0.7;
      const radius = .018 + this.random() * .022;
      polyphosphateGranules.push({
        position: new THREE.Vector3(
          .55 + Math.cos(u) * Math.cos(v) * .35 * r,
          -.1 + Math.sin(u) * Math.cos(v) * .38 * r,
          -.07 + Math.sin(v) * .20 * r
        ),
        scale: new THREE.Vector3(radius, radius, radius)
      });
    }
    this.instances(polyphosphateGranules, polyphosphate, 1);

    // Neutral lipid droplets (spherosomes) containing ergosterol esters & triacylglycerols
    const lipidDroplets: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    for (let i = 0; i < 36; i++) {
      const x = (this.random() - .5) * 2.5, y = (this.random() - .5) * 1.6;
      if ((x / 1.35) ** 2 + (y / .85) ** 2 > 1 || ((x + .55) / .42) ** 2 + ((y - .21) / .42) ** 2 < 1 || ((x - .55) / .53) ** 2 + ((y + .1) / .59) ** 2 < 1) continue;
      const r = .015 + Math.pow(this.random(), 2) * .022;
      lipidDroplets.push({
        position: new THREE.Vector3(x, y, -.02 + this.random() * .05),
        scale: new THREE.Vector3(r, r, r)
      });
    }
    this.instances(lipidDroplets, lipidDroplet, 1);

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
      const cisterna = this.tube(points, .014, j % 2 ? ergosterolMembrane : mitoOuter); cisterna.scale.z = .5;
    }
    // Dense but instanced cytoplasmic particles preserve a small draw-call count.
    const granules = [];
    for (let i = 0; i < 2100; i++) {
      const x = (this.random() - .5) * 2.8, y = (this.random() - .5) * 1.75;
      if ((x / 1.40) ** 2 + (y / .88) ** 2 > 1 || ((x + .55) / .40) ** 2 + ((y - .21) / .4) ** 2 < 1 || ((x - .55) / .51) ** 2 + ((y + .1) / .57) ** 2 < 1) continue;
      const r = .003 + this.random() ** 3 * .009;
      granules.push({ position: new THREE.Vector3(x, y, -.03 + this.random() * .04), scale: new THREE.Vector3(r, r, r) });
    }
    this.instances(granules, ribosome, 1);
    this.body.rotation.z = -.18;
  }
  render(renderer: THREE.WebGLRenderer, progress: number, width: number, height: number, origin = { x: .7, y: .61 }, handoff = 0) {
    const signature = `${width}:${height}:${progress.toFixed(5)}:${origin.x.toFixed(4)}:${origin.y.toFixed(4)}:${handoff.toFixed(3)}`;
    if (this.lastView === signature) return;
    this.lastView = signature;
    const started = performance.now();
    if (this.target.width !== width || this.target.height !== height) this.target.setSize(width, height);
    const aspect = width / height;
    this.camera.aspect = aspect;
    const journey = cellJourney(progress);
    // The closed cell approaches on the same focal path as the living field.
    const fit = Math.max(5.1, 5.8 / aspect);
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
    this.body.rotation.z = -.18;
    this.body.scale.setScalar(1);
    if (handoff > 0) {
      const finale = cellFinale(handoff);
      this.front.material.opacity = Math.max(1 - journey.opening, finale.close);
      this.front.visible = true;
      this.glowLight.intensity = finale.glow * 18.0;

      // Smoothly align 3D rotation, vertical center and scale with Bioprocess hero spore
      const alignT = THREE.MathUtils.clamp(handoff / 0.35, 0, 1);
      const easeAlign = alignT * alignT * (3 - 2 * alignT);
      const curRotX = .18 - journey.opening * .08;
      const curRotY = -.32 + journey.opening * .42 + journey.inspect * .08;
      const curRotZ = -.18;
      this.body.rotation.x = THREE.MathUtils.lerp(curRotX, -0.15, easeAlign);
      this.body.rotation.y = THREE.MathUtils.lerp(curRotY, 0.10, easeAlign);
      this.body.rotation.z = THREE.MathUtils.lerp(curRotZ, 0.0, easeAlign);

      const targetX = THREE.MathUtils.lerp(x, 0.50 + 0.009, easeAlign);
      const targetY = THREE.MathUtils.lerp(endY, 0.50 - 0.006, easeAlign);
      this.body.position.set((targetX - .5) * halfHeight * 2 * aspect, (targetY - .5) * halfHeight * 2, 0);

      // Match the exact 3D screen silhouette and aspect ratio of Bioprocess's hero spore
      const targetScaleX = THREE.MathUtils.lerp(1.0, 0.71, easeAlign);
      const targetScaleY = THREE.MathUtils.lerp(1.0, 1.40, easeAlign);
      const targetScaleZ = THREE.MathUtils.lerp(1.0, 1.10, easeAlign);
      this.body.scale.set(targetScaleX, targetScaleY, targetScaleZ);
    } else {
      this.front.material.opacity = 1 - journey.opening;
      this.front.visible = journey.opening < .999;
      this.glowLight.intensity = 0;
    }
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
