'use client';

import { forwardRef, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { CanvasTexture, MathUtils, type Group, type PerspectiveCamera } from 'three';
import { runtime } from '@/lib/runtime';
import { scroll } from '@/lib/scroll';

export const FONT_DISPLAY = '/fonts/Syne-ExtraBold.ttf';
export const FONT_BOLD = '/fonts/Syne-Bold.ttf';

/** While true every scene renders once so shaders and textures are compiled up front. */
export const warmup = { active: true };

/** Width of the view frustum at a given distance from the camera. */
export const visibleWidth = (camera: PerspectiveCamera, distance: number) =>
  2 * distance * Math.tan(MathUtils.degToRad(camera.fov) / 2) * camera.aspect;

/** Run a frame callback only while the journey is inside [from, to]. */
export function useSceneFrame(
  from: number,
  to: number,
  callback: (u: number, state: RootState, delta: number) => void,
) {
  useFrame((state, delta) => {
    const u = scroll.u;
    if (!warmup.active && (u < from || u > to)) return;
    callback(u, state, Math.min(delta, 0.05));
  });
}

/** Mounts children permanently but only draws them inside [from, to]. */
export function Gate({ from, to, children }: { from: number; to: number; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    group.current.visible = warmup.active || (scroll.u >= from && scroll.u <= to);
  });
  return <group ref={group}>{children}</group>;
}

type TextProps = ComponentProps<typeof Text>;
/** troika-three-text ships no types; the mesh is an Object3D with text fields. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TextMesh = any;

export interface FitTextHandle {
  /** The troika text mesh. */
  mesh: TextMesh | null;
  /** Set the world-space width the text should span. */
  fit: (width: number) => void;
}

/**
 * Text that scales itself to a target world-space width, measured from the
 * real glyph bounds once the font has been laid out.
 */
export const FitText = forwardRef<FitTextHandle, TextProps & { width?: number }>(
  function FitText({ width = 1, children, ...props }, ref) {
    const mesh = useRef<TextMesh>(null);
    const natural = useRef(0);
    const target = useRef(width);
    target.current = width;

    const apply = () => {
      if (mesh.current && natural.current > 0) {
        mesh.current.scale.setScalar(target.current / natural.current);
      }
    };

    useImperativeHandle(ref, () => ({
      get mesh() {
        return mesh.current;
      },
      fit(next: number) {
        if (Math.abs(next - target.current) < 1e-4) return;
        target.current = next;
        apply();
      },
    }));

    return (
      <Text
        ref={mesh}
        font={FONT_DISPLAY}
        fontSize={1}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.03}
        onSync={(troika: TextMesh) => {
          const bounds = troika.textRenderInfo?.blockBounds;
          if (!bounds) return;
          natural.current = bounds[2] - bounds[0];
          apply();
          // Type keeps its exact brand colour instead of passing through the film curve.
          if (troika.material?.toneMapped) {
            troika.material.toneMapped = false;
            troika.material.needsUpdate = true;
          }
        }}
        {...props}
      >
        {children}
      </Text>
    );
  },
);

let glow: CanvasTexture | null = null;

/** Soft radial falloff used for light halos. */
export function glowTexture() {
  if (glow) return glow;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  glow = new CanvasTexture(canvas);
  return glow;
}

/** Motion multiplier honouring reduced-motion. */
export const motion = () => (runtime.reducedMotion ? 0.25 : 1);
