const ANALYSIS={"nodes":37966,"elements":22536,"delta":0.7447129615999282,"vonMises":12.49262946095188,"interiorStress":9.952716914327933,"loadedDisplacement":0.3171631853542738,"reaction":[-9.999999989419262,4.051181778930157e-09,1.6778500810943342e-09],"forceResidual":3.3442664426525203e-08,"volumeCm3":76.24114354956001,"time":12.812558889389038,"area":8,"layers":2,"E":70000,"nu":0.33,"force":10,"loadHeight":150,"meshDisplacementChange":0.002959879719529157,"meshStressChange":0.020369096025324662};
export const defaults = {force:10, modulus:70, bookMass:.6, angle:55, bookGap:120};
export const limits = {force:[1,30], modulus:[40,210], bookMass:[.5,5], angle:[30,75], bookGap:[40,140]};
export const geometry = {
  pivotY:32.8236436, pivotZ:236.9137704, postY:34,
  postWidth:8, postLength:68, bookHeight:220, bookThickness:25,
  bookendVolumeCm3:76.25038, density:2700
};
export function validatePatch(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error('설정값 객체가 필요합니다.');
  for (const [key,value] of Object.entries(p)) {
    const range=limits[key];
    if (!range || !Number.isFinite(value) || value<range[0] || value>range[1]) throw Error('설정 범위를 확인하세요: '+key);
  }
  return p;
}
export function calculate(p, mode='bookend') {
  validatePatch(p);
  p={...defaults,...p};
  if (mode==='slider') return null;
  if (mode==='bookend') return {
    deflection:ANALYSIS.delta*p.force/10*70/p.modulus,
    stress:ANALYSIS.vonMises*p.force/10,
    mass:geometry.bookendVolumeCm3*geometry.density/1e6,
    load:p.force,
  };
  if (mode!=='stand') throw Error('계산 대상 오류');
  const radians=p.angle*Math.PI/180, W=p.bookMass*9.81;
  const along=geometry.bookHeight/2+13-174;
  const normal=geometry.bookThickness/2+22;
  const lever=Math.abs(geometry.pivotY-geometry.postY+along*Math.cos(radians)-normal*Math.sin(radians));
  const A=geometry.postWidth**2, I=geometry.postWidth**4/12, Z=I/(geometry.postWidth/2);
  const M=W*lever/2;
  return {
    deflection:M*geometry.postLength**2/(2*p.modulus*1000*I),
    stress:W/(2*A)+M/Z,
    mass:2*A*geometry.postLength*geometry.density/1e9,
    load:W, lever, moment:M, I, A,
  };
}
