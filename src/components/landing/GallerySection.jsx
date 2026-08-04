import React, { useState } from 'react';
import { Eye, X, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function GallerySection() {
  const [selectedImgIndex, setSelectedImgIndex] = useState(null);

  const galleryItems = [
    {
      id: 1,
      title: "100m Athletic Sprint Finals",
      category: "Athletics Track",
      src: "/assets/athletic_track.jpg",
      fallback: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      description: "Athletes competing on the main synthetic track at St. Joseph's College Stadium."
    },
    {
      id: 2,
      title: "Inter-Department Football Championship",
      category: "Team Sports",
      src: "/assets/football_match.jpg",
      fallback: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      description: "High-intensity football match between Computer Science and Commerce departments."
    },
    {
      id: 3,
      title: "SJC Basketball Tournament",
      category: "Team Sports",
      src: "/assets/basketball_match.jpg",
      fallback: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
      description: "Fast-paced basketball action on the main campus outdoor court."
    },
    {
      id: 4,
      title: "Championship Trophy Presentation",
      category: "Awards Ceremony",
      src: "/assets/trophy_ceremony.jpg",
      fallback: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1200&q=80",
      description: "The prestigious St. Joseph's Overall Rolling Trophy awarded to championship winners."
    },
    {
      id: 5,
      title: "Indoor Badminton Doubles Finals",
      category: "Indoor Games",
      src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
      fallback: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
      description: "Intense badminton rally inside the SJC Sports Complex."
    },
    {
      id: 6,
      title: "Chess Grandmaster Challenge",
      category: "Indoor Games",
      src: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
      fallback: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
      description: "Strategic focus during the annual inter-departmental chess championship."
    }
  ];

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedImgIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImgIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-title-tag">Moments & Highlights</span>
          <h2 className="section-heading">Sports Day Gallery</h2>
          <p className="section-subheading mx-auto">
            Capturing the passion, grit, and victory from previous St. Joseph's College athletic meets.
          </p>
        </div>

        {/* Responsive Image Grid with 18px rounded styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => setSelectedImgIndex(index)}
              className="group relative h-64 sm:h-72 rounded-[18px] overflow-hidden shadow-md cursor-pointer border border-gray-200 bg-slate-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background Image */}
              <img 
                src={item.src} 
                alt={item.title}
                onError={(e) => { e.target.src = item.fallback; }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-90"
              />

              {/* Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6" />

              {/* Content Badge & Titles */}
              <div className="relative z-10 space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="badge badge-blue text-[10px] uppercase font-bold tracking-wider">
                  {item.category}
                </span>
                <h3 className="font-['Poppins'] text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-normal">
                  {item.description}
                </p>
              </div>

              {/* Hover Zoom View Icon */}
              <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImgIndex !== null && (
        <div 
          onClick={() => setSelectedImgIndex(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-up"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {galleryItems[selectedImgIndex].category}
                </span>
                <h4 className="font-['Poppins'] text-base font-bold text-white">
                  {galleryItems[selectedImgIndex].title}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedImgIndex(null)}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Display */}
            <div className="relative h-[65vh] max-h-[550px] bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={galleryItems[selectedImgIndex].src} 
                alt={galleryItems[selectedImgIndex].title}
                onError={(e) => { e.target.src = galleryItems[selectedImgIndex].fallback; }}
                className="w-full h-full object-contain"
              />

              {/* Prev Button */}
              <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white hover:bg-[#2563EB] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white hover:bg-[#2563EB] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Caption Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <p>{galleryItems[selectedImgIndex].description}</p>
              <span className="font-medium bg-slate-800 px-3 py-1 rounded-full text-slate-300 shrink-0">
                {selectedImgIndex + 1} of {galleryItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
