'use client';

import { smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { FINALE } from '@/lib/world';
import { CameraController } from './CameraController';
import { Lighting } from './Lighting';
import { Particles } from './Particles';
import { StudioEnvironment } from './environments/StudioEnvironment';
import { Gate } from './helpers';
import { FragmentField } from './objects/FragmentField';
import { HeroType } from './objects/HeroType';
import { LabCarousel } from './objects/LabCarousel';
import { Monolith } from './objects/Monolith';
import { ProcessPath } from './objects/ProcessPath';
import { Results } from './objects/Results';
import { ServiceObjects } from './objects/ServiceObjects';
import { WorkGallery } from './objects/WorkGallery';
import { Wordmark } from './objects/Wordmark';

/** Whole at rest, breaking apart as the story begins. Assembles during the intro. */
const openingSpread = (u: number) => Math.max(smoothstep(u, 0.72, 1.6), (1 - runtime.intro) * 0.75);

/** Scattered on approach, whole by the time the call to action lands. */
const closingSpread = (u: number) => 1 - smoothstep(u, 8, 8.72);

/**
 * One continuous world. Every scene stays mounted; each is only drawn while
 * the journey is near it.
 */
export function Scene() {
  return (
    <>
      <StudioEnvironment />
      <Lighting />
      <CameraController />
      <Particles />

      <Gate from={-1} to={2.05}>
        <Monolith position={[0, 0, 0]} from={-1} to={2.05} explode={openingSpread} />
        <HeroType />
      </Gate>

      <Gate from={1.8} to={3.15}>
        <ServiceObjects />
      </Gate>

      <Gate from={2.8} to={4.2}>
        <WorkGallery />
      </Gate>

      <Gate from={3.8} to={5.2}>
        <LabCarousel />
      </Gate>

      <Gate from={4.8} to={6.2}>
        <ProcessPath />
      </Gate>

      <Gate from={5.8} to={7.15}>
        <Results />
      </Gate>

      <Gate from={6.8} to={8.3}>
        <FragmentField />
      </Gate>

      <Gate from={7.7} to={11}>
        <Monolith position={FINALE} from={7.7} to={11} explode={closingSpread} />
        <Wordmark />
      </Gate>
    </>
  );
}
