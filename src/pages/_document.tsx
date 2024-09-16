import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" id="manifest-file" />
        <meta name="theme-color" content="#fff" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        ></meta>
      </Head>
      <body>
        <div id="modal_portal" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
