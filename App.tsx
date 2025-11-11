import React, { Suspense, useEffect, useCallback, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import { tools } from './utils/tools';
import useLocalStorage from './hooks/useLocalStorage';
import { isWebGLAvailable } from './utils/webgl';
import useIsDesktop from './hooks/useIsDesktop';
import { ApiKeyProvider } from './context/ApiKeyContext';
import ApiKeyGate from './components/ApiKeyGate';
import DeepSeekApiKeyGate from './components/DeepSeekApiKeyGate';

// Lazy load the heavy 3D background
const ThreeBackground = React.lazy(() => import('./components/ThreeBackground'));

// Lazy load legal pages
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/legal/TermsOfService'));
const ContactUs = React.lazy(() => import('./pages/legal/ContactUs'));


const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-brand-bg">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);

const ScrollToAnchor: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Use a timeout to ensure the element is rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      // Scroll to top on new page navigation without a hash
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return null;
};


const App: React.FC = () => {
  const [animationEnabled, setAnimationEnabled] = useLocalStorage('animationEnabled', true);
  // Perform the WebGL check once on initial render and store the result in state.
  const [animationAvailable, setAnimationAvailable] = React.useState(() => isWebGLAvailable());
  const isDesktop = useIsDesktop(); // Check if the screen is desktop-sized

  const handleToggleAnimation = () => {
    setAnimationEnabled((prev: boolean) => !prev);
  }
  
  // This callback now serves as a secondary fallback if the renderer fails to initialize
  // even after the initial check passes.
  const handleAnimationError = useCallback(() => {
    if (animationAvailable) {
        console.warn("Disabling 3D background due to an unexpected initialization error.");
        setAnimationAvailable(false);
        setAnimationEnabled(false);
    }
  }, [animationAvailable, setAnimationEnabled]);

  useEffect(() => {
    const injectSchema = async () => {
        try {
            const response = await fetch('./metadata.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const metadata = await response.json();

            // @ts-ignore
            if (metadata.schema && !document.getElementById('schema-markup')) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.id = 'schema-markup';
                // @ts-ignore
                script.innerHTML = JSON.stringify(metadata.schema);
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error("Failed to load and inject schema markup:", error);
        }
    };

    injectSchema();
  }, []);

  return (
    <ApiKeyProvider>
      <HashRouter>
        <ScrollToAnchor />
        {/* Only render the heavy 3D background on desktop devices */}
        {isDesktop && animationEnabled && animationAvailable && (
          <Suspense fallback={null}>
            <ThreeBackground onInitError={handleAnimationError} />
          </Suspense>
        )}
        <div className="flex flex-col min-h-screen relative z-10">
          <Header 
            animationEnabled={animationEnabled} 
            onToggleAnimation={handleToggleAnimation}
            // Only show animation toggle if it's available and on desktop
            animationAvailable={isDesktop && animationAvailable}
          />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {tools.map((tool) => {
                  const ToolComponent = tool.component;
                  const provider = tool.apiProvider;
                  
                  let element = <ToolComponent />;

                  if (provider === 'gemini' || provider === 'google-psi') {
                    element = <ApiKeyGate>{element}</ApiKeyGate>;
                  } else if (provider === 'deepseek') {
                    element = <DeepSeekApiKeyGate>{element}</DeepSeekApiKeyGate>;
                  }

                  return (
                    <Route
                      key={tool.path}
                      path={tool.path}
                      element={element}
                    />
                  );
                })}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/contact-us" element={<ContactUs />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ApiKeyProvider>
  );
};

export default App;
