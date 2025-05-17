import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MVCCTJJ4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Facebook SDK */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.fbAsyncInit = function() {
                  FB.init({
                    appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                    xfbml: true,
                    version: 'v17.0'
                  });
                };
              `,
          }}
        />
        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/en_US/sdk.js"
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
