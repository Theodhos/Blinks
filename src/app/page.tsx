import { Director } from '@/components/Director';
import { World } from '@/components/World';
import { Header } from '@/components/navigation/Header';
import { Menu } from '@/components/navigation/Menu';
import { Rail } from '@/components/navigation/Rail';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { Lab } from '@/components/sections/Lab';
import { Origin } from '@/components/sections/Origin';
import { Process } from '@/components/sections/Process';
import { Results } from '@/components/sections/Results';
import { Services } from '@/components/sections/Services';
import { Story } from '@/components/sections/Story';
import { Voices } from '@/components/sections/Voices';
import { Work } from '@/components/sections/Work';
import { BriefPanel } from '@/components/ui/BriefPanel';
import { Cursor } from '@/components/ui/Cursor';
import { Preloader } from '@/components/ui/Preloader';
import { UIProvider } from '@/components/ui/UIProvider';

/**
 * The page is a timeline. Each section contributes scroll length; the world
 * behind it and the copy in front of it are both driven by where you are.
 */
export default function Home() {
  return (
    <UIProvider>
      <World />
      <Header />
      <Rail />
      <Menu />

      <main>
        <Origin />
        <Story />
        <Services />
        <Work />
        <Lab />
        <Process />
        <Results />
        <Voices />
        <Contact />
      </main>
      <Footer />

      <BriefPanel />
      <Preloader />
      <Cursor />
      <Director />
    </UIProvider>
  );
}
