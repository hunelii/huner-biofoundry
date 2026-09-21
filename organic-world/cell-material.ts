import * as THREE from "three";
import { livingMaterial, type ReadingComposition } from "./material";

/** The field's alpha channel is accumulated tissue maturity, blue is delayed morphology. */
export function focalCellMaterial(field:THREE.Texture,composition?:ReadingComposition){
  const material=livingMaterial(field,0,composition);
  const compile=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
    compile.call(material,shader,renderer);
    shader.vertexShader=`
      attribute vec3 maturePosition;
      attribute vec3 matureNormal;
      attribute vec2 development;
      varying float vCellMaturity;
      varying float vCellOcclusion;
    `+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace("#include <beginnormal_vertex>",`
      vec4 cellField=texture2D(growthField,uv);
      float maturation=smoothstep(development.x,development.x+development.y,cellField.a);
      #include <beginnormal_vertex>
      objectNormal=normalize(mix(normal,matureNormal,maturation));
    `);
    const start=shader.vertexShader.indexOf("      vEdgeOpacity=edgeOpacity;");
    const end=shader.vertexShader.indexOf("      vOrganicPosition = transformed;",start);
    shader.vertexShader=shader.vertexShader.slice(0,start)+`
      vEdgeOpacity=edgeOpacity;
      vGrowth=cellField.b*.22;
      vCellMaturity=maturation;
      transformed=mix(position,maturePosition,maturation);
      // Local, field-driven flex is secondary to permanent deposition and pore development.
      transformed+=growthDirection*cellField.b*.014*sin(position.y*19.+position.x*11.);
      vCellOcclusion=mix(.42,1.,smoothstep(-6.19,-5.80,transformed.z));
    `+shader.vertexShader.slice(end);
    shader.fragmentShader="varying float vCellMaturity; varying float vCellOcclusion;\n"+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace("#include <color_fragment>",`
      #include <color_fragment>
      diffuseColor.rgb*=vCellOcclusion*(1.-vCellMaturity*.045);
    `);
    // Fine relief is a subordinate surface finish; major folds, pores and fibers are mesh geometry.
    shader.fragmentShader=shader.fragmentShader.replace("#include <normal_fragment_maps>",`
      #include <normal_fragment_maps>
      float micro=grain(vOrganicPosition*430.);
      vec3 grainSlope=vec3(dFdx(micro),dFdy(micro),0.);
      normal=normalize(normal+grainSlope*.09);
    `);
  };
  material.customProgramCacheKey=()=>"huner-cell-maturation-01";
  return material;
}
