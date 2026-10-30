// Independent ping-pong fields: raw stimulus → delayed environment → biology.
export const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const environment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D previous;
uniform vec2 texel, pointer;
uniform float stimulus, aspect, dt, boundary;
void main(){
 vec2 c=texture2D(previous,vUv).rg;
 vec2 lap=(texture2D(previous,vUv+vec2(texel.x,0.)).rg+texture2D(previous,vUv-vec2(texel.x,0.)).rg+texture2D(previous,vUv+vec2(0.,texel.y)).rg+texture2D(previous,vUv-vec2(0.,texel.y)).rg)*.25-c;
 float d=length((vUv-pointer)*vec2(aspect,1.));
 float deposit=exp(-d*d/.006)*stimulus;
 float raw=clamp(c.r+dt*(lap.r*2.-c.r*.8+deposit*2.8),0.,1.);
 // The effective condition follows the raw field with ~0.7 seconds of inertia.
 float delayed=clamp(c.g+dt*(lap.g+(c.r-c.g)*1.4),0.,1.);
 if(boundary>0.5 && vUv.x>.735){raw*=.96;delayed*=.96;}
 gl_FragColor=vec4(raw,delayed,0.,1.);
}`;
export const biology = `
precision highp float;
varying vec2 vUv;
uniform sampler2D previous, environmentField;
uniform vec2 texel;
uniform float feed, kill, boundary, diffusion, alignment;
vec2 cell(vec2 p,vec2 center){
 // Reflecting (no-flux) wall: neighbor samples cannot cross the foundry line.
 if(boundary>.5 && vUv.x<=.735 && p.x>.735)return center;
 return texture2D(previous,clamp(p,texel,1.-texel)).rg;
}
void main(){
 vec2 c=texture2D(previous,vUv).rg;
 if(boundary>.5 && vUv.x>.735){gl_FragColor=vec4(1.,0.,0.,1.);return;}
 vec2 lap=-c;
 lap+=.2*(cell(vUv+vec2(texel.x,0.),c)+cell(vUv-vec2(texel.x,0.),c)+cell(vUv+vec2(0.,texel.y),c)+cell(vUv-vec2(0.,texel.y),c));
 lap+=.05*(cell(vUv+texel,c)+cell(vUv-texel,c)+cell(vUv+vec2(texel.x,-texel.y),c)+cell(vUv+vec2(-texel.x,texel.y),c));
 // Directional diffusion turns the material regime toward connected strands.
 lap+=alignment*.12*(cell(vUv+vec2(texel.x,0.),c)+cell(vUv-vec2(texel.x,0.),c)-cell(vUv+vec2(0.,texel.y),c)-cell(vUv-vec2(0.,texel.y),c));
 float e=texture2D(environmentField,vUv).g;
 float f=feed+e*.009;
 float k=kill-e*.003;
 float reaction=c.r*c.g*c.g;
 vec2 result=c+vec2(lap.r-reaction+f*(1.-c.r),diffusion*lap.g+reaction-(k+f)*c.g);
 gl_FragColor=vec4(clamp(result,0.,1.),0.,1.);
}`;
export const display = `
precision highp float;
varying vec2 vUv;
uniform sampler2D biologyField, environmentField;
uniform float stage, aspect, boundary, debugView, verticalOffset, time, viewScale;
uniform vec2 screenCenter;
uniform float conditionsView;
uniform vec2 texel;
uniform sampler2D materialPhoto;
uniform float materialProgress, materialReady, photoAspect, tissue;
uniform vec2 materialFocus;
// Shared concentration creates connected sheets at several spatial scales.
float tissueHeight(vec2 p) {
 float center=texture2D(biologyField,p).g;
 vec2 radius=texel*mix(3.,12.,tissue);
 float spread=(texture2D(biologyField,p+vec2(radius.x,0.)).g+texture2D(biologyField,p-vec2(radius.x,0.)).g+texture2D(biologyField,p+vec2(0.,radius.y)).g+texture2D(biologyField,p-vec2(0.,radius.y)).g)*.25;
 return mix(center,center*.35+spread*.9,tissue);
}
void main(){
 float progress=materialProgress;
 float expansion=smoothstep(0.,.58,progress);
 // Texture and 3D specimen share a focal point and one camera approach.
 vec2 origin=screenCenter+(materialFocus-vec2(.698,.61))*viewScale+vec2(0.,verticalOffset);
 vec2 focal=mix(origin,vec2(.5,aspect<.7?.55:.52),smoothstep(.02,.5,progress));
 vec2 fieldUv=materialFocus+(vUv-focal)/(viewScale*mix(1.,4.8,expansion));
 float b=tissue>.001 ? tissueHeight(fieldUv) : texture2D(biologyField,fieldUv).g;
 float rightDissolve=smoothstep(.55,.98,vUv.x)*conditionsView;
 if(conditionsView>.001) {
   vec2 blur=texel*mix(.5,7.,rightDissolve);
   float soft=texture2D(biologyField,fieldUv).g*.28;
   soft+=(texture2D(biologyField,fieldUv+vec2(blur.x,0.)).g+texture2D(biologyField,fieldUv-vec2(blur.x,0.)).g+texture2D(biologyField,fieldUv+vec2(0.,blur.y)).g+texture2D(biologyField,fieldUv-vec2(0.,blur.y)).g)*.18;
   b=mix(b,soft,rightDissolve);
 }
 float edge=mix(.035,.008,expansion);
 edge+=rightDissolve*.095;
 float scentWeight=1.-smoothstep(.05,.7,abs(stage-8.));
 float foodWeight=1.-smoothstep(.05,.7,abs(stage-7.));
 float thresholdBase=mix(mix(.225,.18,foodWeight),.075,tissue);
 float density=smoothstep(thresholdBase-edge,thresholdBase+edge,b);
 float shell=exp(-pow((b-.26)/.038,2.));
 density=mix(density,shell*.8,scentWeight);
 // Concentration is a height field: light catches a membrane, not a flat blob.
 vec3 growthGreen=vec3(74.,103.,65.)/255.;
 vec3 cultureGreen=vec3(55.,79.,47.)/255.;
 vec3 foundryGreen=vec3(34.,49.,29.)/255.;
 vec3 cream=vec3(244.,241.,232.)/255.;
 vec2 delta=texel*.75;
 float bx=texture2D(biologyField,fieldUv+vec2(delta.x,0.)).g-texture2D(biologyField,fieldUv-vec2(delta.x,0.)).g;
 float by=texture2D(biologyField,fieldUv+vec2(0.,delta.y)).g-texture2D(biologyField,fieldUv-vec2(0.,delta.y)).g;
 if(tissue>.001){
   bx=tissueHeight(fieldUv+vec2(delta.x,0.))-tissueHeight(fieldUv-vec2(delta.x,0.));
   by=tissueHeight(fieldUv+vec2(0.,delta.y))-tissueHeight(fieldUv-vec2(0.,delta.y));
 }
 // Lamellae follow concentration contours, connecting the surface to its own growth history.
 float foldPhase=b*48.+fieldUv.y*24.;
 float folds=sin(foldPhase);
 float slope=1.+tissue*cos(foldPhase)*1.4;
 vec3 normal=normalize(vec3(-bx*22.*slope,-by*22.*slope,1.));
 float lighting=dot(normal,normalize(vec3(-.6,.8,1.2)))*.5+.5;
 float membrane=exp(-pow((b-mix(.245,.145,tissue))/.026,2.));
 float core=smoothstep(.26,.43,b);
 float micro=sin(fieldUv.x*1800.+sin(fieldUv.y*730.))*sin(fieldUv.y*1500.)*.025;
 vec3 color=mix(growthGreen,foundryGreen,core);
 color*=.58+lighting*.62+micro;
 color=mix(color,mix(growthGreen,cream,.60),membrane*lighting*.75);
 float ridge=pow(max(0.,dot(reflect(-normalize(vec3(-.6,.8,1.2)),normal),vec3(0.,0.,1.))),18.);
 color=mix(color,cream,ridge*mix(.26,.48,tissue)*density);
 float lamella=pow(.5+.5*folds,8.)*smoothstep(.12,.25,b)*tissue;
 color=mix(color,mix(growthGreen,cream,.64),lamella*.65);
 color*=1.-tissue*.28*pow(.5-.5*folds,5.);
 // Fragrance opens into translucent membranes; materials articulate fine internal ridges.
 float scent=1.-smoothstep(.05,.7,abs(stage-8.));
 float fiber=1.-smoothstep(.05,.7,abs(stage-9.));
 float veins=pow(.5+.5*sin(b*145.+fieldUv.y*42.),12.)*fiber;
 color=mix(color,cream,veins*.55);
 float opacity=density*mix(.9,.62,scent);
 float halo=smoothstep(.055,.20,b)*(1.-density)*mix(.16,.26,scent);
 opacity=max(opacity,halo);
 float immersion=(smoothstep(3.25,3.8,stage)*(1.-smoothstep(.15,.8,progress)));
 color=mix(color,mix(growthGreen,cream,lighting*.62),immersion*.65);
 float readingSpace=smoothstep(.19,.55,vUv.x);
 if(verticalOffset>.01) readingSpace*=smoothstep(.35,.56,vUv.y);
 opacity*=mix(1.,mix(.20,1.,readingSpace),smoothstep(.5,1.5,stage)*(1.-expansion)*(1.-conditionsView));
 // On paper, the entire field uses an ink wash; this never follows text boxes.
 float paperStudy=smoothstep(.5,1.2,stage)*(1.-smoothstep(3.1,3.7,stage))*(1.-conditionsView);
 opacity*=mix(1.,.52,paperStudy);
 color=mix(color,mix(color,cream,.18),paperStudy);
 // Broad tonal changes preserve the weave behind words without text-shaped clearings.
 float textTone=mix(.27,.62,smoothstep(.12,.60,vUv.x));
 float contour=pow(.5+.5*sin(b*105.+fieldUv.y*5.),3.);
 opacity*=mix(1.,.30+.70*contour,conditionsView*(1.-rightDissolve));
 color=mix(color,mix(cultureGreen,cream,.24+rightDissolve*.3),conditionsView*.62);
 opacity*=mix(1.,textTone*pow(1.-rightDissolve,1.35),conditionsView);
 // Keep the reflecting wall in the simulation, dissolve its visible edge before it
 // reaches that wall. The envelope persists through the camera's field snapshot.
 float wallPhase=max(boundary,smoothstep(2.25,2.8,stage)*(1.-smoothstep(5.15,6.,stage)));
 float wallWidth=.095+.018*sin(fieldUv.y*19.)+.012*sin(fieldUv.y*43.);
 opacity*=mix(1.,smoothstep(.006,wallWidth,.735-fieldUv.x),wallPhase);
 // Sampling outside the field must not expose clamped rows or columns of pixels.
 vec2 fieldEdge=smoothstep(vec2(0.),vec2(.045),fieldUv)*smoothstep(vec2(0.),vec2(.045),1.-fieldUv);
 opacity*=fieldEdge.x*fieldEdge.y;
 // Enter application compositions continuously, including on reverse scroll.
 vec2 center=vec2(.76,verticalOffset>.01?.74:.64);
 float distance=length((vUv-center)*vec2(1.,1.25));
 opacity*=mix(1.,1.-smoothstep(.18,.37,distance),smoothstep(6.,7.,stage));
 if(debugView>0.5){float e=texture2D(environmentField,fieldUv).g;gl_FragColor=vec4(vec3(55.,79.,47.)/255.,e*.9);return;}
 if(progress>0. && materialReady>.5){
   vec2 imageUv=(vUv-.5)*vec2(min(1.,aspect/photoAspect),min(1.,photoAspect/aspect))+.5;
   vec4 specimen=texture2D(materialPhoto,imageUv);
   vec3 photo=linearToOutputTexel(vec4(max(specimen.rgb,vec3(0.)),1.)).rgb;
   float reveal=smoothstep(.10,.50,progress)*specimen.a;
   opacity*=1.-smoothstep(.12,.55,progress);
   // The closed wall emerges in place, then opens as the camera reaches it.
   float combined=reveal+opacity*(1.-reveal);
   color=(photo*reveal+color*opacity*(1.-reveal))/max(combined,.0001);
   opacity=combined;
 }
 gl_FragColor=vec4(color,opacity);
}`;
