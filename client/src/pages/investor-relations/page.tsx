import { useState } from 'react';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import SidebarNavigation from './components/SidebarNavigation';
import ContentSection from './components/ContentSection';

export default function InvestorRelations() {
  const [activeSection, setActiveSection] = useState<string>('annual-return');
  const [activeSubsection, setActiveSubsection] = useState<string>('fy-2024-25');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <SidebarNavigation
              activeSection={activeSection}
              activeSubsection={activeSubsection}
              onSectionChange={setActiveSection}
              onSubsectionChange={setActiveSubsection}
            />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <ContentSection
              activeSection={activeSection}
              activeSubsection={activeSubsection}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

