const MAX_DPR = 1.5;
const RESOLUTION_STEP = 0.66;
const WARMUP_FRAMES = 3;
const RESIZE_WARMUP_FRAMES = 2;
const WATCH_FRAMES = 20;
const WATCH_MIN_FRAMES = 4;
const WATCH_MS = 400;
const SLOW_FRAME_MS = 24;
const SLOW_FRAME_RATIO = 1.4;
const CALIBRATE_FRAMES = 8;
const MAX_STEP_MS = 100;

export const FULLSCREEN_VERTEX = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

export interface Stage {
  readonly gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;
  readonly lost: boolean;
  readonly unit: number;
  link(fragment: string, vertex?: string): Program;
  play(duration: number, draw: (progress: number) => void): Promise<boolean>;
  clear(): void;
}

interface Run {
  duration: number;
  elapsed: number;
  draw: (progress: number) => void;
  resolve: (finished: boolean) => void;
}

export function token(name: string): [number, number, number] {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const channels = getComputedStyle(probe).color.match(/[\d.]+/g) ?? [];
  probe.remove();
  const [r = 0, g = 0, b = 0] = channels.map((channel) => Number(channel) / 255);
  return [r, g, b];
}

export function createStage(canvas: HTMLCanvasElement, onSlow: () => void): Stage | null {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!context) return null;
  const gl = context;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const runs = new Set<Run>();
  let resolution = 1;
  let lost = false;
  let skip = false;
  let raf = 0;
  let last = 0;
  let warmup = WARMUP_FRAMES;
  let sampled = 0;
  let sampleTotal = 0;
  let trips = 0;
  let slowFrame = SLOW_FRAME_MS;

  // A display capped at 30 Hz (e.g. iOS Low Power Mode) runs smoothly at 33 ms
  // per frame, so the limit scales with the refresh interval measured at idle.
  function calibrate(): void {
    const steps: number[] = [];
    let previous = 0;
    const sample = (now: number): void => {
      if (previous) steps.push(now - previous);
      previous = now;
      if (steps.length < CALIBRATE_FRAMES) {
        requestAnimationFrame(sample);
        return;
      }
      steps.sort((a, b) => a - b);
      slowFrame = Math.max(SLOW_FRAME_MS, steps[steps.length >> 1] * SLOW_FRAME_RATIO);
    };
    requestAnimationFrame(sample);
  }

  function resize(): void {
    const ratio = Math.min(devicePixelRatio || 1, MAX_DPR) * resolution;
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function watch(step: number): void {
    if (!step) return;
    if (warmup > 0) {
      warmup--;
      return;
    }
    sampleTotal += step;
    sampled++;
    if (sampled < WATCH_MIN_FRAMES || (sampled < WATCH_FRAMES && sampleTotal < WATCH_MS)) return;
    const average = sampleTotal / sampled;
    sampled = 0;
    sampleTotal = 0;
    if (average <= slowFrame) return;
    if (++trips === 1) {
      resolution *= RESOLUTION_STEP;
      resize();
      warmup = RESIZE_WARMUP_FRAMES;
    } else {
      skip = true;
    }
    onSlow();
  }

  function tick(now: number): void {
    raf = 0;
    const step = last ? Math.min(now - last, MAX_STEP_MS) : 0;
    last = now;
    watch(step);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const run of runs) {
      run.elapsed = skip ? run.duration : run.elapsed + step;
      const progress = Math.min(run.elapsed / run.duration, 1);
      run.draw(progress);
      if (progress >= 1) {
        runs.delete(run);
        run.resolve(true);
      }
    }
    if (runs.size) raf = requestAnimationFrame(tick);
  }

  function compile(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('shader allocation failed');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
    }
    return shader;
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    canvas.hidden = true;
    for (const run of runs) run.resolve(false);
    runs.clear();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (runs.size && !raf && !lost) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  });

  addEventListener('resize', () => {
    if (!runs.size && !lost) resize();
  });

  calibrate();

  return {
    gl,
    canvas,
    get lost() {
      return lost;
    },
    get unit() {
      return canvas.width / (canvas.clientWidth || 1);
    },
    link(fragment, vertex = FULLSCREEN_VERTEX) {
      const program = gl.createProgram();
      const vs = compile(gl.VERTEX_SHADER, vertex);
      const fs = compile(gl.FRAGMENT_SHADER, fragment);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
      }
      const uniforms: Program['uniforms'] = {};
      const count: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
      }
      return { program, uniforms };
    },
    play(duration, draw) {
      if (lost) return Promise.resolve(false);
      resize();
      return new Promise((resolve) => {
        runs.add({ duration, elapsed: 0, draw, resolve });
        if (!raf && !document.hidden) {
          last = 0;
          raf = requestAnimationFrame(tick);
        }
      });
    },
    clear() {
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}
