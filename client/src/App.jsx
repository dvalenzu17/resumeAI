import { Routes, Route } from 'react-router-dom';
import CookieBanner from './lib/CookieBanner.jsx';
import UploadView from './views/UploadView.jsx';
import ProcessingView from './views/ProcessingView.jsx';
import PreviewView from './views/PreviewView.jsx';
import SuccessView from './views/SuccessView.jsx';
import PrivacyView from './views/PrivacyView.jsx';
import TermsView from './views/TermsView.jsx';
import RefundView from './views/RefundView.jsx';
import NotFoundView from './views/NotFoundView.jsx';
import FeedbackView from './views/FeedbackView.jsx';
import AdminView from './views/AdminView.jsx';
import RedownloadView from './views/RedownloadView.jsx';
import BlogIndex from './views/blog/BlogIndex.jsx';
import HowAtsSystemsWork from './views/blog/HowAtsSystemsWork.jsx';
import ResumeKeywords from './views/blog/ResumeKeywords.jsx';
import SoftwareEngineerResume from './views/blog/SoftwareEngineerResume.jsx';
import WhatIsAts from './views/blog/WhatIsAts.jsx';
import HowToBeatAts from './views/blog/HowToBeatAts.jsx';
import AtsResumeKeywords from './views/blog/AtsResumeKeywords.jsx';
import AtsResumeCheckerFree from './views/blog/AtsResumeCheckerFree.jsx';
import JobscanAlternative from './views/blog/JobscanAlternative.jsx';
import TailorResumeJobDescription from './views/blog/TailorResumeJobDescription.jsx';
import AtsResumeFormat from './views/blog/AtsResumeFormat.jsx';
import ResumeKeywordsMissing from './views/blog/ResumeKeywordsMissing.jsx';
import AtsScoreMeaning from './views/blog/AtsScoreMeaning.jsx';
import ComoPasarElAts from './views/blog/ComoPasarElAts.jsx';

export default function App() {
  return (
    <>
    <CookieBanner />
    <Routes>
      <Route path="/" element={<UploadView />} />
      <Route path="/processing" element={<ProcessingView />} />
      <Route path="/preview" element={<PreviewView />} />
      <Route path="/success" element={<SuccessView />} />
      <Route path="/privacy" element={<PrivacyView />} />
      <Route path="/terms" element={<TermsView />} />
      <Route path="/refunds" element={<RefundView />} />
      <Route path="/feedback" element={<FeedbackView />} />
      <Route path="/admin" element={<AdminView />} />
      <Route path="/redownload" element={<RedownloadView />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/how-ats-systems-work" element={<HowAtsSystemsWork />} />
      <Route path="/blog/resume-keywords" element={<ResumeKeywords />} />
      <Route path="/blog/software-engineer-resume" element={<SoftwareEngineerResume />} />
      <Route path="/blog/what-is-ats" element={<WhatIsAts />} />
      <Route path="/blog/how-to-beat-ats" element={<HowToBeatAts />} />
      <Route path="/blog/ats-resume-keywords" element={<AtsResumeKeywords />} />
      <Route path="/blog/ats-resume-checker-free" element={<AtsResumeCheckerFree />} />
      <Route path="/blog/jobscan-alternative" element={<JobscanAlternative />} />
      <Route path="/blog/tailor-resume-job-description" element={<TailorResumeJobDescription />} />
      <Route path="/blog/ats-resume-format" element={<AtsResumeFormat />} />
      <Route path="/blog/resume-keywords-missing" element={<ResumeKeywordsMissing />} />
      <Route path="/blog/ats-score-meaning" element={<AtsScoreMeaning />} />
      <Route path="/blog/es/como-pasar-el-ats" element={<ComoPasarElAts />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
    </>
  );
}
