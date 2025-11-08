import { useState, useEffect } from 'react';

const useIsDesktop = (breakpoint = 768): boolean => {
    // Initialize state with the current window width
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > breakpoint);

    useEffect(() => {
        // Handler to call on window resize
        const handleResize = () => {
            setIsDesktop(window.innerWidth > breakpoint);
        };

        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]); // Only re-run effect if breakpoint changes

    return isDesktop;
};

export default useIsDesktop;
