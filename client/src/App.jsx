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
      <Route path="*" element={<NotFoundView />} />
    </Routes>
    </>
  );
}
