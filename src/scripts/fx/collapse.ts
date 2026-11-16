import { token, type Stage } from './gl';

export interface Point {
  x: number;
  y: number;
}

export interface Collapse {
  play(origin: Point, duration: number): Promise<boolean>;
}

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uUnit;
uniform float uReach;
uniform vec3 uInk;
uniform vec3 uLit;
out vec4 outColor;

float stroke(float dist, float halfWidth) {
  return clamp(halfWidth - dist + 0.5, 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float d1 = distance(frag, uOrigin);
  float d2 = distance(frag, uRes - uOrigin);

  float sweep = clamp(uProgress / 0.8, 0.0, 1.0);
  float front = smoothstep(0.0, 1.0, sweep) * (uReach + 40.0 * uUnit);
  float fade = 1.0 - smoothstep(0.55, 0.92, uProgress);
  float cover = 1.0 - smoothstep(front - 1.0, front, d1);

  float k = 6.2831853 / (24.0 * uUnit);
  float w = sin((d1 - front) * k)
          + sin((d2 - front) * k) * (1.0 - smoothstep(front - 1.0, front, d2));
  float edge = abs(w) / (length(vec2(dFdx(w), dFdy(w))) + 1e-4);
  float age = clamp((front - d1) / uReach, 0.0, 1.0);
  float inner = 0.9 * uUnit * fade * (1.0 - smoothstep(0.0, 0.9, age));
  float lattice = stroke(edge, inner) * step(0.01, inner);

  float lead = stroke(abs(d1 - (front - 4.0 * uUnit)), 2.5 * uUnit);
  float trail = stroke(abs(d1 - (front - 18.0 * uUnit)), 1.0 * uUnit) * fade;

  float lit = max(max(lead, trail), lattice);
  outColor = vec4(mix(uInk, uLit, lit) * cover, cover);
}`;

export function createCollapse(stage: Stage): Collapse {
  const { gl, canvas } = stage;
  const { program, uniforms } = stage.link(FRAGMENT);
  const ink = token('--color-ink');
  const lit = token('--color-white');

  return {
    play(origin, duration) {
      return stage.play(duration, (progress) => {
        const unit = stage.unit;
        const { width, height } = canvas;
        const x = origin.x * unit;
        const y = height - origin.y * unit;
        gl.useProgram(program);
        gl.uniform2f(uniforms.uRes, width, height);
        gl.uniform2f(uniforms.uOrigin, x, y);
        gl.uniform1f(uniforms.uProgress, progress);
        gl.uniform1f(uniforms.uUnit, unit);
        gl.uniform1f(uniforms.uReach, Math.hypot(Math.max(x, width - x), Math.max(y, height - y)));
        gl.uniform3fv(uniforms.uInk, ink);
        gl.uniform3fv(uniforms.uLit, lit);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      });
    },
  };
}
