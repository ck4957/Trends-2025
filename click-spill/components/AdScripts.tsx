import Script from "next/script";
import { AD_CONFIGS, PROFITABLE_RATE_ADS, AdConfig } from "../utils/adsConfig";

const generateHPFAdScript = (configs: AdConfig[]) => {
  return `
    // Ad configuration and injection logic
    const adConfigs = ${JSON.stringify(configs)};
    
    function injectHPFAd(config) {
      const atOptions = {
        'key': config.key,
        'format': config.format,
        'height': config.height,
        'width': config.width,
        'params': {}
      };
      
      // Find target container
      let targetContainer = null;
      for (const containerId of config.targetContainers) {
        targetContainer = document.getElementById(containerId);
        if (targetContainer) break;
      }
      
      if (targetContainer && atOptions) {
        // Set options globally for this ad
        window.atOptions = atOptions;
        
        // Clear existing content
        targetContainer.innerHTML = '';
        
        // Create and inject ad script
        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.src = \`//www.highperformanceformat.com/\${config.key}/invoke.js\`;
        
        targetContainer.appendChild(adScript);
        
        console.log(\`HPF ad (\${config.id}) injected into: \${targetContainer.id}\`);
      } else {
        console.log(\`Container not found for \${config.id}, retrying...\`);
        setTimeout(() => injectHPFAd(config), 1000);
      }
    }
    
    function initializeAds() {
      adConfigs.forEach((config, index) => {
        setTimeout(() => {
          injectHPFAd(config);
        }, config.delay || (index * 1000));
      });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAds);
    } else {
      initializeAds();
    }
    
    // Hide unwanted bottom ads
    const style = document.createElement('style');
    style.textContent = \`
      body > div[style*="position: fixed"]:not(.allowed-ad),
      body > div[style*="position: absolute"]:not(.allowed-ad) {
        display: none !important;
      }
    \`;
    document.head.appendChild(style);
  `;
};

export const AdScripts: React.FC = () => {
  return (
    <>
      {/* HPF Ads Configuration */}
      <Script
        id="hpf-ads-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: generateHPFAdScript(AD_CONFIGS),
        }}
      />

      {/* Profitable Rate Ads */}
      {PROFITABLE_RATE_ADS.map((ad) => (
        <Script
          key={ad.id}
          id={ad.id}
          src={ad.src}
          strategy="afterInteractive"
        />
      ))}

      {/* Google Analytics */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-CKLFFYDFCZ"
      />
      <Script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CKLFFYDFCZ');
          `,
        }}
      />
    </>
  );
};
