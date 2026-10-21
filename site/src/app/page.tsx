import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import Demos from "@/components/Demos";
import Agenda from "@/components/Agenda";
import Audience from "@/components/Audience";
import Bring from "@/components/Bring";
import Hosts from "@/components/Hosts";
import Series from "@/components/Series";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Overview />
        <Demos />
        <Agenda />
        <Audience />
        <Bring />
        <Hosts />
        <Series />
      </main>
      <Footer />
    </>
  );
}
