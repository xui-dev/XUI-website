import Navbar from "@/components/Navbar";
import RobotExperience from "@/components/RobotExperience";
import Websites3DSection from "@/components/landing/Websites3DSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="w-full bg-black select-none">
      {/* ── Fixed Floating Navbar ── */}
      <Navbar />

      {/* ── Unified Interactive Robot Experience (Hero Gaze + Laser Scroll Scrubbing) ── */}
      <RobotExperience />

      {/* ── 3D Websites & Interactive Templates Showcase ── */}
      <Websites3DSection />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
