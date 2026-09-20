import * as THREE from "three";

/** Quiet matte relief; only the finest grain is shading, the lamellae are modeled. */
export type ReadingComposition = { room: THREE.IUniform<number>; sweep: THREE.IUniform<number>; viewport: THREE.IUniform<THREE.Vector2> };
export function livingMaterial(field?: THREE.Texture, strength = 1, composition?: ReadingComposition) {
  const material = new THREE.MeshStandardMaterial({
    color: "#F4F1E8", vertexColors: true, roughness: .96,
    metalness: 0, side: THREE.DoubleSide, transparent:true, forceSinglePass:true,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.growthField = { value: field ?? null };
    shader.uniforms.growthStrength = { value: field ? strength : 0 };
    shader.uniforms.readingRoom = composition?.room ?? { value: 0 };
    shader.uniforms.readingSweep = composition?.sweep ?? { value: 0 };
    shader.uniforms.organicViewport = composition?.viewport ?? { value: new THREE.Vector2(1, 1) };
    shader.vertexShader = "attribute float edgeOpacity; varying float vEdgeOpacity; attribute vec3 growthDirection; uniform sampler2D growthField; uniform float growthStrength; varying vec3 vOrganicPosition; varying float vGrowth;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
      #include <begin_vertex>
      vEdgeOpacity=edgeOpacity;
      vec3 biological = texture2D(growthField,uv).rgb;
      vGrowth = biological.b * growthStrength;
      float ridgeGrowth = .28 + .09 * sin(position.y*12. + position.x*9.);
      transformed += growthDirection * vGrowth * ridgeGrowth;
      vOrganicPosition = transformed;
    `);
    shader.fragmentShader = `
      varying vec3 vOrganicPosition;
      varying float vGrowth;
      varying float vEdgeOpacity;
      uniform float readingRoom;
      uniform float readingSweep;
      uniform vec2 organicViewport;
      float hash3(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
      float grain(vec3 p) {
        vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `
      #include <color_fragment>
      float g = grain(vOrganicPosition*280.);

      diffuseColor.a *= vEdgeOpacity;
      diffuseColor.rgb *= .975 + g*.035 - vGrowth*.09;
    `);
    shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor - vGrowth*.1,.78,1.);");
    // A broad composition wash belongs to the entire world, never to text rectangles.
    // Apply after tone mapping so its paper endpoint exactly matches Culture White.
    shader.fragmentShader = shader.fragmentShader.replace("#include <colorspace_fragment>", `
      #include <colorspace_fragment>
      vec2 screen = gl_FragCoord.xy / organicViewport;
      float spatialPresence = smoothstep(.27+readingSweep*.18,.73+readingSweep*.10,screen.x)
        * smoothstep(.025,.32,screen.y) * (1. - smoothstep(.82,.99,screen.y));
      gl_FragColor.rgb = mix(vec3(.956862745,.945098039,.909803922),gl_FragColor.rgb,mix(1.,spatialPresence,readingRoom));
    `);
  };
  material.customProgramCacheKey = () => "huner-organic-growth-reading-06";
  return material;
}
