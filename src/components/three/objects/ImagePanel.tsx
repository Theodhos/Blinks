'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Color, DoubleSide, Group, ShaderMaterial, SRGBColorSpace, Vector2 } from 'three';

const vertex = /* glsl */ `
uniform float uBend;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  // The panel flexes with scroll speed, like a sheet moving through air.
  p.z += sin(uv.y * 3.14159) * uBend * 0.35;
  p.z += sin(uv.x * 3.14159 + uTime * 0.6) * 0.015;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const fragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uCover;
uniform float uActive;
uniform float uFade;
uniform vec3 uFog;
varying vec2 vUv;

void main() {
  // Cover-fit with a slow push-in as the panel becomes active.
  float zoom = 1.12 - uActive * 0.12;
  vec2 uv = (vUv - 0.5) * uCover / zoom + 0.5;
  vec3 color = texture2D(uMap, uv).rgb;

  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma) * 0.42, color, uActive);

  vec2 edge = smoothstep(vec2(0.0), vec2(0.35), vUv) * smoothstep(vec2(0.0), vec2(0.35), 1.0 - vUv);
  color *= mix(0.72, 1.0, edge.x * edge.y);

  color = mix(uFog, color, uFade);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export interface ImagePanelHandle {
  group: Group | null;
  /** active: 0 muted → 1 full colour. fade: 0 dissolved into the fog → 1 solid. */
  set: (active: number, fade: number, bend: number, time: number, fog: Color) => void;
}

interface ImagePanelProps {
  src: string;
  width: number;
  height: number;
}

/** A physical slab carrying an image: metal frame, dark back, shader-lit face. */
export const ImagePanel = forwardRef<ImagePanelHandle, ImagePanelProps>(function ImagePanel(
  { src, width, height },
  ref,
) {
  const gl = useThree((state) => state.gl);
  const group = useRef<Group>(null);
  const texture = useTexture(src);

  const material = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const image = texture.image as { width: number; height: number };
    const imageAspect = image.width / image.height;
    const panelAspect = width / height;
    const cover =
      panelAspect > imageAspect
        ? new Vector2(1, imageAspect / panelAspect)
        : new Vector2(panelAspect / imageAspect, 1);
    return new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      toneMapped: false,
      uniforms: {
        uMap: { value: texture },
        uCover: { value: cover },
        uActive: { value: 0 },
        uFade: { value: 1 },
        uBend: { value: 0 },
        uTime: { value: 0 },
        uFog: { value: new Color('#08080a') },
      },
    });
  }, [texture, gl, width, height]);

  // Upload to the GPU during the preloader, not when the panel first appears.
  useEffect(() => {
    gl.initTexture(texture);
  }, [gl, texture]);

  useImperativeHandle(ref, () => ({
    get group() {
      return group.current;
    },
    set(active, fade, bend, time, fog) {
      const u = material.uniforms;
      u.uActive.value = active;
      u.uFade.value = fade;
      u.uBend.value = bend;
      u.uTime.value = time;
      (u.uFog.value as Color).copy(fog);
    },
  }));

  return (
    <group ref={group}>
      <mesh material={material}>
        <planeGeometry args={[width, height, 24, 24]} />
      </mesh>
      <mesh position-z={-0.06}>
        <boxGeometry args={[width + 0.07, height + 0.07, 0.05]} />
        <meshStandardMaterial color="#2a2a2f" metalness={1} roughness={0.25} side={DoubleSide} />
      </mesh>
    </group>
  );
});
