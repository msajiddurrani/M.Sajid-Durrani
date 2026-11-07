const flowFunctions = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
    mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p) {
  return noise(p)*.58 + noise(p*2.03+4.7)*.28 + noise(p*4.11-2.1)*.14;
}
vec2 flowCoordinates(vec2 uv) {
  vec2 q=uv*3.2;
  vec2 curl=vec2(fbm(q+vec2(2.7,-uTime*.045)),fbm(q+vec2(8.1,uTime*.037)));
  return uv+(curl-.5)*.34;
}`

export const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vFlowOrigin;
uniform float uTime;
uniform vec2 uOrigin;
${flowFunctions}
void main() {
  vUv = vec2(aPosition.x * .5 + .5, .5 - aPosition.y * .5);
  vFlowOrigin = flowCoordinates(uOrigin);
  gl_Position = vec4(aPosition, 0., 1.);
}`

export const fragmentSource = `
precision highp float;
varying vec2 vUv;
varying vec2 vFlowOrigin;
uniform sampler2D uBaseTexture;
uniform sampler2D uRevealTexture;
uniform float uTime;
uniform float uProgress;
uniform vec2 uPointer;
uniform vec2 uCursor;
uniform vec2 uRadius;
uniform vec2 uVelocity;
uniform float uHover;
uniform float uSpread;
uniform vec2 uOrigin;
uniform vec2 uResolution;
uniform vec4 uImpulses[4];

${flowFunctions}
float liquid(vec2 uv) {
  vec2 drift=vec2(uTime*.074,-uTime*.092);
  vec2 warp=vec2(noise(uv*2.7+drift),noise(uv*2.3-drift+8.3));
  vec2 q=uv+(.5-warp)*.28;
  float broad=fbm(q*vec2(2.4,3.15)+drift);
  float sheet=sin(q.y*12.7+q.x*5.8+broad*5.2-uTime*.7);
  float eddy=sin(q.x*9.1-q.y*5.3+warp.y*4.2+uTime*.47);
  return clamp(.55+(broad-.5)*.8+sheet*.26+eddy*.16,.035,.965);
}
float wettingArrival(vec2 uv) {
  vec2 flow=flowCoordinates(uv);
  vec2 delta=(flow-vFlowOrigin)*vec2(.9,1.05);
  float distanceToImpact=length(delta);
  float channels=sin(flow.y*15.+flow.x*7.+fbm(flow*4.)*5.);
  float branches=sin(flow.x*13.-flow.y*8.+noise(flow*3.7+6.)*4.);
  // Travel time changes across the surface: tongues advance, divide and reconnect.
  float resistance=.85+noise(flow*5.1)*.42+channels*.20+branches*.13;
  return clamp(distanceToImpact*resistance,.008,1.02);
}
void main() {
  vec2 uv=vUv;
  float field=.5;
  float aa=max(.022,1.6/uResolution.y);
  float mask=uProgress>.5 ? 1. : 0.;
  if(uProgress>.0001 && uProgress<.9999){
    field=liquid(uv);
    mask=smoothstep(field-aa,field+aa,uProgress);
  }
  float water=0.;
  if(uSpread>.999)water=1.;
  else if(uSpread>.0001){
    float arrival=wettingArrival(uv);
    water=smoothstep(arrival-.018,arrival+.018,uSpread*1.12-.035);
  }
  vec2 local=(uv-uCursor)/uRadius;
  float angle=atan(local.y,local.x+.00001);
  float edge=.82+.11*sin(angle*3.+uTime*1.1)+.075*sin(angle*5.-uTime*1.4)+.025*sin(angle*7.+uTime*.9);
  float locality=1.-smoothstep(edge-.10,min(.98,edge+.055),length(local));
  water*=locality;
  // Hover wets the surface with the real portrait; it never inverts the face into the sculpture.
  mask=max(mask,water);
  float ripples=0.;
  for(int i=0;i<4;i++){
    vec4 event=uImpulses[i];
    float age=uTime-event.z;
    if(age>=0. && age<2.4){
      vec2 offset=(uv-event.xy)*vec2(1.,.85);
      float d=length(offset)+sin(uv.y*14.+field*4.)*.022;
      float front=.025+age*.21;
      ripples+=exp(-pow((d-front)/.09,2.))*exp(-age*1.65)*event.w;
    }
  }
  float boundary=max(mask*(1.-mask)*4.,water*(1.-water)*4.);
  float localWake=exp(-dot(uv-uPointer,uv-uPointer)*24.)*min(length(uVelocity),1.)*uHover;
  vec2 refraction=vec2(sin(uv.y*19.+field*7.+uTime),cos(uv.x*17.-field*6.-uTime*.7));
  refraction=(refraction*.0105+clamp(uVelocity,vec2(-.5),vec2(.5))*.0045*locality)*boundary
    +refraction*(ripples*.0042+localWake*.0036)*locality;
  vec2 baseUv=clamp(uv+refraction,0.,1.);
  vec2 faceUv=clamp(uv-refraction*.68,0.,1.);
  vec4 base=texture2D(uBaseTexture,vec2(baseUv.x,1.-baseUv.y));
  vec4 face=texture2D(uRevealTexture,vec2(faceUv.x,1.-faceUv.y));
  // Uploaded textures are premultiplied; mixing RGB and alpha together avoids dark matte fringes.
  gl_FragColor=mix(base,face,mask);
}`
