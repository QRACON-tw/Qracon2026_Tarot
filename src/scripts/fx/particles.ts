import { token, type Stage } from './gl';
import type { Point } from './collapse';

export interface Particles {
  play(rects: readonly DOMRect[], focus: Point, duration: number): Promise<boolean>;
}

const PER_CARD = 100;
const MAX_CARDS = 6;

const VERTEX = `#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec4 uRects[${MAX_CARDS}];
uniform vec2 uFocus;
uniform float uProgress;
uniform float uUnit;
out float vAlpha;

float hash(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}

void main() {
  float id = float(gl_VertexID);
  vec4 rect = uRects[gl_VertexID % ${MAX_CARDS}];
  vec2 start = rect.xy + vec2(hash(id + 1.0), hash(id + 2.0)) * rect.zw;

  float angle = (hash(id + 3.0) - 0.5) * 1.1;
  vec2 dir = normalize(start - uFocus + vec2(0.001));
  dir = vec2(dir.x * cos(angle) - dir.y * sin(angle), dir.x * sin(angle) + dir.y * cos(angle));

  float life = mix(0.55, 1.0, hash(id + 4.0));
  float t = clamp(uProgress / life, 0.0, 1.0);
  float travel = 1.0 - pow(1.0 - t, 3.0);
  float reach = mix(0.15, 0.55, hash(id + 5.0)) * max(uView.x, uView.y);
  vec2 pos = start + dir * reach * travel;

  gl_Position = vec4(pos.x / uView.x * 2.0 - 1.0, 1.0 - pos.y / uView.y * 2.0, 0.0, 1.0);
  gl_PointSize = mix(2.0, 5.0, hash(id + 6.0)) * uUnit * (1.0 - t);
  vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - t);
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
uniform vec3 uLit;
in float vAlpha;
out vec4 outColor;

void main() {
  vec2 c = abs(gl_PointCoord - 0.5);
  if (c.x + c.y > 0.5) discard;
  outColor = vec4(uLit * vAlpha, vAlpha);
}`;

export function createParticles(stage: Stage): Particles {
  const { gl, canvas } = stage;
  const { program, uniforms } = stage.link(FRAGMENT, VERTEX);
  const lit = token('--color-white');
  const rectData = new Float32Array(MAX_CARDS * 4);

  return {
    play(rects, focus, duration) {
      rects.slice(0, MAX_CARDS).forEach((rect, i) => rectData.set([rect.x, rect.y, rect.width, rect.height], i * 4));
      return stage.play(duration, (progress) => {
        gl.useProgram(program);
        gl.uniform2f(uniforms.uView, canvas.clientWidth, canvas.clientHeight);
        gl.uniform4fv(uniforms.uRects, rectData);
        gl.uniform2f(uniforms.uFocus, focus.x, focus.y);
        gl.uniform1f(uniforms.uProgress, progress);
        gl.uniform1f(uniforms.uUnit, stage.unit);
        gl.uniform3fv(uniforms.uLit, lit);
        gl.drawArrays(gl.POINTS, 0, PER_CARD * MAX_CARDS);
      });
    },
  };
}
