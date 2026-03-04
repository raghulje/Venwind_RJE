import { useEffect } from 'react';

interface SidebarNavigationProps {
  activeSection: string;
  activeSubsection: string;
  onSectionChange: (section: string) => void;
  onSubsectionChange: (subsection: string) => void;
}

export default function SidebarNavigation({
  activeSection,
  activeSubsection,
  onSectionChange,
  onSubsectionChange,
}: SidebarNavigationProps) {
  const sections = [
    {
      id: 'annual-return',
      title: 'Annual Return',
      subsections: [
        { id: 'fy-2024-25', title: 'FY 2024-25' },
        { id: 'fy-2025-26', title: 'FY 2025-26' },
      ],
    },
    {
      id: 'notice-general-meetings',
      title: 'Notice of the General meetings',
      subsections: [
        { id: 'fy-2024-25', title: 'FY 2024-25' },
        { id: 'fy-2025-26', title: 'FY 2025-26' },
      ],
    },
  ];

  useEffect(() => {
    // Reset subsection when section changes
    const section = sections.find(s => s.id === activeSection);
    if (section && section.subsections.length > 0) {
      onSubsectionChange(section.subsections[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
      <nav className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <button
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-semibold ${
                activeSection === section.id
                  ? 'bg-[#8DC63F] text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
            
            {activeSection === section.id && (
              <div className="ml-4 space-y-1">
                {section.subsections.map((subsection) => (
                  <button
                    key={subsection.id}
                    onClick={() => onSubsectionChange(subsection.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      activeSubsection === subsection.id
                        ? 'bg-[#8DC63F] text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {subsection.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

