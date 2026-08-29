/**
 * Homepage — the app's most important screen (Section 3.4/11).
 * Full-bleed hero photo + floating search, quick filter pills, a trust strip,
 * and the live featured-listings grid.
 */
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import FeaturedListings from '../components/FeaturedListings';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Solid navbar sits as its own bar; the hero photo starts below it.
          The hero now contains its own tagline, search bar and filter pills. */}
      <Navbar />
      <Hero />

      <TrustStrip />

      <FeaturedListings />
      <Footer />
    </div>
  );
}
