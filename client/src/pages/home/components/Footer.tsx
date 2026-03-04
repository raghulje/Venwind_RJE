import { useState, useEffect } from 'react';
import { normalizeImageUrl } from '../../../utils/cms';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface FooterData {
  logoUrl?: string;
  imageUrl?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  copyright?: string;
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({});

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cms/home/cms/footer`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setFooterData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching footer content from API:', error);
        // Fallback to localStorage
        const savedContent = localStorage.getItem('cms_home_footer');
        if (savedContent) {
          try {
            setFooterData(JSON.parse(savedContent));
          } catch (e) {
            console.error('Error loading footer from localStorage:', e);
          }
        }
      }
    };

    fetchFooterData();
  }, []);

  return (
    <footer className="bg-[#0D1D27] text-white">
      <style>{`
        .footer-link {
          position: relative;
          display: inline-block;
          transition: transform 0.3s ease;
        }
        .footer-link:hover {
          transform: translateX(4px);
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 4px;
          width: 0;
          height: 1px;
          background-color: #8DC63F;
          transition: width 0.3s ease;
        }
        .footer-link:hover::after {
          width: calc(100% - 4px);
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo */}
          <div data-aos="fade-up" data-aos-delay="0">
            {footerData.logoUrl ? (
              <img 
                src={normalizeImageUrl(footerData.logoUrl)} 
                alt="Venwind Refex" 
                className="h-12 w-auto mb-6"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://venwindrefex.com/wp-content/uploads/2023/11/Venwind_Logo_Final-white.png";
                }}
              />
            ) : (
              <img 
                src="https://venwindrefex.com/wp-content/uploads/2023/11/Venwind_Logo_Final-white.png" 
                alt="Venwind Refex" 
                className="h-12 w-auto mb-6"
              />
            )}
            {footerData.description && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{footerData.description}</p>
            )}
            {footerData.imageUrl && (
              <div className="mt-4">
                <img 
                  src={normalizeImageUrl(footerData.imageUrl)} 
                  alt="Footer image" 
                  className="max-w-full h-auto object-contain rounded"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </div>

          {/* Registered Office */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h6 className="text-white text-lg font-bold mb-6">Registered Office</h6>
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerData.address ? (
                <>{footerData.address}</>
              ) : (
                <>
                  <strong>Venwind Refex Power Limited</strong><br />
                  <span className="whitespace-nowrap">CIN: U27101TN2024PLC175572</span><br />
                  2<sup>nd</sup> floor, Refex Towers, 313, Valluvar Kottam High Road, Nungambakkam,<br />
                  Chennai-600034, Tamil Nadu, India
                </>
              )}
            </p>
          </div>

          {/* Links */}
          <div>
            <h6 className="text-white text-lg font-bold mb-6">Links</h6>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about-us"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/investor-relations"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Investor Relations
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/technology"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="/sustainability"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Sustainability
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="footer-link text-gray-300 text-sm hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h6 className="text-white text-lg font-bold mb-6">Social Media</h6>
            <div className="flex items-center space-x-4 mb-6">
              <a 
                href="https://www.facebook.com/refexindustrieslimited/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#8DC63F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-facebook-fill text-white text-lg"></i>
              </a>
              <a 
                href="https://x.com/GroupRefex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#8DC63F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-twitter-x-fill text-white text-lg"></i>
              </a>
              <a 
                href="https://in.linkedin.com/company/venwind-refex-power-limited" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#8DC63F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-linkedin-fill text-white text-lg"></i>
              </a>
              <a 
                href="https://www.instagram.com/refexgroup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#8DC63F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-instagram-fill text-white text-lg"></i>
              </a>
              <a 
                href="https://www.youtube.com/@refexgroup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#8DC63F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-youtube-fill text-white text-lg"></i>
              </a>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              To know more about Refex<br />
              click here - <a 
                href="https://www.refex.group/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold hover:text-[#8DC63F] transition-colors"
              >
                www.refex.group
              </a>
            </p>
          </div>

          {/* Contact */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h6 className="text-white text-lg font-bold mb-6">Contact</h6>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <i className="ri-mail-line text-[#8DC63F] text-lg mt-0.5 flex-shrink-0"></i>
                <div className="flex flex-col gap-1">
                  <a 
                    href="mailto:cscompliance@refex.co.in" 
                    className="text-gray-300 text-sm hover:text-[#8DC63F] transition-colors"
                  >
                    cscompliance@refex.co.in
                  </a>
                  <a 
                    href="mailto:contact@venwindrefex.com" 
                    className="text-gray-300 text-sm hover:text-[#8DC63F] transition-colors"
                  >
                    contact@venwindrefex.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="ri-phone-line text-[#8DC63F] text-lg mt-0.5 flex-shrink-0"></i>
                <div className="flex flex-col gap-1">
                  <a 
                    href="tel:+914435040050" 
                    className="text-gray-300 text-sm hover:text-[#8DC63F] transition-colors"
                  >
                    +91 44 - 3504 0050
                  </a>
                  <a 
                    href="tel:+914469908410" 
                    className="text-gray-300 text-sm hover:text-[#8DC63F] transition-colors"
                  >
                    +91 44 - 6990 8410
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-6">
          <p className="text-gray-400 text-sm text-center">
            {footerData.copyright || (
              <>
                <a href="/" className="hover:text-[#8DC63F] transition-colors">Venwind Refex Power Limited</a> © 2025. All Rights Reserved.
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}