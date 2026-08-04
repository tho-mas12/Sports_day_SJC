import React, { useState } from 'react';
import TopAnnouncementBar from './TopAnnouncementBar';
import StickyNavbar from './StickyNavbar';
import HeroSection from './HeroSection';
import RegistrationDeadline from './RegistrationDeadline';
import QuickStatistics from './QuickStatistics';
import RulesSection from './RulesSection';
import SportsEventsSection from './SportsEventsSection';
import Footer from './Footer';
import RulesModal from './RulesModal';

export default function LandingPage({ onOpenLogin }) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [activeRulesTitle, setActiveRulesTitle] = useState("Sports Rule Book");

  const handleOpenRules = (title = "Sports Rule Book") => {
    if (typeof title === 'string') {
      setActiveRulesTitle(title);
    } else {
      setActiveRulesTitle("Sports Rule Book");
    }
    setIsRulesOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] selection:bg-blue-100 selection:text-[#2563EB]">
      {/* SECTION 1: Top Announcement Bar */}
      <TopAnnouncementBar />

      {/* SECTION 2: Sticky Navigation Bar */}
      <StickyNavbar onOpenLogin={onOpenLogin} />

      {/* Main Content Area */}
      <main>
        {/* SECTION 3: Hero Section */}
        <HeroSection 
          onOpenLogin={onOpenLogin} 
          onOpenRules={() => handleOpenRules("Complete Rulebook PDF")} 
        />

        {/* SECTION 4: Registration Deadline */}
        <RegistrationDeadline onOpenLogin={onOpenLogin} />

        {/* SECTION 5: Quick Statistics */}
        <QuickStatistics />

        {/* SECTION 6: Rules */}
        <RulesSection onOpenRules={handleOpenRules} />

        {/* SECTION 7: Sports Events */}
        <SportsEventsSection onOpenLogin={onOpenLogin} />
      </main>

      {/* SECTION 9: Footer */}
      <Footer />

      {/* Rules & Download Modal */}
      <RulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)}
        title={activeRulesTitle}
      />
    </div>
  );
}
