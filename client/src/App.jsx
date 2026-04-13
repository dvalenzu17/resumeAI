import { Routes, Route } from 'react-router-dom';
import UploadView from './views/UploadView.jsx';
import ProcessingView from './views/ProcessingView.jsx';
import PreviewView from './views/PreviewView.jsx';
import SuccessView from './views/SuccessView.jsx';
import PrivacyView from './views/PrivacyView.jsx';
import TermsView from './views/TermsView.jsx';
import NotFoundView from './views/NotFoundView.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadView />} />
      <Route path="/processing" element={<ProcessingView />} />
      <Route path="/preview" element={<PreviewView />} />
      <Route path="/success" element={<SuccessView />} />
      <Route path="/privacy" element={<PrivacyView />} />
      <Route path="/terms" element={<TermsView />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}
