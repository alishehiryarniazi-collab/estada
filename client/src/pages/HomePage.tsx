/**
 * Homepage — the app's most important screen (Section 3.4/11).
 * Full-bleed hero photo + floating search, quick filter pills, a trust strip,
 * and the live featured-listings grid.
 */
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FilterPills from '../components/FilterPills';
import TrustStrip from '../components/TrustStrip';
import FeaturedListings from '../components/FeaturedListings';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Solid navbar sits as its own bar; the hero photo starts below it. */}
      <Navbar />
      <Hero />

      {/* Quick filters, pulled up to overlap the hero base for a connected feel */}
      <div className="relative z-20 -mt-7 md:-mt-9">
        <FilterPills />
      </div>

      <div className="mt-6">
        <TrustStrip />
      </div>

      <FeaturedListings />
      <Footer />
    </div>
  );
}
