import Header from "./components/Header";
import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <div style={{ background: "#080808", color: "#ffffff" }}>
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}
