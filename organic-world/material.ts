import * as THREE from "three";

/** Quiet matte relief; only the finest grain is shading, the lamellae are modeled. */
export function livingMaterial(field?: THREE.Texture, strength = 1) {
  const material = new THREE.MeshStandardMaterial({
    color: "#F4F1E8", vertexColors: true, roughness: .96,
    metalness: 0, side: THREE.DoubleSide,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.growthField = { value: field ?? null };
    shader.uniforms.growthStrength = { value: field ? strength : 0 };
    shader.vertexShader = "attribute vec3 growthDirection; uniform sampler2D growthField; uniform float growthStrength; varying vec3 vOrganicPosition; varying float vGrowth;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
      #include <begin_vertex>
      vec3 biological = texture2D(growthField,uv).rgb;
      vGrowth = biological.b * growthStrength;
      float ridgeGrowth = .28 + .09 * sin(position.y*12. + position.x*9.);
      transformed += growthDirection * vGrowth * ridgeGrowth;
      vOrganicPosition = transformed;
    `);
    shader.fragmentShader = `
      varying vec3 vOrganicPosition;
      varying float vGrowth;
      float hash3(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
      float grain(vec3 p) {
        vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `
      #include <color_fragment>
      float g = grain(vOrganicPosition*105.);
      float pores = smoothstep(.72,.91,grain(vOrganicPosition*38.));
      diffuseColor.rgb *= .92 + g*.10 - pores*.11 - vGrowth*.14;
    `);
    shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor - vGrowth*.1,.78,1.);");
  };
  material.customProgramCacheKey = () => "huner-organic-growth-05";
  return material;
}
