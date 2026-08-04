import React, { useState } from 'react';
import { X, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function RulesModal({ isOpen, onClose, title = "Sports Day Instructions" }) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // Map titles to PDF paths
  const pdfMap = {
    "Sports Day Instructions": "/Img/Sports Day 2026 -General Instructions.pdf",
    "Dates to Remember": "/Img/Sports Day 2026 - Date to Remember.pdf",
  };
  const pdfPath = pdfMap[title] || "";

  const isDates = title.toLowerCase().includes('date');

  // Content for Dates section
  // Content for Dates section
  const datesContent = (
    <div className="flex justify-center items-center overflow-auto max-h-[60vh] p-2 bg-slate-50 rounded-xl border border-gray-200">
      <img 
        src="/Img/impor_date.png" 
        alt="Important Dates - SJC Sports Day 2026" 
        className="max-w-full h-auto object-contain rounded-lg"
      />
    </div>
  );

  // Content for PDF view/download
  const pdfContent = (
    <div className="space-y-4">
      <embed src={pdfPath} type="application/pdf" className="w-full h-96 border border-gray-200 rounded" />
      <a href={pdfPath} download className="inline-flex items-center gap-2 text-[#2563EB] hover:underline">
        <Download className="w-4 h-4" />
        <span>Download {title} PDF</span>
      </a>
    </div>
  );

  // Default general instructions content
  const defaultContent = (
    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96 font-sans">
      183rd ANNUAL SPORTS MEET – 2026
      ST. JOSEPH'S COLLEGE (AUTONOMOUS)
      TIRUCHIRAPPALLI – 620002
      
      General Instructions:
      1. The last date for registration of men and women competitors for the 183rd Annual Sports Meet is 15th August 2026.
      2. The March Past Competition – Important Instructions :  All participating teams are strictly instructed not to use any religious, political, or other inappropriate symbols, banners, flags, slogans, or displays during the March Past competition to attract the attention of the judges. The March Past competition will be evaluated by an External Observer based on the following criteria:
         • Turnout
         • Marching
         • Coordination
      3. The draw of lots to determine the order of contingents for the March Past will be held at 10.00 a.m. on 20 August 2026.
      4. Departments must register participants for Athletics and Tug of War through the prescribed Google Form.
      5. During the Tug of War competition, the concerned department staff-in-charge must be present. All competitors must produce their valid College Identity Cards during the competition for verification by the officials. Failure to do so will result in the immediate disqualification of the team. This rule is enforced to ensure:
         • Safety
         • Fair Play
         • Accountability
         • Smooth Conduct of Events
      6. Final Round Selection of Athletes
         • The names of athletes qualified from the heats for the finals will be communicated to the Department Sports Coordinators through the official WhatsApp group.
         • Sports Coordinators must ensure that the selected athletes report on time for their respective events.
         • Late arrivals will not be permitted to participate.
      7. Departments are requested to ensure that their athletes are present and ready by 3.00 p.m. on 20 August 2026 for March past Rehearsal, and as most prize distributions will take place at that time for sixteen events.
      8. The schedule and order of Athletics and Tug of War events are subject to change at the discretion of the Organizing Committee.
      Sports Equipment for Departmental Trials:
      9. Departments requesting sports equipment for selection trials must follow these guidelines:
         • Submit a request letter signed by the Department Sports Coordinator or the concerned faculty member.
         • The team representative must produce the signed request letter while collecting the equipment.
         • Equipment will be issued only in the presence of the concerned team members.
         • Departments are responsible for the proper handling, safe use, and timely return of all equipment.
      Communication:
      11. An official WhatsApp group will be created for all Department Sports Coordinators. All announcements, schedules, and updates regarding Athletics and Tug of War will be communicated through this group. Sports Coordinators are requested to monitor the group regularly.
      12. Student Grievances:
         • Students having any doubts or issues during the Sports Meet should first approach their respective Department Sports Coordinators. The Sports Coordinator will communicate the matter to the Organizing Committee, if necessary.
      Medical and Safety:
      13. Only students who have been medically declared fit by a qualified healthcare professional will be permitted to participate in the Sports Meet.
      14. First-aid personnel will be available throughout the Sports Meet.
      Chest Numbers:
      15. The Department of Physical Education will issue chest numbers to all participating departments for the Sports Meet Competitions. All participants are instructed to wear their allotted chest numbers during the competitions. The chest numbers must be returned to the Department of Physical Education immediately after the completion of the Sports event.
      Verification of Medal Winners:
      16. All medal winners in Athletics must produce their College Identity Card to the Athletics Judges for verification of their name and department before leaving the competition venue.
    </pre>
  );

  // Determine which content to render
  const content = isDates ? datesContent : (pdfPath ? pdfContent : defaultContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-['Poppins'] text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          {content}
          {downloaded && !pdfPath && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{title} PDF downloaded successfully to your device!</span>
            </div>
          )}
        </div>
        {!isDates && (
          <div className="p-4 bg-slate-50 border-t flex justify-end">
            <a 
              href={pdfPath || "/Img/Sports Day 2026 -General Instructions.pdf"}
              download
              className="bg-blue-600 text-white py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors text-decoration-none"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
