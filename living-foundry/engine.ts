import * as THREE from "three";
import type { FungalCell } from "./FungalCell";
import { cellRenderSize } from "./cell-quality";
import { cellJourney, settleCellProgress } from "./material-transition";
import { fieldView, screenToField, fieldToScreen } from "./composition";
import { phenotype, approach } from "./phenotypes";
import { vertex, environment, biology, display } from "./shaders";
import { seedField } from "./seed";
import { selectQuality, PerformanceBudget } from "./performance";
export type EngineSettings = { feed: number; kill: number; view: number };
export class FoundryEngine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  geometry = new THREE.PlaneGeometry(2, 2);
  mesh: THREE.Mesh;
  env: THREE.WebGLRenderTarget[] = [];
  bio: THREE.WebGLRenderTarget[] = [];
  envMaterial: THREE.ShaderMaterial;
  bioMaterial: THREE.ShaderMaterial;
  displayMaterial: THREE.ShaderMaterial;
  copyMaterial: THREE.ShaderMaterial;
  quality = selectQuality(innerWidth, matchMedia("(pointer:coarse)").matches);
  budget = new PerformanceBudget();
  cellBudget = new PerformanceBudget();
  private cellIdle: number | null = null;
  width = 0;
  height = 0;
  frame = 0;
  last = 0;
  elapsed = 0;
  steps = 0;
  stage = 0;
  visualStage = 0;
  held = false;
  viewScale = 1;
  composition = fieldView(0, innerWidth <= 600);
  boundary = 0;
  private fieldHasBoundary = false;
  private snapshotHasBoundary = false;
  regime = phenotype(0);
  materialProgress = 0;
  materialTarget = 0;
  private materialPastEnd = false;
  private materialElement: HTMLElement | null = null;
  tissue = 0;
  materialRequested = false;
  disposed = false;
  cell: FungalCell | null = null;
  materialSnapshot: THREE.WebGLRenderTarget | null = null;
  paused = false;
  failed = false;
  visible = true;
  stimulusUntil = 0;
  seed = 2718;
  settings: EngineSettings = { feed: 0.0367, kill: 0.0649, view: 0 };
  onStatus: (status: string) => void;
  constructor(canvas: HTMLCanvasElement, onStatus: (status: string) => void, private onFailure?: (reason: string) => void) {
    this.onStatus = onStatus;
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!context || !context.getExtension("EXT_color_buffer_float"))
      throw new Error("Float WebGL2 targets unavailable");
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: false,
    });
    this.renderer.setClearColor(0, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality.dpr));
    this.renderer.debug.onShaderError = () => this.fallback("shader-failure");
    const make = (
      fragmentShader: string,
      uniforms: Record<string, THREE.IUniform>,
    ) =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });
    this.envMaterial = make(environment, {
      previous: { value: null },
      texel: { value: new THREE.Vector2() },
      pointer: { value: new THREE.Vector2(-2, -2) },
      stimulus: { value: 0 },
      aspect: { value: 1 },
      dt: { value: 1 / 30 },
      boundary: { value: 0 },
    });
    this.bioMaterial = make(biology, {
      previous: { value: null },
      environmentField: { value: null },
      texel: { value: new THREE.Vector2() },
      feed: { value: 0.0367 },
      kill: { value: 0.0649 },
      diffusion: { value: 0.48 },
      alignment: { value: 0 },
      boundary: { value: 0 },
    });
    this.displayMaterial = make(display, {
      biologyField: { value: null },
      environmentField: { value: null },
      stage: { value: 0 },
      time: { value: 0 },
      viewScale: { value: 1 },
      screenCenter: { value: new THREE.Vector2(.698, .61) },
      conditionsView: { value: 0 },
      texel: { value: new THREE.Vector2() },
      aspect: { value: 1 },
      boundary: { value: 0 },
      debugView: { value: 0 },
      verticalOffset: { value: innerWidth <= 600 ? 0.16 : 0 },
      materialProgress: { value: 0 },
      tissue: { value: 0 },
      materialPhoto: { value: null },
      materialReady: { value: 0 },
      photoAspect: { value: 1.25 },
      materialFocus: { value: new THREE.Vector2(0.698, 0.61) },
    });
    this.displayMaterial.transparent = true;
    this.copyMaterial = make(
      "varying vec2 vUv;uniform sampler2D source;void main(){gl_FragColor=texture2D(source,vUv);}",
      { source: { value: null } },
    );
    this.mesh = new THREE.Mesh(this.geometry, this.copyMaterial);
    this.scene.add(this.mesh);
    this.resize(true);
    if (this.failed) { this.dispose(); throw new Error("Shader initialization failed"); }
    document.documentElement.dataset.engine = "live";
    this.onStatus(this.quality.name);
    this.frame = requestAnimationFrame(this.tick);
    // The growing field remains the visual foundation. Reference artwork is not
    // loaded as an opaque foreground layer.
  }
  loadMaterial() {
    if (this.materialRequested || this.disposed || this.failed) return;
    this.materialRequested = true;
    const prepare = async () => {
      this.cellIdle = null;
      try {
        const { FungalCell } = await import("./FungalCell");
        const cell = await FungalCell.create(() => this.disposed || this.failed);
        if (!cell) return;
        if (this.disposed || this.failed) { cell.dispose(); return; }
        this.cell = cell;
        this.displayMaterial.uniforms.materialPhoto.value = cell.target.texture;
        const pixels = cellRenderSize(innerWidth, innerHeight, devicePixelRatio, matchMedia("(pointer:coarse)").matches, this.budget.degraded);
        cell.render(this.renderer, 0, pixels.width, pixels.height);
        if (this.failed) return;
        this.displayMaterial.uniforms.materialReady.value = 1;
        document.documentElement.dataset.materialReady = "true";
        if (this.paused) this.materialProgress = this.materialTarget;
        this.render();
      } catch {
        document.documentElement.dataset.materialReady = "false";
        this.fallback("cell-unavailable");
      }
    };
    if ("requestIdleCallback" in window) this.cellIdle = requestIdleCallback(() => { void prepare(); }, { timeout: 1200 });
    else void prepare();
  }
  setMaterialTarget(progress: number, pastEnd: boolean) {
    const previous = this.materialProgress;
    this.materialTarget = progress;
    this.materialElement ??= document.getElementById("material");
    if (this.materialElement) this.materialElement.dataset.target = progress.toFixed(3);
    // Match the published exit: restore the field while the cell layer is faded out.
    if (pastEnd) this.materialProgress = 0;
    else if (this.paused || this.materialPastEnd) this.materialProgress = this.cell ? progress : Math.min(.045, progress);
    this.materialPastEnd = pastEnd;
    return previous !== this.materialProgress;
  }
  captureMaterial() {
    this.snapshotHasBoundary = this.fieldHasBoundary;
    this.materialSnapshot = new THREE.WebGLRenderTarget(
      this.width,
      this.height,
      {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
      },
    );
    this.copyMaterial.uniforms.source.value = this.bio[0].texture;
    this.pass(this.copyMaterial, this.materialSnapshot);
    // The published approach follows occupied biology, rather than a fixed screen point.
    const cells = new Uint16Array(this.width * this.height * 4);
    this.renderer.readRenderTargetPixels(this.bio[0], 0, 0, this.width, this.height, cells);
    let best = -Infinity;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const b = THREE.DataUtils.fromHalfFloat(cells[(y * this.width + x) * 4 + 1]);
        if (b < 0.2) continue;
        const right = THREE.DataUtils.fromHalfFloat(cells[(y * this.width + Math.min(this.width - 1, x + 1)) * 4 + 1]);
        const score = Math.abs(right - b) * 3 + Math.min(b, .3) - Math.hypot(x / this.width - .698, y / this.height - .61);
        if (score > best) {
          best = score;
          this.displayMaterial.uniforms.materialFocus.value.set((x + .5) / this.width, (y + .5) / this.height);
        }
      }
    }
    this.renderer.domElement.dataset.materialFocus = String(best);
  }
  pass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.mesh.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }
  resize = (initial = false) => {
    if (this.failed || this.disposed) return;
    if (!this.budget.degraded) {
      const previousTier = this.quality.name;
      this.quality = selectQuality(innerWidth, matchMedia("(pointer:coarse)").matches);
      if (previousTier !== this.quality.name) this.onStatus(this.quality.name);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality.dpr));
    }
    const aspect = innerWidth / innerHeight;
    this.envMaterial.uniforms.aspect.value = aspect;
    this.displayMaterial.uniforms.aspect.value = aspect;
    this.displayMaterial.uniforms.verticalOffset.value =
      innerWidth <= 600 ? 0.16 : 0;
    this.renderer.setSize(innerWidth, innerHeight, false);
    const w = Math.round(this.quality.grid * (aspect >= 1 ? 1 : aspect)),
      h = Math.round(this.quality.grid * (aspect >= 1 ? 1 / aspect : 1));
    if (w === this.width && h === this.height && !initial) { this.render(); return; }
    const oldEnv = this.env,
      oldBio = this.bio;
    this.width = w;
    this.height = h;
    const target = () =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      });
    this.env = [target(), target()];
    this.bio = [target(), target()];
    this.envMaterial.uniforms.texel.value.set(1 / w, 1 / h);
    this.bioMaterial.uniforms.texel.value.set(1 / w, 1 / h);
    this.displayMaterial.uniforms.texel.value.set(1 / w, 1 / h);
    this.envMaterial.uniforms.aspect.value = aspect;
    this.displayMaterial.uniforms.aspect.value = aspect;
    if (oldBio.length) {
      this.copyMaterial.uniforms.source.value = oldBio[0].texture;
      this.bio.forEach((t) => this.pass(this.copyMaterial, t));
      this.copyMaterial.uniforms.source.value = oldEnv[0].texture;
      this.env.forEach((t) => this.pass(this.copyMaterial, t));
      oldEnv.concat(oldBio).forEach((t) => t.dispose());
    } else this.reset();
    this.render();
  };
  reset = () => {
    this.materialSnapshot?.dispose();
    this.materialSnapshot = null;
    this.fieldHasBoundary = false;
    this.snapshotHasBoundary = false;
    const texture = new THREE.DataTexture(
      seedField(this.width, this.height, this.seed),
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    texture.needsUpdate = true;
    this.copyMaterial.uniforms.source.value = texture;
    this.bio.forEach((t) => this.pass(this.copyMaterial, t));
    texture.dispose();
    this.env.forEach((t) => {
      this.renderer.setRenderTarget(t);
      this.renderer.clear();
    });
    this.steps = 0;
    this.elapsed = 0;
    this.stimulusUntil = 0;
    this.held = false;
    this.envMaterial.uniforms.stimulus.value = 0;
    // Warm only the seed; environmental conditions remain untouched.
    for (let i = 0; i < 40; i++) this.stepBiology();
    this.render();
  };
  influence(x = 0.7, y = innerWidth <= 600 ? 0.23 : 0.39, strength = 1) {
    if (this.paused || this.failed || this.materialProgress > 0) return;
    const point = screenToField({ x, y: 1 - y }, this.composition);
    this.envMaterial.uniforms.pointer.value.set(point.x, point.y);
    this.envMaterial.uniforms.stimulus.value = strength;
    this.stimulusUntil = performance.now() + 700;
  }
  stepBiology() {
    // A removed wall leaves a straight edge in the biological history. Keep that
    // edge's presentation envelope attached to the field, including saved views.
    if (this.boundary > .5) this.fieldHasBoundary = true;
    this.bioMaterial.uniforms.previous.value = this.bio[0].texture;
    this.bioMaterial.uniforms.environmentField.value = this.env[0].texture;
    this.bioMaterial.uniforms.feed.value = this.regime.feed + this.settings.feed - 0.0367;
    this.bioMaterial.uniforms.kill.value = this.regime.kill + this.settings.kill - 0.0649;
    this.bioMaterial.uniforms.diffusion.value = this.regime.diffusion;
    this.bioMaterial.uniforms.alignment.value = Math.max(Math.max(0, 1 - Math.abs(this.visualStage - 9)), this.stage === 4 ? .5 : 0);
    this.bioMaterial.uniforms.boundary.value = this.boundary;
    this.pass(this.bioMaterial, this.bio[1]);
    this.bio.reverse();
    this.steps++;
  }
  render() {
    if (this.failed || this.disposed) return;
    const journey = cellJourney(this.materialProgress);
    const cellView = this.cell && this.materialProgress > 0;
    const pixels = cellRenderSize(innerWidth, innerHeight, devicePixelRatio, matchMedia("(pointer:coarse)").matches, this.budget.degraded || this.cellBudget.degraded);
    const ratio = cellView ? pixels.ratio : Math.min(devicePixelRatio, this.budget.degraded ? 1 : this.quality.dpr);
    if (Math.abs(this.renderer.getPixelRatio() - ratio) > .001) {
      this.renderer.setDrawingBufferSize(innerWidth, innerHeight, ratio);
    }
    // Preserve the visitor's actual field at the threshold. Scroll reveals that same history
    // without letting colonies drift out of the magnified view while the cell interior appears.
    if (this.materialProgress > 0 && !this.materialSnapshot)
      this.captureMaterial();

    this.displayMaterial.uniforms.biologyField.value =
      this.materialProgress > 0 && this.materialSnapshot ? this.materialSnapshot.texture : this.bio[0].texture;
    const source = this.materialProgress > 0 ? this.materialSnapshot : null;
    this.displayMaterial.uniforms.texel.value.set(1 / (source?.width ?? this.width), 1 / (source?.height ?? this.height));
    this.displayMaterial.uniforms.environmentField.value = this.env[0].texture;
    const displayStage = this.visualStage;
    this.displayMaterial.uniforms.stage.value = displayStage;
    this.displayMaterial.uniforms.time.value = this.elapsed;
    this.composition = fieldView(displayStage, innerWidth <= 600);
    this.viewScale = this.composition.scale;
    this.displayMaterial.uniforms.viewScale.value = this.viewScale;
    this.displayMaterial.uniforms.screenCenter.value.set(this.composition.center.x, this.composition.center.y);
    this.displayMaterial.uniforms.conditionsView.value = this.composition.conditions;
    this.displayMaterial.uniforms.tissue.value = this.tissue;
    this.displayMaterial.uniforms.materialProgress.value = this.materialProgress;
    this.materialElement ??= document.getElementById("material");
    if (this.materialElement) {
      this.materialElement.style.setProperty("--material-progress", String(this.materialProgress));
      this.materialElement.style.setProperty("--heading-opacity", String(journey.heading));
      this.materialElement.dataset.progress = this.materialProgress.toFixed(3);
    }
    this.displayMaterial.uniforms.boundary.value = this.boundary || Number(source ? this.snapshotHasBoundary : this.fieldHasBoundary);
    this.displayMaterial.uniforms.debugView.value = this.settings.view;
    if (this.cell && cellView) {
      const focus = this.displayMaterial.uniforms.materialFocus.value as THREE.Vector2;
      const origin = fieldToScreen(focus, this.composition);
      const ms = this.cell.render(this.renderer, this.materialProgress, pixels.width, pixels.height, origin);
      if (typeof ms === "number") {
        const decision = this.cellBudget.observe(ms);
        if (decision === "fallback") { this.fallback("cell-performance"); return; }
      }
      this.displayMaterial.uniforms.materialReady.value = 1;
      document.documentElement.dataset.materialReady = "true";
      this.displayMaterial.uniforms.photoAspect.value = innerWidth / innerHeight;
    }
    this.pass(this.displayMaterial, null);
  }
  tick = (now: number) => {
    if (this.failed) return;
    this.frame = requestAnimationFrame(this.tick);
    if (
      this.paused ||
      document.hidden ||
      !this.visible
    ) {
      this.last = now;
      return;
    }
    const cellTransition = this.materialTarget > 0 || this.materialProgress > 0;
    const fps = cellTransition ? (this.cellBudget.degraded ? 24 : innerWidth <= 600 ? 30 : 60) : this.quality.fps;
    const interval = 1000 / fps;
    if (now - this.last < interval) return;
    const frameGap = now - this.last;
    const delta = Math.min(frameGap / 1000, 0.08);
    this.last = now;
    if (cellTransition) {
      // Hold the field while the model warms, then resolve both layers on one timeline.
      const target = this.cell ? this.materialTarget : Math.min(.045, this.materialTarget);
      const next = settleCellProgress(this.materialProgress, target, delta);
      if (next !== this.materialProgress) {
        this.materialProgress = next;
        this.render();
      }
      return;
    }
    const start = performance.now();
    this.elapsed += delta;
    this.visualStage = approach(this.visualStage, this.stage, delta * 3);
    const target = phenotype(this.stage);
    this.regime.feed = approach(this.regime.feed, target.feed, delta);
    this.regime.kill = approach(this.regime.kill, target.kill, delta);
    this.regime.diffusion = approach(this.regime.diffusion, target.diffusion, delta);
    this.envMaterial.uniforms.previous.value = this.env[0].texture;
    this.envMaterial.uniforms.dt.value = delta;
    this.envMaterial.uniforms.boundary.value = this.boundary;
    if (!this.held && now > this.stimulusUntil) this.envMaterial.uniforms.stimulus.value = 0;
    this.pass(this.envMaterial, this.env[1]);
    this.env.reverse();
    // Arrival remains dormant. Later chapters release a larger simulation budget.
    const targetSteps = [0, 1800, 3000, 4500, 6000, 6000, 6000, 7000, 8000, 9000][this.stage] ?? 0;
    const count =
      this.stage < 0.5
        ? 1
        : this.steps < targetSteps
          ? this.quality.steps * 3
          : this.quality.steps;
    for (let i = 0; i < count; i++) this.stepBiology();
    this.render();
    const decision = this.budget.observe(
      Math.max(performance.now() - start, frameGap - interval),
    );
    if (decision === "reduce") {
      this.quality = {
        ...this.quality,
        grid: Math.round(this.quality.grid * 0.65),
        fps: 20,
        steps: 2,
        dpr: 1,
      };
      this.renderer.setPixelRatio(1);
      this.resize();
      this.onStatus("adapted");
    }
    if (decision === "fallback") this.fallback("performance");
  };
  fallback(reason: string) {
    if (this.failed || this.disposed) return;
    this.failed = true;
    cancelAnimationFrame(this.frame);
    // Let the owner preserve the reading position before the static layout changes.
    queueMicrotask(() => {
      if (this.disposed) return;
      if (this.onFailure) this.onFailure(reason);
      else { this.dispose(); document.documentElement.dataset.engine = "static"; this.onStatus(reason); }
    });
  }

  probe() {
    const values = new Uint16Array(this.width * this.height * 4);
    this.renderer.readRenderTargetPixels(
      this.bio[0],
      0,
      0,
      this.width,
      this.height,
      values,
    );
    let mass = 0,
      outside = 0;
    for (let i = 0; i < values.length; i += 4) {
      const b = THREE.DataUtils.fromHalfFloat(values[i + 1]);
      mass += b;
      if (((i / 4) % this.width) / this.width > 0.735) outside += b;
    }
    return { mass, outside };
  }
  verify() {
    const oldPause = this.paused,
      oldBoundary = this.boundary,
      oldSettings = { ...this.settings },
      oldRegime = { ...this.regime },
      oldVisualStage = this.visualStage;
    this.paused = true;
    this.boundary = 0;
    this.regime = phenotype(0);
    this.visualStage = 0;
    this.settings = { feed: 0.0367, kill: 0.0649, view: 0 };
    this.reset();
    const first = this.probe().mass;
    this.reset();
    const repeat = this.probe().mass;
    for (let i = 0; i < 300; i++) this.stepBiology();
    const baseline = this.probe().mass;
    this.reset();
    this.envMaterial.uniforms.pointer.value.set(0.7, 0.61);
    this.envMaterial.uniforms.stimulus.value = 1;
    this.envMaterial.uniforms.dt.value = 1 / 30;
    this.envMaterial.uniforms.previous.value = this.env[0].texture;
    this.pass(this.envMaterial, this.env[1]);
    this.env.reverse();
    const immediate = this.probe().mass;
    for (let i = 0; i < 60; i++) {
      this.envMaterial.uniforms.previous.value = this.env[0].texture;
      this.pass(this.envMaterial, this.env[1]);
      this.env.reverse();
      for (let j = 0; j < 5; j++) this.stepBiology();
    }
    const influenced = this.probe().mass;
    this.boundary = 1;
    for (let i = 0; i < 600; i++) this.stepBiology();
    const constrained = this.probe();
    const result = `Seed repeatability: ${Math.abs(first - repeat) < 0.001 ? "PASS" : "FAIL"}\nNo direct biological injection: ${Math.abs(first - immediate) < 0.001 ? "PASS" : "FAIL"}\nDelayed response: ${Math.abs(baseline - influenced) > 0.01 ? "PASS" : "FAIL"} (${Math.abs(baseline - influenced).toFixed(2)})\nBoundary exclusion: ${constrained.outside < 0.001 ? "PASS" : "FAIL"}\nLiving concentration: ${constrained.mass.toFixed(2)}`;
    this.settings = oldSettings;
    this.regime = oldRegime;
    this.visualStage = oldVisualStage;
    this.boundary = oldBoundary;
    this.reset();
    this.paused = oldPause;
    return result;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.cellIdle !== null) cancelIdleCallback(this.cellIdle);
    this.cell?.dispose();

    this.materialSnapshot?.dispose();
    delete document.documentElement.dataset.materialReady;
    cancelAnimationFrame(this.frame);
    this.env.concat(this.bio).forEach((t) => t.dispose());
    [
      this.envMaterial,
      this.bioMaterial,
      this.displayMaterial,
      this.copyMaterial,
    ].forEach((m) => m.dispose());
    this.geometry.dispose();
    this.renderer.dispose();
    delete document.documentElement.dataset.engine;
  }
}
